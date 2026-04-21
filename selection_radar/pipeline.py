"""Core pipeline orchestration for Selection Radar."""

from __future__ import annotations

import json
import logging
from datetime import datetime

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
from selection_radar.normalization import (
    normalize_product_name,
    to_chinese_display_name,
    to_english_display_name,
)
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
        aliases: dict[str, str] = {}
        for post in pending_posts:
            candidates = self.extractor.extract_from_text(
                title=post.title,
                content=post.content,
            )
            for candidate in candidates:
                normalized_name = normalize_product_name(candidate.name)
                display_name_cn = to_chinese_display_name(candidate.name)
                aliases[normalized_name] = display_name_cn
                products.append(
                    Product(
                        raw_post_id=post.id,
                        name=normalized_name,
                        category=candidate.category,
                        keywords=candidate.keywords,
                        emotion_tag=candidate.emotion_tag,
                    )
                )
        if products:
            self.db.insert_products(products)
            self.db.upsert_product_aliases(aliases)
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
            result = self.classifier.to_result(
                score=score,
                opportunity_type=classification,
                emotion_tag=product.emotion_tag,
                category=product.category,
            )
            self.db.upsert_score(product.id, score, result)
            upserts += 1
        LOGGER.info("Scored %s products", upserts)
        return upserts

    def write_outputs(self) -> None:
        rows = self.db.fetch_joined_results()
        aliases = self.db.fetch_product_aliases()
        aggregated: dict[str, dict] = {}
        for row in rows:
            product_key_name = str(row["product_name"])
            product_en = to_english_display_name(product_key_name)
            product_key = normalize_product_name(product_en)
            display_cn = aliases.get(product_key, to_chinese_display_name(product_en))
            metrics = json.loads(row["metrics"])
            entry = aggregated.get(product_key)
            if entry is None:
                entry = {
                    "product_key": product_key,
                    "product_en": product_en,
                    "product_cn": display_cn,
                    "product_display": f"{display_cn}（{product_en}）",
                    "category": row["category"],
                    "emotion_tag": bool(row["emotion_tag"]),
                    "trend_score": float(row["trend_score"]),
                    "profit_score": float(row["profit_score"]),
                    "competition_score": float(row["competition_score"]),
                    "emotion_score": float(row["emotion_score"]),
                    "new_trend_score": float(row["new_trend_score"]),
                    "total_score": float(row["total_score"]),
                    "classification": row["classification"],
                    "verdict": row["verdict"],
                    "reason": row["reason"],
                    "tags": json.loads(row["tags"]),
                    "metrics": metrics,
                    "labels": metrics.get("labels", []),
                    "strategy": metrics.get("strategy", ""),
                    "estimated_daily_revenue": float(metrics.get("estimated_daily_revenue", 0.0)),
                    "revenue_level": metrics.get("revenue_level", "低"),
                    "test_cost": float(metrics.get("test_cost", 0.0)),
                    "daily_budget": float(metrics.get("daily_budget", 0.0)),
                    "scale_cost": float(metrics.get("scale_cost", 0.0)),
                    "playbook": metrics.get("playbook", "低价冲量打法"),
                    "decision_summary": metrics.get("decision_summary", ""),
                    "decision_why": metrics.get("decision_why", ""),
                    "decision_how": metrics.get("decision_how", ""),
                    "decision_ads": metrics.get("decision_ads", ""),
                    "source_platforms": [],
                    "source_count": 0,
                }
                aggregated[product_key] = entry
            if row["platform"] not in entry["source_platforms"]:
                entry["source_platforms"].append(row["platform"])
            entry["source_count"] = len(entry["source_platforms"])
            if float(row["total_score"]) > float(entry["total_score"]):
                entry["trend_score"] = float(row["trend_score"])
                entry["profit_score"] = float(row["profit_score"])
                entry["competition_score"] = float(row["competition_score"])
                entry["emotion_score"] = float(row["emotion_score"])
                entry["new_trend_score"] = float(row["new_trend_score"])
                entry["total_score"] = float(row["total_score"])
                entry["classification"] = row["classification"]
                entry["verdict"] = row["verdict"]
                entry["reason"] = row["reason"]
                entry["tags"] = json.loads(row["tags"])
                entry["metrics"] = metrics
                entry["labels"] = metrics.get("labels", [])
                entry["strategy"] = metrics.get("strategy", "")
                entry["estimated_daily_revenue"] = float(metrics.get("estimated_daily_revenue", 0.0))
                entry["revenue_level"] = metrics.get("revenue_level", "低")
                entry["test_cost"] = float(metrics.get("test_cost", 0.0))
                entry["daily_budget"] = float(metrics.get("daily_budget", 0.0))
                entry["scale_cost"] = float(metrics.get("scale_cost", 0.0))
                entry["playbook"] = metrics.get("playbook", "低价冲量打法")
                entry["decision_summary"] = metrics.get("decision_summary", "")
                entry["decision_why"] = metrics.get("decision_why", "")
                entry["decision_how"] = metrics.get("decision_how", "")
                entry["decision_ads"] = metrics.get("decision_ads", "")

        json_rows = sorted(aggregated.values(), key=lambda item: float(item["total_score"]), reverse=True)

        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        json_path = self.settings.output_dir / f"opportunities_{timestamp}.json"
        md_path = self.settings.output_dir / f"opportunities_{timestamp}.md"
        json_path.write_text(json.dumps(json_rows, ensure_ascii=False, indent=2), encoding="utf-8")
        md_path.write_text(render_grouped_markdown(json_rows), encoding="utf-8")

    def load_aggregated_results(self) -> list[dict]:
        """Load product-level merged rows for dashboard and API-like consumers."""
        rows = self.db.fetch_joined_results()
        aliases = self.db.fetch_product_aliases()
        aggregated: dict[str, dict] = {}
        for row in rows:
            product_key_name = str(row["product_name"])
            product_en = to_english_display_name(product_key_name)
            product_key = normalize_product_name(product_en)
            display_cn = aliases.get(product_key, to_chinese_display_name(product_en))
            metrics = json.loads(row["metrics"])
            entry = aggregated.get(product_key)
            if entry is None:
                entry = {
                    "product_key": product_key,
                    "product_en": product_en,
                    "product_cn": display_cn,
                    "product_display": f"{display_cn}（{product_en}）",
                    "category": row["category"],
                    "emotion_tag": bool(row["emotion_tag"]),
                    "trend_score": float(row["trend_score"]),
                    "profit_score": float(row["profit_score"]),
                    "competition_score": float(row["competition_score"]),
                    "emotion_score": float(row["emotion_score"]),
                    "new_trend_score": float(row["new_trend_score"]),
                    "total_score": float(row["total_score"]),
                    "classification": row["classification"],
                    "verdict": row["verdict"],
                    "reason": row["reason"],
                    "tags": json.loads(row["tags"]),
                    "metrics": metrics,
                    "labels": metrics.get("labels", []),
                    "strategy": metrics.get("strategy", ""),
                    "estimated_daily_revenue": float(metrics.get("estimated_daily_revenue", 0.0)),
                    "revenue_level": metrics.get("revenue_level", "低"),
                    "test_cost": float(metrics.get("test_cost", 0.0)),
                    "daily_budget": float(metrics.get("daily_budget", 0.0)),
                    "scale_cost": float(metrics.get("scale_cost", 0.0)),
                    "playbook": metrics.get("playbook", "低价冲量打法"),
                    "decision_summary": metrics.get("decision_summary", ""),
                    "decision_why": metrics.get("decision_why", ""),
                    "decision_how": metrics.get("decision_how", ""),
                    "decision_ads": metrics.get("decision_ads", ""),
                    "source_platforms": [],
                    "source_count": 0,
                }
                aggregated[product_key] = entry
            if row["platform"] not in entry["source_platforms"]:
                entry["source_platforms"].append(row["platform"])
            entry["source_count"] = len(entry["source_platforms"])
            if float(row["total_score"]) > float(entry["total_score"]):
                entry["trend_score"] = float(row["trend_score"])
                entry["profit_score"] = float(row["profit_score"])
                entry["competition_score"] = float(row["competition_score"])
                entry["emotion_score"] = float(row["emotion_score"])
                entry["new_trend_score"] = float(row["new_trend_score"])
                entry["total_score"] = float(row["total_score"])
                entry["classification"] = row["classification"]
                entry["verdict"] = row["verdict"]
                entry["reason"] = row["reason"]
                entry["tags"] = json.loads(row["tags"])
                entry["metrics"] = metrics
                entry["labels"] = metrics.get("labels", [])
                entry["strategy"] = metrics.get("strategy", "")
                entry["estimated_daily_revenue"] = float(metrics.get("estimated_daily_revenue", 0.0))
                entry["revenue_level"] = metrics.get("revenue_level", "低")
                entry["test_cost"] = float(metrics.get("test_cost", 0.0))
                entry["daily_budget"] = float(metrics.get("daily_budget", 0.0))
                entry["scale_cost"] = float(metrics.get("scale_cost", 0.0))
                entry["playbook"] = metrics.get("playbook", "低价冲量打法")
                entry["decision_summary"] = metrics.get("decision_summary", "")
                entry["decision_why"] = metrics.get("decision_why", "")
                entry["decision_how"] = metrics.get("decision_how", "")
                entry["decision_ads"] = metrics.get("decision_ads", "")
        return sorted(aggregated.values(), key=lambda item: float(item["total_score"]), reverse=True)

    @staticmethod
    def _calc_social_growth_ratio(post) -> float:
        # Simplified growth proxy using engagement density in MVP.
        engagement = post.likes + post.comments
        if post.views <= 0:
            return 1.0
        ratio = (engagement / max(post.views, 1)) * 30.0
        return max(0.1, min(5.0, ratio))
