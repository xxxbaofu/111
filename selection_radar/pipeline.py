"""Core pipeline orchestration for Selection Radar."""

from __future__ import annotations

import json
import logging
from datetime import datetime
from pathlib import Path

from selection_radar.ai.extractor import ProductExtractor
from selection_radar.classifier import OpportunityClassifier
from selection_radar.collectors.google_trends import GoogleTrendsCollector
from selection_radar.collectors.market_validation import MarketValidationCollector
from selection_radar.collectors.reddit import RedditCollector
from selection_radar.collectors.tiktok import TikTokCollector
from selection_radar.collectors.x_trends import XTrendsCollector
from selection_radar.config import Settings
from selection_radar.database import Database
from selection_radar.models import MarketData, Product
from selection_radar.output import render_grouped_markdown
from selection_radar.scoring import ScoringEngine


LOGGER = logging.getLogger(__name__)


class SelectionRadarPipeline:
    """Implements the 5-step daily workflow."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.db = Database(settings.db_path)
        self.extractor = ProductExtractor(settings)
        self.scorer = ScoringEngine()
        self.classifier = OpportunityClassifier()

        self.tiktok = TikTokCollector(settings)
        self.reddit = RedditCollector(settings)
        self.x_collector = XTrendsCollector(settings)
        self.market = MarketValidationCollector(settings)
        self.gtrends = GoogleTrendsCollector(settings)

        self.settings.output_dir.mkdir(parents=True, exist_ok=True)

    def run_all(self) -> dict[str, int]:
        summary: dict[str, int] = {}
        summary["raw_posts"] = self.run_data_collection()
        summary["products"] = self.run_ai_extraction()
        summary["market_rows"] = self.run_market_validation()
        summary["scores"] = self.run_scoring_and_classification()
        self.write_outputs()
        return summary

    def run_data_collection(self) -> int:
        posts = []
        posts.extend(self.tiktok.collect())
        posts.extend(self.reddit.collect())
        posts.extend(self.x_collector.collect())
        count = len(posts)
        if posts:
            self.db.insert_raw_posts(posts)
        LOGGER.info("Collected %s raw posts", count)
        return count

    def run_ai_extraction(self) -> int:
        pending_posts = self.db.fetch_raw_posts_without_products()
        if not pending_posts:
            return 0
        products: list[Product] = []
        for post in pending_posts:
            candidates = self.extractor.extract_from_text(
                title=post.title,
                content=post.content,
            )
            for candidate in candidates:
                products.append(
                    Product(
                        raw_post_id=post.id,
                        name=candidate.name,
                        category=candidate.category,
                        keywords=candidate.keywords,
                        emotion_tag=candidate.emotion_tag,
                    )
                )
        if products:
            self.db.insert_products(products)
        LOGGER.info("Extracted %s products", len(products))
        return len(products)

    def run_market_validation(self) -> int:
        products = self.db.fetch_products_without_market_data()
        if not products:
            return 0
        rows: list[MarketData] = []
        for product in products:
            rows.extend(self.market.collect_for_product(product.id, product.name))
        if rows:
            self.db.upsert_market_data(rows)
        LOGGER.info("Validated market rows=%s", len(rows))
        return len(rows)

    def run_scoring_and_classification(self) -> int:
        products = self.db.fetch_products_for_scoring()
        if not products:
            return 0

        trend_signals = self.gtrends.collect_for_keywords({p.name for p in products})
        upserts = 0
        for product in products:
            post = self.db.fetch_raw_post_for_product(product.id)
            if post is None:
                continue
            market_rows = self.db.fetch_market_data_for_product(product.id)
            trend_signal = trend_signals.get(product.name)
            score = self.scorer.score(
                views=post.views,
                growth_ratio=self._calc_social_growth_ratio(post),
                market_rows=market_rows,
                emotion_tag=product.emotion_tag,
                trend_ratio=(trend_signal.last3_vs_prev_ratio if trend_signal else 1.0),
            )
            classification = self.classifier.classify(score, product.emotion_tag)
            result = self.classifier.to_result(score, classification)
            self.db.upsert_score(product.id, score, result)
            upserts += 1
        LOGGER.info("Scored %s products", upserts)
        return upserts

    def write_outputs(self) -> None:
        rows = self.db.fetch_joined_results()
        json_rows = []
        for row in rows:
            json_rows.append(
                {
                    "product": row["product_name"],
                    "category": row["category"],
                    "emotion_tag": bool(row["emotion_tag"]),
                    "trend_score": row["trend_score"],
                    "profit_score": row["profit_score"],
                    "competition_score": row["competition_score"],
                    "emotion_score": row["emotion_score"],
                    "new_trend_score": row["new_trend_score"],
                    "total_score": row["total_score"],
                    "classification": row["classification"],
                    "verdict": row["verdict"],
                    "reason": row["reason"],
                    "tags": json.loads(row["tags"]),
                    "metrics": json.loads(row["metrics"]),
                }
            )

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        json_path = self.settings.output_dir / f"opportunities_{timestamp}.json"
        md_path = self.settings.output_dir / f"opportunities_{timestamp}.md"
        json_path.write_text(json.dumps(json_rows, ensure_ascii=False, indent=2), encoding="utf-8")
        md_path.write_text(render_grouped_markdown(json_rows), encoding="utf-8")

    @staticmethod
    def _calc_social_growth_ratio(post) -> float:
        # Simplified growth proxy using engagement density in MVP.
        engagement = post.likes + post.comments
        if post.views <= 0:
            return 1.0
        ratio = (engagement / max(post.views, 1)) * 30.0
        return max(0.1, min(5.0, ratio))
