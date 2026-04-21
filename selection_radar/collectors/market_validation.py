"""Amazon and Etsy market validation collectors."""

from __future__ import annotations

from selection_radar.collectors.base import seeded_int
from selection_radar.config import Settings
from selection_radar.models import MarketData


class MarketValidationCollector:
    """MVP collector that validates products against Amazon/Etsy proxies."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def collect_for_product(self, product_id: int, product_name: str) -> list[MarketData]:
        return [
            self._build_row(product_id, product_name, "amazon"),
            self._build_row(product_id, product_name, "etsy"),
        ]

    @staticmethod
    def _build_row(product_id: int, product_name: str, source: str) -> MarketData:
        price = round(seeded_int(f"{source}:{product_name}:price", 15, 130) + 0.99, 2)
        cost_ratio = seeded_int(f"{source}:{product_name}:cost_ratio", 25, 60) / 100
        cost = round(price * cost_ratio, 2)
        review_count = seeded_int(
            f"{source}:{product_name}:reviews",
            5 if source == "etsy" else 40,
            900 if source == "etsy" else 3000,
        )
        rating = seeded_int(f"{source}:{product_name}:rating10", 37, 50) / 10
        return MarketData(
            product_id=product_id,
            source=source,
            price=price,
            cost=cost,
            review_count=review_count,
            rating=rating,
        )
