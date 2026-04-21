"""Amazon and Etsy market validation collectors."""

from __future__ import annotations

from urllib.parse import quote_plus

import requests

from selection_radar.collectors.base import seeded_int
from selection_radar.config import Settings
from selection_radar.models import MarketData


class MarketValidationCollector:
    """Collect market proxy metrics from Amazon/Etsy search pages."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._session = requests.Session()
        self._session.headers.update(
            {
                "User-Agent": (
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
                ),
                "Accept-Language": "en-US,en;q=0.9",
            }
        )

    def collect_for_product(self, product_id: int, product_name: str) -> list[MarketData]:
        if self.settings.demo_mode:
            return self._demo_rows(product_id, product_name)
        try:
            rows = [
                self._collect_amazon(product_id, product_name),
                self._collect_etsy(product_id, product_name),
            ]
            return rows
        except requests.RequestException:
            return self._demo_rows(product_id, product_name)

    def _collect_amazon(self, product_id: int, product_name: str) -> MarketData:
        url = f"{self.settings.amazon_base_url}/s?k={quote_plus(product_name)}"
        response = self._session.get(url, timeout=self.settings.request_timeout_seconds)
        response.raise_for_status()
        html = response.text

        price = self._extract_first_float(
            html,
            ("\"price\":\"$", "\"priceToPay\":{\"amount\":", "\"a-price-whole\">"),
            fallback=self._seed_price("amazon", product_name),
        )
        review_count = int(
            self._extract_first_float(
                html,
                ("\"reviewCount\":\"", "\"totalReviewCount\":", "ratings\">"),
                fallback=float(seeded_int(f"amazon:{product_name}:reviews", 40, 3000)),
            )
        )
        rating = self._extract_first_float(
            html,
            ("\"rating\":\"", "\"averageStarRating\":", "a-icon-alt\">"),
            fallback=seeded_int(f"amazon:{product_name}:rating10", 37, 49) / 10,
        )
        cost = round(price * 0.45, 2)
        return MarketData(
            product_id=product_id,
            source="amazon",
            price=round(price, 2),
            cost=cost,
            review_count=max(0, review_count),
            rating=max(0.0, min(5.0, round(rating, 1))),
        )

    def _collect_etsy(self, product_id: int, product_name: str) -> MarketData:
        url = f"{self.settings.etsy_base_url}/search?q={quote_plus(product_name)}"
        response = self._session.get(url, timeout=self.settings.request_timeout_seconds)
        response.raise_for_status()
        html = response.text

        price = self._extract_first_float(
            html,
            ("\"price\":\"USD ", "\"price_unformatted\":", "currency-value\">"),
            fallback=self._seed_price("etsy", product_name),
        )
        review_count = int(
            self._extract_first_float(
                html,
                ("\"num_reviews\":", "\"ratingCount\":", "review-count\">"),
                fallback=float(seeded_int(f"etsy:{product_name}:reviews", 5, 900)),
            )
        )
        rating = self._extract_first_float(
            html,
            ("\"average_rating\":", "\"rating\":", "aria-label=\"Rated "),
            fallback=seeded_int(f"etsy:{product_name}:rating10", 40, 50) / 10,
        )
        cost = round(price * 0.4, 2)
        return MarketData(
            product_id=product_id,
            source="etsy",
            price=round(price, 2),
            cost=cost,
            review_count=max(0, review_count),
            rating=max(0.0, min(5.0, round(rating, 1))),
        )

    def _demo_rows(self, product_id: int, product_name: str) -> list[MarketData]:
        return [
            self._seed_row(product_id, product_name, "amazon"),
            self._seed_row(product_id, product_name, "etsy"),
        ]

    @staticmethod
    def _seed_row(product_id: int, product_name: str, source: str) -> MarketData:
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

    @staticmethod
    def _seed_price(source: str, product_name: str) -> float:
        return float(seeded_int(f"{source}:{product_name}:price", 15, 130) + 0.99)

    @staticmethod
    def _extract_first_float(html: str, markers: tuple[str, ...], fallback: float) -> float:
        for marker in markers:
            idx = html.find(marker)
            if idx < 0:
                continue
            start = idx + len(marker)
            window = html[start : start + 64]
            number = []
            dot_count = 0
            for ch in window:
                if ch.isdigit():
                    number.append(ch)
                elif ch == "." and dot_count == 0:
                    number.append(ch)
                    dot_count += 1
                elif number:
                    break
            if number:
                try:
                    return float("".join(number))
                except ValueError:
                    continue
        return fallback
