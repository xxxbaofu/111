"""Google Trends signal collector."""

from __future__ import annotations

from statistics import mean

from pytrends.request import TrendReq

from selection_radar.collectors.base import seeded_int
from selection_radar.config import Settings
from selection_radar.models import TrendSignal


class GoogleTrendsCollector:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client = None if settings.demo_mode else TrendReq(hl="en-US", tz=0)

    def collect_for_keywords(self, keywords: set[str]) -> dict[str, TrendSignal]:
        signals: dict[str, TrendSignal] = {}
        for keyword in keywords:
            if self.settings.demo_mode:
                signals[keyword] = self._demo_signal(keyword)
            else:
                signals[keyword] = self._fetch_live_signal(keyword)
        return signals

    @staticmethod
    def _demo_signal(keyword: str) -> TrendSignal:
        ratio = seeded_int(f"gtrends:{keyword}:ratio", 90, 420) / 100
        seven = seeded_int(f"gtrends:{keyword}:7d", 20, 100)
        thirty = seeded_int(f"gtrends:{keyword}:30d", 10, 90)
        return TrendSignal(
            keyword=keyword,
            seven_day_avg=float(seven),
            thirty_day_avg=float(thirty),
            last3_vs_prev_ratio=ratio,
        )

    def _fetch_live_signal(self, keyword: str) -> TrendSignal:
        if self._client is None:
            return self._demo_signal(keyword)
        try:
            self._client.build_payload([keyword], timeframe="today 3-m")
            data = self._client.interest_over_time()
            if data.empty or keyword not in data.columns:
                return TrendSignal(
                    keyword=keyword,
                    seven_day_avg=0.0,
                    thirty_day_avg=0.0,
                    last3_vs_prev_ratio=1.0,
                )
            values = [float(x) for x in data[keyword].tolist()]
            if not values:
                return TrendSignal(
                    keyword=keyword,
                    seven_day_avg=0.0,
                    thirty_day_avg=0.0,
                    last3_vs_prev_ratio=1.0,
                )
            seven = values[-7:] if len(values) >= 7 else values
            thirty = values[-30:] if len(values) >= 30 else values
            latest3 = values[-3:] if len(values) >= 3 else values
            prev = values[:-3] if len(values) > 3 else []
            prev_avg = mean(prev) if prev else 0.0
            ratio = (mean(latest3) / prev_avg) if prev_avg > 0 else 1.0
            return TrendSignal(
                keyword=keyword,
                seven_day_avg=mean(seven),
                thirty_day_avg=mean(thirty),
                last3_vs_prev_ratio=ratio,
            )
        except Exception:
            return self._demo_signal(keyword)
