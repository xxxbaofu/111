from wig_ai_studio.ai_engine import UserProfile, WigAIEngine, analyze_avatar


def test_avatar_insight_shape_and_color() -> None:
    insight = analyze_avatar(
        face_shape_hint="round",
        skin_tone_hint="warm",
        style_keywords=["daily"],
        scene_keywords=["office"],
    )
    assert insight.detected_face_shape == "round"
    assert insight.detected_skin_tone == "warm"
    assert "brown" in insight.suggested_color_families
    assert 0.6 <= insight.confidence <= 1.0


def test_recommendation_includes_scored_items() -> None:
    engine = WigAIEngine()
    profile = UserProfile(
        head_circumference_cm=56,
        face_shape="oval",
        budget_min=300,
        budget_max=1200,
        target_scenes=["daily", "photo-shoot"],
        preferred_styles=["bob", "long-wave"],
        preferred_colors=["brown", "black"],
        wants_cosplay=False,
        comfort_priority=8,
        maintenance_tolerance=5,
    )
    recommendations = engine.recommend(profile, limit=4)
    assert len(recommendations) == 4
    assert recommendations[0].match_score >= recommendations[-1].match_score
    assert recommendations[0].fit_score >= 0
    assert len(recommendations[0].ai_reasons) >= 2


def test_tryon_plan_output() -> None:
    engine = WigAIEngine()
    profile = UserProfile(
        head_circumference_cm=57,
        face_shape="heart",
        budget_min=300,
        budget_max=1500,
        target_scenes=["cosplay", "stage", "daily"],
        preferred_styles=["twin-tail"],
        preferred_colors=["pink"],
        wants_cosplay=True,
        comfort_priority=6,
        maintenance_tolerance=6,
    )
    plans = engine.plan_tryon_scenarios(profile, selected_ids=["wig-004", "wig-003"])
    assert 1 <= len(plans) <= 3
    assert all(plan.scene for plan in plans)
    assert all(plan.generation_prompt for plan in plans)
