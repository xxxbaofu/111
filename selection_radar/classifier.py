"""Opportunity classifier and recommendation logic."""

from __future__ import annotations

from selection_radar.models import OpportunityResult, ScoreBreakdown


class OpportunityClassifier:
    """Map score profile to opportunity type and verdict."""

    def classify(self, score: ScoreBreakdown, emotion_tag: bool) -> str:
        tags: list[str] = []
        opportunity_type = "观察名单"

        if score.trend_score >= 7.5:
            opportunity_type = "爆发趋势"
            tags.append("🔥")

        if score.competition_score >= 7.0:
            opportunity_type = "蓝海机会" if opportunity_type == "观察名单" else opportunity_type
            tags.append("🟢")

        if score.profit_score >= 7.0 and (score.emotion_score >= 3.0 or emotion_tag):
            opportunity_type = "小众暴利"
            tags.extend(["💰", "🧠"])

        if score.new_trend_score >= 7.5:
            opportunity_type = "新趋势"
            tags.append("🆕")

        return opportunity_type

    def to_result(self, score: ScoreBreakdown, opportunity_type: str) -> OpportunityResult:
        tags: list[str] = []
        if opportunity_type == "爆发趋势":
            tags.append("🔥")
        elif opportunity_type == "蓝海机会":
            tags.append("🟢")
        elif opportunity_type == "小众暴利":
            tags.extend(["💰", "🧠"])
        elif opportunity_type == "新趋势":
            tags.append("🆕")

        if score.emotion_score >= 3.0 and "🧠" not in tags:
            tags.append("🧠")

        deduped_tags: list[str] = []
        for tag in tags:
            if tag not in deduped_tags:
                deduped_tags.append(tag)

        verdict = "建议测试"
        if score.total_score < 5.5:
            verdict = "放弃"
        elif score.total_score < 7.0:
            verdict = "观察"

        reason = (
            f"趋势={score.trend_score:.1f}, 利润={score.profit_score:.1f}, "
            f"蓝海={score.competition_score:.1f}, 情绪={score.emotion_score:.1f}, "
            f"新趋势={score.new_trend_score:.1f}"
        )
        return OpportunityResult(
            opportunity_type=opportunity_type,
            tags=deduped_tags,
            verdict=verdict,
            reason=reason,
            metrics={
                "trend_score": score.trend_score,
                "profit_score": score.profit_score,
                "competition_score": score.competition_score,
                "emotion_score": score.emotion_score,
                "new_trend_score": score.new_trend_score,
                "total_score": score.total_score,
            },
        )

