"""Flask app for AI wig studio demo website."""

from __future__ import annotations

import base64
from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, render_template, request

from wig_ai_studio.ai_engine import UserProfile, WigAIEngine, analyze_avatar
from wig_ai_studio.catalog import get_catalog

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__, template_folder=str(TEMPLATE_DIR), static_folder=str(STATIC_DIR))
engine = WigAIEngine(get_catalog())


def _safe_list(value: object) -> list[str]:
    if isinstance(value, list):
        return [str(item).strip().lower() for item in value if str(item).strip()]
    return []


def _save_avatar_image(image_base64: str | None) -> str | None:
    if not image_base64:
        return None
    try:
        payload = image_base64.split(",", 1)[-1]
        raw = base64.b64decode(payload)
    except (ValueError, TypeError):
        return None
    filename = f"avatar-{uuid4().hex[:12]}.png"
    target = UPLOAD_DIR / filename
    target.write_bytes(raw)
    return f"/static/uploads/{filename}"


def _build_profile(data: dict[str, object]) -> UserProfile:
    return UserProfile(
        head_circumference_cm=float(data.get("headCircumferenceCm", 56)),
        face_shape=str(data.get("faceShape", "oval")).strip().lower() or "oval",
        budget_min=int(data.get("budgetMin", 300)),
        budget_max=int(data.get("budgetMax", 1000)),
        target_scenes=_safe_list(data.get("targetScenes")),
        preferred_styles=_safe_list(data.get("preferredStyles")),
        preferred_colors=_safe_list(data.get("preferredColors")),
        wants_cosplay=bool(data.get("wantsCosplay", False)),
        comfort_priority=int(data.get("comfortPriority", 7)),
        maintenance_tolerance=int(data.get("maintenanceTolerance", 5)),
    )


@app.get("/")
def home() -> str:
    """Website home page."""
    return render_template("index.html")


@app.get("/api/catalog")
def catalog() -> object:
    """Expose catalog data."""
    products = []
    for item in get_catalog():
        products.append(
            {
                "productId": item.product_id,
                "name": item.name,
                "category": item.category,
                "style": item.style,
                "texture": item.texture,
                "baseColor": item.base_color,
                "colorFamily": item.color_family,
                "lengthCm": item.length_cm,
                "weightG": item.weight_g,
                "priceCny": item.price_cny,
                "capMinCm": item.cap_min_cm,
                "capMaxCm": item.cap_max_cm,
                "scenes": list(item.scenes),
                "faceShapes": list(item.face_shapes),
                "cosplay": item.cosplay,
                "heatResistant": item.heat_resistant,
                "stock": item.stock,
                "rating": item.rating,
                "description": item.description,
            }
        )
    return jsonify({"items": products, "summary": engine.summarize_catalog()})


@app.post("/api/ai/avatar-insight")
def avatar_insight() -> object:
    """Analyze avatar hints and return color/scene suggestions."""
    data = request.get_json(silent=True) or {}
    avatar_path = _save_avatar_image(data.get("avatarImageBase64"))
    insight = analyze_avatar(
        face_shape_hint=str(data.get("faceShapeHint", "")),
        skin_tone_hint=str(data.get("skinToneHint", "")),
        style_keywords=_safe_list(data.get("styleKeywords")),
        scene_keywords=_safe_list(data.get("sceneKeywords")),
    )
    response = {
        "insight": {
            "detectedFaceShape": insight.detected_face_shape,
            "detectedSkinTone": insight.detected_skin_tone,
            "confidence": insight.confidence,
            "suggestedColorFamilies": insight.suggested_color_families,
            "suggestedScenes": insight.suggested_scenes,
            "notes": insight.notes,
        },
        "avatarImagePath": avatar_path,
    }
    return jsonify(response)


@app.post("/api/ai/recommend")
def recommend() -> object:
    """Generate recommendation list based on user profile."""
    data = request.get_json(silent=True) or {}
    profile = _build_profile(data)
    recommendations = engine.recommend(profile=profile, limit=int(data.get("limit", 6)))
    payload = []
    for item in recommendations:
        payload.append(
            {
                "productId": item.product_id,
                "name": item.name,
                "priceCny": item.price_cny,
                "matchScore": item.match_score,
                "fitScore": item.fit_score,
                "styleScore": item.style_score,
                "sceneScore": item.scene_score,
                "aiReasons": item.ai_reasons,
                "scenes": list(item.scenes),
                "colorFamily": item.color_family,
                "style": item.style,
                "capRange": item.cap_range,
                "cosplay": item.cosplay,
            }
        )
    return jsonify({"recommendations": payload})


@app.post("/api/ai/tryon-plan")
def tryon_plan() -> object:
    """Generate scenario prompts for virtual try-on rendering pipeline."""
    data = request.get_json(silent=True) or {}
    profile = _build_profile(data)
    selected_ids = _safe_list(data.get("selectedProductIds"))
    plans = engine.plan_tryon_scenarios(profile=profile, selected_ids=selected_ids)
    response = [
        {
            "scene": plan.scene,
            "lighting": plan.lighting,
            "pose": plan.pose,
            "recommendedProductIds": plan.recommended_product_ids,
            "generationPrompt": plan.generation_prompt,
        }
        for plan in plans
    ]
    return jsonify({"plans": response})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
