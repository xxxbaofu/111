"""Flask app for AI wig studio demo website."""

from __future__ import annotations

import base64
import html
import os
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, render_template, request

from wig_ai_studio.ai_engine import UserProfile, WigAIEngine, analyze_avatar
from wig_ai_studio.catalog import get_catalog

BASE_DIR = Path(__file__).resolve().parent
TEMPLATE_DIR = BASE_DIR / "templates"
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
GENERATED_DIR = STATIC_DIR / "generated"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
GENERATED_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__, template_folder=str(TEMPLATE_DIR), static_folder=str(STATIC_DIR))
engine = WigAIEngine(get_catalog())
CATALOG_MAP = {item.product_id.lower(): item for item in get_catalog()}
REVIEWS = [
    {
        "reviewId": "RV-1001",
        "userName": "Mina",
        "rating": 5,
        "scene": "cosplay",
        "title": "漫展拍照效果非常出片",
        "content": "AI 推荐很准，头围贴合稳定，戴一整天也不压头。",
        "productId": "WIG-004",
        "createdAt": "2026-04-10",
    },
    {
        "reviewId": "RV-1002",
        "userName": "Lena",
        "rating": 4,
        "scene": "daily",
        "title": "日常通勤自然好打理",
        "content": "发丝质感不错，客服建议的帽围尺寸合适。",
        "productId": "WIG-001",
        "createdAt": "2026-04-14",
    },
    {
        "reviewId": "RV-1003",
        "userName": "Yuri",
        "rating": 5,
        "scene": "stage",
        "title": "舞台灯下颜色特别亮眼",
        "content": "试戴计划给的场景提示词很好，妆造师直接用了。",
        "productId": "WIG-006",
        "createdAt": "2026-04-18",
    },
]
NEWSLETTER_SUBSCRIBERS: list[dict[str, str]] = []


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


def _is_openai_image_enabled(request_value: object | None = None) -> bool:
    if request_value is True:
        return True
    env_value = str(os.getenv("WIGVERSE_ENABLE_OPENAI_IMAGE", "false")).strip().lower()
    return env_value in {"1", "true", "yes", "on"}


def _generate_mock_tryon_image(scene: str, prompt: str) -> str:
    """Create a deterministic placeholder image for try-on pipelines."""
    safe_scene = "".join(ch for ch in scene.lower() if ch.isalnum() or ch in {"-", "_"})
    safe_scene = safe_scene or "scene"
    filename = f"tryon-{safe_scene}-{uuid4().hex[:10]}.svg"
    target = GENERATED_DIR / filename
    escaped_prompt = html.escape(prompt[:140])
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#2B1B5B" />
    <stop offset="100%" stop-color="#6C2BD9" />
  </linearGradient>
</defs>
<rect width="1024" height="1024" fill="url(#bg)" />
<circle cx="512" cy="420" r="220" fill="#F5D9C5" />
<ellipse cx="512" cy="330" rx="250" ry="170" fill="#D266FF" opacity="0.84" />
<rect x="170" y="700" width="684" height="180" rx="28" fill="#120E24" opacity="0.65" />
<text x="210" y="770" fill="#FFFFFF" font-family="Inter, Arial, sans-serif" font-size="36" font-weight="700">AI Try-On Preview</text>
<text x="210" y="820" fill="#EEDCFF" font-family="Inter, Arial, sans-serif" font-size="26">Scene: {html.escape(scene)}</text>
<text x="210" y="860" fill="#D9C6FF" font-family="Inter, Arial, sans-serif" font-size="18">{escaped_prompt}</text>
</svg>"""
    target.write_text(svg, encoding="utf-8")
    return f"/static/generated/{filename}"


def _generate_openai_tryon_image(prompt: str, size: str, scene: str) -> tuple[str | None, str | None]:
    """Try generating try-on image with OpenAI; return (url, error_message)."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None, "OPENAI_API_KEY is not configured"

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        model = os.getenv("WIGVERSE_OPENAI_IMAGE_MODEL", "gpt-image-1")
        result = client.images.generate(model=model, prompt=prompt, size=size)
        image_data = result.data[0]
        image_url = getattr(image_data, "url", None)
        if image_url:
            return str(image_url), None

        b64_payload = getattr(image_data, "b64_json", None)
        if b64_payload:
            raw = base64.b64decode(b64_payload)
            safe_scene = "".join(ch for ch in scene.lower() if ch.isalnum() or ch in {"-", "_"})
            filename = f"tryon-openai-{safe_scene or 'scene'}-{uuid4().hex[:10]}.png"
            target = GENERATED_DIR / filename
            target.write_bytes(raw)
            return f"/static/generated/{filename}", None
        return None, "OpenAI returned empty image payload"
    except Exception as exc:  # pragma: no cover - network/provider failures are runtime dependent
        return None, str(exc)


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


