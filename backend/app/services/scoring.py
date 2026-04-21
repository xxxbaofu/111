"""Scoring and KPI utilities."""

from __future__ import annotations


def calc_growth(current_7d: float, prev_7d: float) -> float:
    if prev_7d <= 0:
        return 0.0
    return (current_7d - prev_7d) / prev_7d


def calc_total_score(
    *,
    heat: float,
    growth: float,
    discussion: float,
    competition: float,
    ads_growth: float,
) -> float:
    """
    综合评分（0-100）
    score =
      0.3 heat +
      0.25 growth +
      0.2 discussion +
      0.15 竞争反向 +
      0.1 广告增长
    """
    # Normalize to 0-1:
    # heat/discussion are assumed potentially high raw values.
    heat_n = max(0.0, min(1.0, heat / 100_000.0))
    growth_n = max(0.0, min(1.0, (growth + 1.0) / 2.0))
    discussion_n = max(0.0, min(1.0, discussion / 5_000.0))
    competition_n = max(0.0, min(1.0, competition / 100.0))
    competition_inverse = 1.0 - competition_n
    ads_growth_n = max(0.0, min(1.0, (ads_growth + 1.0) / 2.0))

    score = (
        0.3 * heat_n
        + 0.25 * growth_n
        + 0.2 * discussion_n
        + 0.15 * competition_inverse
        + 0.1 * ads_growth_n
    ) * 100.0
    return max(0.0, min(100.0, score))
