from selection_radar.classifier import OpportunityClassifier
from selection_radar.models import MarketData, OpportunityResult, ScoreBreakdown
from selection_radar.scoring import ScoringEngine


def test_scoring_engine_basics() -> None:
    engine = ScoringEngine()
    score = engine.score(
        views=120_000,
        growth_ratio=2.8,
        market_rows=[
            MarketData(
                product_id=1,
                source="amazon",
                price=40.0,
                cost=9.0,
                review_count=210,
                rating=4.3,
            ),
            MarketData(
                product_id=1,
                source="etsy",
                price=55.0,
                cost=15.0,
                review_count=82,
                rating=4.7,
            ),
        ],
        emotion_tag=True,
        trend_ratio=3.2,
    )
    assert isinstance(score, ScoreBreakdown)
    assert 0 <= score.trend_score <= 10
    assert 0 <= score.profit_score <= 10
    assert 0 <= score.competition_score <= 10
    assert score.emotion_score >= 3
    assert 0 <= score.new_trend_score <= 10
    assert 0 <= score.total_score <= 100


def test_classifier_returns_expected_shape() -> None:
    classifier = OpportunityClassifier()
    score = ScoreBreakdown(
        trend_score=8.6,
        profit_score=9.2,
        competition_score=7.4,
        emotion_score=8.2,
        new_trend_score=8.1,
        total_score=86.5,
    )
    opportunity_type = classifier.classify(score=score, emotion_tag=True)
    result = classifier.to_result(
        score=score,
        opportunity_type=opportunity_type,
        emotion_tag=True,
        category="婴儿安抚",
    )
    assert isinstance(result, OpportunityResult)
    assert result.opportunity_type in {
        "爆发趋势",
        "蓝海机会",
        "小众暴利",
        "新趋势",
        "长期稳定需求",
        "观察名单",
    }
    assert len(result.tags) >= 1
    assert "decision_summary" in result.metrics
    assert "estimated_daily_revenue" in result.metrics
