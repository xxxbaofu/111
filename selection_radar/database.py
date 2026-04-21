"""SQLite storage layer for Selection Radar."""

from __future__ import annotations

import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Iterable

from selection_radar.models import (
    MarketData,
    OpportunityResult,
    PersistedProduct,
    PersistedRawPost,
    Product,
    RawPost,
    ScoreBreakdown,
)

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS raw_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_post_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    keywords TEXT NOT NULL,
    emotion_tag INTEGER NOT NULL DEFAULT 0,
    UNIQUE(raw_post_id, name),
    FOREIGN KEY(raw_post_id) REFERENCES raw_posts(id)
);

CREATE TABLE IF NOT EXISTS market_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    source TEXT NOT NULL,
    price REAL NOT NULL,
    cost REAL NOT NULL,
    review_count INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 0,
    UNIQUE(product_id, source),
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS scores (
    product_id INTEGER PRIMARY KEY,
    trend_score REAL NOT NULL,
    profit_score REAL NOT NULL,
    competition_score REAL NOT NULL,
    emotion_score REAL NOT NULL,
    new_trend_score REAL NOT NULL,
    total_score REAL NOT NULL,
    classification TEXT NOT NULL,
    verdict TEXT NOT NULL,
    reason TEXT NOT NULL,
    tags TEXT NOT NULL,
    metrics TEXT NOT NULL,
    FOREIGN KEY(product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS product_aliases (
    normalized_name TEXT PRIMARY KEY,
    display_name_cn TEXT NOT NULL
);
"""


class Database:
    """Simple repository around sqlite3 operations."""

    def __init__(self, db_path: Path) -> None:
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(SCHEMA_SQL)

    def insert_raw_posts(self, posts: Iterable[RawPost]) -> list[int]:
        query = """
        INSERT INTO raw_posts (platform, title, content, views, likes, comments, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        ids: list[int] = []
        with self._connect() as conn:
            for post in posts:
                cursor = conn.execute(
                    query,
                    (
                        post.platform,
                        post.title,
                        post.content,
                        post.views,
                        post.likes,
                        post.comments,
                        post.created_at.isoformat(),
                    ),
                )
                ids.append(int(cursor.lastrowid))
        return ids

    def insert_products(self, products: Iterable[Product]) -> list[int]:
        query = """
        INSERT INTO products (raw_post_id, name, category, keywords, emotion_tag)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(raw_post_id, name) DO UPDATE SET
            category=excluded.category,
            keywords=excluded.keywords,
            emotion_tag=excluded.emotion_tag
        """
        ids: list[int] = []
        with self._connect() as conn:
            for product in products:
                cursor = conn.execute(
                    query,
                    (
                        product.raw_post_id,
                        product.name,
                        product.category,
                        json.dumps(product.keywords, ensure_ascii=True),
                        int(product.emotion_tag),
                    ),
                )
                if cursor.lastrowid:
                    ids.append(int(cursor.lastrowid))
                else:
                    row = conn.execute(
                        "SELECT id FROM products WHERE raw_post_id = ? AND name = ?",
                        (product.raw_post_id, product.name),
                    ).fetchone()
                    if row:
                        ids.append(int(row["id"]))
        return ids

    def upsert_market_data(self, market_data: Iterable[MarketData]) -> None:
        query = """
        INSERT INTO market_data (product_id, source, price, cost, review_count, rating)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id, source) DO UPDATE SET
            price=excluded.price,
            cost=excluded.cost,
            review_count=excluded.review_count,
            rating=excluded.rating
        """
        with self._connect() as conn:
            for data in market_data:
                conn.execute(
                    query,
                    (
                        data.product_id,
                        data.source,
                        data.price,
                        data.cost,
                        data.review_count,
                        data.rating,
                    ),
                )

    def upsert_score(self, product_id: int, score: ScoreBreakdown, result: OpportunityResult) -> None:
        query = """
        INSERT INTO scores (
            product_id, trend_score, profit_score, competition_score, emotion_score,
            new_trend_score, total_score, classification, verdict, reason, tags, metrics
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(product_id) DO UPDATE SET
            trend_score=excluded.trend_score,
            profit_score=excluded.profit_score,
            competition_score=excluded.competition_score,
            emotion_score=excluded.emotion_score,
            new_trend_score=excluded.new_trend_score,
            total_score=excluded.total_score,
            classification=excluded.classification,
            verdict=excluded.verdict,
            reason=excluded.reason,
            tags=excluded.tags,
            metrics=excluded.metrics
        """
        with self._connect() as conn:
            conn.execute(
                query,
                (
                    product_id,
                    score.trend_score,
                    score.profit_score,
                    score.competition_score,
                    score.emotion_score,
                    score.new_trend_score,
                    score.total_score,
                    result.opportunity_type,
                    result.verdict,
                    result.reason,
                    json.dumps(result.tags, ensure_ascii=True),
                    json.dumps(result.metrics, ensure_ascii=True),
                ),
            )

    def upsert_product_aliases(self, aliases: dict[str, str]) -> None:
        if not aliases:
            return
        query = """
        INSERT INTO product_aliases (normalized_name, display_name_cn)
        VALUES (?, ?)
        ON CONFLICT(normalized_name) DO UPDATE SET
            display_name_cn=excluded.display_name_cn
        """
        with self._connect() as conn:
            for normalized_name, display_name_cn in aliases.items():
                conn.execute(query, (normalized_name, display_name_cn))

    def fetch_product_aliases(self) -> dict[str, str]:
        query = "SELECT normalized_name, display_name_cn FROM product_aliases"
        with self._connect() as conn:
            rows = conn.execute(query).fetchall()
        return {str(row["normalized_name"]): str(row["display_name_cn"]) for row in rows}

    def fetch_raw_posts_without_products(self) -> list[PersistedRawPost]:
        query = """
        SELECT rp.*
        FROM raw_posts rp
        LEFT JOIN products p ON p.raw_post_id = rp.id
        WHERE p.id IS NULL
        ORDER BY rp.id ASC
        """
        with self._connect() as conn:
            rows = conn.execute(query).fetchall()
        return [self._to_raw_post(row) for row in rows]

    def fetch_products_without_market_data(self) -> list[PersistedProduct]:
        query = """
        SELECT p.*
        FROM products p
        LEFT JOIN market_data m ON m.product_id = p.id
        WHERE m.id IS NULL
        ORDER BY p.id ASC
        """
        with self._connect() as conn:
            rows = conn.execute(query).fetchall()
        return [self._to_product(row) for row in rows]

    def fetch_products_for_scoring(self) -> list[PersistedProduct]:
        query = """
        SELECT DISTINCT p.*
        FROM products p
        JOIN market_data m ON m.product_id = p.id
        ORDER BY p.id ASC
        """
        with self._connect() as conn:
            rows = conn.execute(query).fetchall()
        return [self._to_product(row) for row in rows]

    def fetch_raw_post_for_product(self, product_id: int) -> PersistedRawPost | None:
        query = """
        SELECT rp.*
        FROM raw_posts rp
        JOIN products p ON p.raw_post_id = rp.id
        WHERE p.id = ?
        """
        with self._connect() as conn:
            row = conn.execute(query, (product_id,)).fetchone()
        if row is None:
            return None
        return self._to_raw_post(row)

    def fetch_market_data_for_product(self, product_id: int) -> list[MarketData]:
        query = "SELECT * FROM market_data WHERE product_id = ? ORDER BY source ASC"
        with self._connect() as conn:
            rows = conn.execute(query, (product_id,)).fetchall()
        return [
            MarketData(
                product_id=int(row["product_id"]),
                source=str(row["source"]),
                price=float(row["price"]),
                cost=float(row["cost"]),
                review_count=int(row["review_count"]),
                rating=float(row["rating"]),
            )
            for row in rows
        ]

    def fetch_joined_results(self) -> list[sqlite3.Row]:
        query = """
        SELECT
            p.id AS product_id,
            p.name AS product_name,
            p.category,
            p.emotion_tag,
            rp.platform,
            s.trend_score,
            s.profit_score,
            s.competition_score,
            s.emotion_score,
            s.new_trend_score,
            s.total_score,
            s.classification,
            s.verdict,
            s.reason,
            s.tags,
            s.metrics
        FROM scores s
        JOIN products p ON p.id = s.product_id
        JOIN raw_posts rp ON rp.id = p.raw_post_id
        ORDER BY s.total_score DESC
        """
        with self._connect() as conn:
            return conn.execute(query).fetchall()

    @staticmethod
    def _to_raw_post(row: sqlite3.Row) -> PersistedRawPost:
        return PersistedRawPost(
            id=int(row["id"]),
            platform=str(row["platform"]),
            title=str(row["title"]),
            content=str(row["content"]),
            views=int(row["views"]),
            likes=int(row["likes"]),
            comments=int(row["comments"]),
            created_at=datetime.fromisoformat(str(row["created_at"])),
        )

    @staticmethod
    def _to_product(row: sqlite3.Row) -> PersistedProduct:
        return PersistedProduct(
            id=int(row["id"]),
            raw_post_id=int(row["raw_post_id"]),
            name=str(row["name"]),
            category=str(row["category"]),
            keywords=json.loads(str(row["keywords"])),
            emotion_tag=bool(row["emotion_tag"]),
        )
