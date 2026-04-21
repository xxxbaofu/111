"""Scoring engine for Selection Radar."""

from __future__ import annotations

from statistics import mean

from selection_radar.models import MarketData, ScoreBreakdown


class ScoringEngine:
    """Compute score components according to MVP rules."""

    def score(
        self,
        *,
        views: int,
        growth_ratio: float,
        market_rows: list[MarketData],
        emotion_tag: bool,
        trend_ratio: float,
    ) -> ScoreBreakdown:
        trend_score = self._trend_score(views=views, growth_ratio=growth_ratio)
        profit_score = self._profit_score(market_rows)
        competition_score = self._competition_score(market_rows)
        emotion_score = self._emotion_score(emotion_tag)
        new_trend_score = self._new_trend_score(trend_ratio)
        total = trend_score + profit_score + competition_score + emotion_score + new_trend_score
        return ScoreBreakdown(
            trend_score=round(trend_score, 2),
            profit_score=round(profit_score, 2),
            competition_score=round(competition_score, 2),
            emotion_score=round(emotion_score, 2),
            new_trend_score=round(new_trend_score, 2),
            total_score=round(total, 2),
        )

    @staticmethod
    def _trend_score(*, views: int, growth_ratio: float) -> float:
        base = min(7.0, max(0.0, views / 100_000 * 2.0))
        growth = min(3.0, max(0.0, growth_ratio - 1.0) * 1.2)
        return min(10.0, base + growth)

    @staticmethod
    def _profit_score(market_rows: list[MarketData]) -> float:
        if not market_rows:
            return 0.0
        margins: list[float] = []
        for row in market_rows:
            if row.price <= 0:
                continue
            margins.append((row.price - row.cost) / row.price)
        if not margins:
            return 0.0
        return max(0.0, min(10.0, mean(margins) * 10))

    @staticmethod
    def _competition_score(market_rows: list[MarketData]) -> float:
        if not market_rows:
            return 0.0
        avg_reviews = mean([row.review_count for row in market_rows])
        return max(0.0, min(10.0, 10.0 - (avg_reviews / 400.0)))

    @staticmethod
    def _emotion_score(emotion_tag: bool) -> float:
        return 4.0 if emotion_tag else 0.0

    @staticmethod
    def _new_trend_score(trend_ratio: float) -> float:
        if trend_ratio >= 3:
            return 10.0
        if trend_ratio >= 2:
            return 7.0
        if trend_ratio >= 1.3:
            return 3.5
        return 0.0
