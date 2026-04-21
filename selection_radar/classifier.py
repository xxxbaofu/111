"""Opportunity classifier and recommendation logic."""

from __future__ import annotations

from selection_radar.models import OpportunityResult, ScoreBreakdown


class OpportunityClassifier:
    """Map score profile to richer opportunity labels and human-readable judgement."""

    def classify(self, score: ScoreBreakdown, emotion_tag: bool) -> str:
        labels = self.classify_labels(score, emotion_tag)
        if "小众暴利" in labels:
            return "小众暴利"
        if "新趋势" in labels:
            return "新趋势"
        if "爆发趋势" in labels:
            return "爆发趋势"
        if "蓝海机会" in labels:
            return "蓝海机会"
        if "长期稳定需求" in labels:
            return "长期稳定需求"
        return "观察名单"

    def classify_labels(self, score: ScoreBreakdown, emotion_tag: bool) -> list[str]:
        labels: list[str] = []
        if score.trend_score >= 7.5:
            labels.append("爆发趋势")
        if score.competition_score >= 7.0:
            labels.append("蓝海机会")
        if score.profit_score >= 7.0 and (score.emotion_score >= 6.0 or emotion_tag):
            labels.append("小众暴利")
        if score.new_trend_score >= 7.5:
            labels.append("新趋势")
        if score.emotion_score >= 6.0 or emotion_tag:
            labels.append("情绪驱动")
        if score.trend_score >= 5.0 and score.competition_score >= 5.5 and score.new_trend_score < 7:
            labels.append("长期稳定需求")
        if score.total_score >= 65 and score.competition_score >= 5:
            labels.append("可快速测试")
        if score.profit_score >= 7.8:
            labels.append("高客单价")
        if not labels:
            labels.append("观察名单")
        return labels

    def to_result(
        self,
        score: ScoreBreakdown,
        opportunity_type: str,
        emotion_tag: bool,
        *,
        category: str = "",
    ) -> OpportunityResult:
        labels = self.classify_labels(score, emotion_tag)
        tags = self._labels_to_tags(labels)
        verdict = self._verdict(score.total_score)
        reason = self._reason(score, labels, category)
        strategy = self._strategy(labels, score)
        business = self.estimate_business(score, labels)
        explain = self._explain_block(category=category, labels=labels, verdict=verdict, business=business)
        return OpportunityResult(
            opportunity_type=opportunity_type,
            tags=tags,
            verdict=verdict,
            reason=reason,
            metrics={
                "trend_score": score.trend_score,
                "profit_score": score.profit_score,
                "competition_score": score.competition_score,
                "emotion_score": score.emotion_score,
                "new_trend_score": score.new_trend_score,
                "total_score": score.total_score,
                "labels": labels,
                "strategy": strategy,
                "estimated_daily_revenue": business["estimated_daily_revenue"],
                "revenue_level": business["revenue_level"],
                "test_cost": business["test_cost"],
                "daily_budget": business["daily_budget"],
                "scale_cost": business["scale_cost"],
                "playbook": business["playbook"],
                "decision_summary": explain["short"],
                "decision_why": explain["why"],
                "decision_how": explain["how"],
                "decision_ads": explain["ads"],
            },
            raw={"labels": labels, "strategy": strategy, "explain": explain},
        )

    @staticmethod
    def _labels_to_tags(labels: list[str]) -> list[str]:
        mapping = {
            "爆发趋势": "🔥",
            "蓝海机会": "🟢",
            "小众暴利": "💰",
            "情绪驱动": "🧠",
            "新趋势": "🆕",
            "长期稳定需求": "📈",
            "可快速测试": "⚡",
            "高客单价": "💎",
            "观察名单": "📌",
        }
        tags: list[str] = []
        for label in labels:
            tag = mapping.get(label)
            if tag and tag not in tags:
                tags.append(tag)
        return tags

    @staticmethod
    def _verdict(total_score: float) -> str:
        if total_score >= 82:
            return "强烈推荐"
        if total_score >= 68:
            return "可以测试"
        if total_score >= 52:
            return "观望"
        return "不建议"

    @staticmethod
    def _reason(score: ScoreBreakdown, labels: list[str], category: str) -> str:
        # Human-readable Chinese judgement for decision making.
        category_text = category or "该品类"
        if "小众暴利" in labels:
            return (
                f"这个产品属于{category_text}，利润空间和情绪驱动都较强，适合做高客单测试；"
                "建议先上3-5组素材小预算验证。"
            )
        if "新趋势" in labels:
            return (
                f"这个产品在{category_text}里近期增速明显，属于新趋势窗口期；"
                "建议快速测试素材和页面，抢先拿低成本流量。"
            )
        if "爆发趋势" in labels:
            return (
                f"{category_text}当前热度较高，具备爆发信号；"
                "建议短周期投放验证转化，并密切关注竞争变化。"
            )
        if "长期稳定需求" in labels:
            return (
                f"该产品更偏{category_text}里的长期稳定需求，适合持续运营与复购策略，"
                "不追短期爆量，重视长期ROI。"
            )
        return (
            "该产品目前信号一般，建议继续观察趋势与竞争变化后再投入。"
            f"（总分 {score.total_score:.1f}/100）"
        )

    @staticmethod
    def _strategy(labels: list[str], score: ScoreBreakdown) -> str:
        if "可快速测试" in labels:
            return "低预算快速测款（3-5套素材）"
        if "长期稳定需求" in labels:
            return "中长线运营（内容+评价沉淀）"
        if score.total_score >= 75:
            return "优先上架并小规模投放"
        if score.total_score >= 55:
            return "观察并准备备选素材"
        return "暂缓投入"

    def estimate_business(self, score: ScoreBreakdown, labels: list[str]) -> dict[str, float | str]:
        # Heuristic business plan estimates for execution decisions.
        strength = max(0.0, min(1.0, score.total_score / 100.0))
        if "高客单价" in labels:
            base_revenue = 1400
            base_budget = 45
        elif "小众暴利" in labels:
            base_revenue = 900
            base_budget = 35
        elif "爆发趋势" in labels:
            base_revenue = 1200
            base_budget = 50
        else:
            base_revenue = 320
            base_budget = 20

        daily_revenue = round(base_revenue * (0.6 + strength), 2)
        test_cost = round(base_budget * 2, 2)
        daily_budget = round(base_budget * (0.7 + strength), 2)
        scale_cost = round(daily_budget * 7, 2)

        if daily_revenue < 100:
            revenue_level = "低"
        elif daily_revenue < 1000:
            revenue_level = "中"
        elif daily_revenue < 5000:
            revenue_level = "高"
        else:
            revenue_level = "爆款级"

        if "情绪驱动" in labels:
            playbook = "情绪内容转化"
        elif "小众暴利" in labels or "高客单价" in labels:
            playbook = "高客单利润打法"
        elif "爆发趋势" in labels or "新趋势" in labels:
            playbook = "短视频爆款打法"
        else:
            playbook = "低价冲量打法"

        return {
            "estimated_daily_revenue": daily_revenue,
            "revenue_level": revenue_level,
            "test_cost": test_cost,
            "daily_budget": daily_budget,
            "scale_cost": scale_cost,
            "playbook": playbook,
        }

    @staticmethod
    def _explain_block(
        *,
        category: str,
        labels: list[str],
        verdict: str,
        business: dict[str, float | str],
    ) -> dict[str, str]:
        category_text = category or "该品类"
        top_labels = "、".join(labels[:2]) if labels else "基础"
        short = f"{category_text}具备{top_labels}信号，当前结论：{verdict}。"
        why = "、".join(
            [
                "竞争压力可控" if "蓝海机会" in labels else "竞争需持续观察",
                "利润结构可接受" if "小众暴利" in labels or "高客单价" in labels else "利润一般",
                "情绪转化潜力较高" if "情绪驱动" in labels else "情绪驱动较弱",
            ]
        )
        how = f"建议优先采用「{business['playbook']}」，并在2天内完成首轮素材测试。"
        ads = (
            f"初始预算：${business['daily_budget']}/天；"
            f"测试成本：${business['test_cost']}；"
            f"起量成本：${business['scale_cost']}。"
        )
        return {"short": short, "why": why, "how": how, "ads": ads}