def _to_int(value: object, fallback: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _to_float(value: object, fallback: float) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return fallback


def _catalog_payload() -> list[dict[str, object]]:
    products: list[dict[str, object]] = []
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
    return products


@app.get("/")
def home() -> str:
    """Website home page."""
    return render_template("index.html")


@app.get("/api/catalog")
def catalog() -> object:
    """Expose catalog data."""
    products = _catalog_payload()
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


@app.get("/api/reviews")
def reviews() -> object:
    """Expose featured customer reviews."""
    limit = _to_int(request.args.get("limit"), 6)
    scene = str(request.args.get("scene", "")).strip().lower()
    rows = REVIEWS
    if scene:
        rows = [item for item in rows if item["scene"] == scene]
    return jsonify({"items": rows[: max(limit, 1)], "total": len(rows)})


@app.post("/api/checkout/preview")
def checkout_preview() -> object:
    """Estimate checkout totals for a lightweight cart payload."""
    data = request.get_json(silent=True) or {}
    cart_items = data.get("items", [])
    if not isinstance(cart_items, list):
        return jsonify({"error": "items must be a list"}), 400

    normalized = []
    skipped_items = []
    stock_alerts = []
    subtotal = 0.0
    for row in cart_items:
        if not isinstance(row, dict):
            continue
        product_id = str(row.get("productId", "")).strip().lower()
        quantity = max(1, _to_int(row.get("quantity"), 1))
        product = CATALOG_MAP.get(product_id)
        if not product:
            skipped_items.append({"productId": row.get("productId"), "reason": "unknown_product"})
            continue
        if product.stock <= 0:
            skipped_items.append({"productId": product.product_id, "reason": "out_of_stock"})
            continue
        if quantity > product.stock:
            stock_alerts.append(
                {
                    "productId": product.product_id,
                    "requestedQuantity": quantity,
                    "availableStock": product.stock,
                }
            )
            quantity = product.stock
        line_total = product.price_cny * quantity
        subtotal += line_total
        normalized.append(
            {
                "productId": product.product_id,
                "name": product.name,
                "quantity": quantity,
                "unitPriceCny": product.price_cny,
                "lineTotalCny": line_total,
            }
        )

    express = str(data.get("shippingMethod", "standard")).strip().lower() or "standard"
    shipping_fee = 0.0
    if subtotal <= 0:
        shipping_fee = 0.0
    elif express == "express":
        shipping_fee = 36.0
    elif subtotal < 599:
        shipping_fee = 18.0
    else:
        shipping_fee = 0.0

    discount_code = str(data.get("discountCode", "")).strip().upper()
    discount = 0.0
    if discount_code == "WIG10":
        discount = round(subtotal * 0.1, 2)
    elif discount_code == "COSPLAY88":
        discount = 88.0 if subtotal >= 600 else 0.0

    tax = round((subtotal - discount) * 0.03, 2) if subtotal > 0 else 0.0
    total = round(max(subtotal - discount, 0) + shipping_fee + tax, 2)

    coupon_applied = discount_code if discount > 0 else ""
    payload = {
        "items": normalized,
        "skippedItems": skipped_items,
        "stockAlerts": stock_alerts,
        "pricing": {
            "subtotalCny": round(subtotal, 2),
            "discountCny": round(discount, 2),
            "shippingCny": round(shipping_fee, 2),
            "taxCny": tax,
            "totalCny": total,
        },
        "couponApplied": coupon_applied,
        "nextStep": "Proceed to secure checkout",
        "availableCoupons": ["WIG10", "COSPLAY88"],
    }
    return jsonify(payload)


@app.post("/api/newsletter/subscribe")
def newsletter_subscribe() -> object:
    """Store subscriber in memory and return confirmation payload."""
    data = request.get_json(silent=True) or {}
    email = str(data.get("email", "")).strip().lower()
    preference = str(data.get("preference", "new-arrivals")).strip().lower()
    if not email or "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"ok": False, "message": "请输入有效邮箱地址。"}), 400
    allowed_preferences = {"new-arrivals", "cosplay", "daily-style"}
    if preference not in allowed_preferences:
        return jsonify({"ok": False, "message": "订阅偏好不受支持。"}), 400
    existing = next((row for row in NEWSLETTER_SUBSCRIBERS if row["email"] == email), None)
    if existing:
        existing["preference"] = preference
        return jsonify({"ok": True, "message": "该邮箱已订阅，已为你更新偏好。"})

    NEWSLETTER_SUBSCRIBERS.append(
        {
            "email": email,
            "preference": preference,
            "createdAt": datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
    )
    return jsonify({"ok": True, "message": "订阅成功，首单优惠已发送到你的邮箱。"})


@app.post("/api/ai/tryon-generate")
def tryon_generate() -> object:
    """Generate try-on images (OpenAI when enabled, mock fallback otherwise)."""
    data = request.get_json(silent=True) or {}
    profile = _build_profile(data)
    selected_ids = _safe_list(data.get("selectedProductIds"))
    plans = engine.plan_tryon_scenarios(profile=profile, selected_ids=selected_ids)
    if not plans:
        return jsonify({"images": [], "providerMode": "mock", "warnings": ["No try-on plans available."]})

    image_count = _to_int(data.get("imageCount"), 3)
    image_count = max(1, min(image_count, 4))
    render_style = str(data.get("renderStyle", "photo-realistic studio")).strip() or "photo-realistic studio"
    image_size = str(data.get("imageSize", "1024x1024")).strip() or "1024x1024"
    use_openai = _is_openai_image_enabled(data.get("useRealAi"))

    warnings: list[str] = []
    images = []
    for plan in plans[:image_count]:
        enriched_prompt = (
            f"{plan.generation_prompt} Render style: {render_style}. "
            "Generate e-commerce quality try-on image with clear wig texture details."
        )
        provider = "mock"
        image_url = None
        if use_openai:
            image_url, err = _generate_openai_tryon_image(
                prompt=enriched_prompt, size=image_size, scene=plan.scene
            )
            if image_url:
                provider = "openai"
            elif err:
                warnings.append(f"OpenAI fallback for scene '{plan.scene}': {err}")
        if not image_url:
            image_url = _generate_mock_tryon_image(plan.scene, enriched_prompt)

        images.append(
            {
                "scene": plan.scene,
                "prompt": enriched_prompt,
                "imageUrl": image_url,
                "provider": provider,
                "recommendedProductIds": plan.recommended_product_ids,
            }
        )

    return jsonify(
        {
            "images": images,
            "providerMode": "openai" if use_openai else "mock",
            "warnings": warnings,
            "integrationTips": [
                "Set OPENAI_API_KEY and WIGVERSE_ENABLE_OPENAI_IMAGE=true to enable real image generation.",
                "Use WIGVERSE_OPENAI_IMAGE_MODEL to switch image model, default is gpt-image-1.",
            ],
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=False)
