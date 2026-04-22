"""Rule-based AI engine for wig recommendation and try-on planning."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from statistics import mean

from wig_ai_studio.catalog import WigProduct, get_catalog


@dataclass
class UserProfile:
    """Input profile for AI recommendation."""

    head_circumference_cm: float
    face_shape: str
    budget_min: int
    budget_max: int
    target_scenes: list[str]
    preferred_styles: list[str]
    preferred_colors: list[str]
    wants_cosplay: bool
    comfort_priority: int
    maintenance_tolerance: int


@dataclass
class AvatarInsight:
    """AI-generated avatar analysis result."""

    detected_face_shape: str
    detected_skin_tone: str
    confidence: float
    suggested_color_families: list[str]
    suggested_scenes: list[str]
    notes: str


@dataclass
class RecommendationItem:
    """Recommendation payload item."""

    product_id: str
    name: str
    price_cny: int
    match_score: float
    fit_score: float
    style_score: float
    scene_score: float
    ai_reasons: list[str]
    scenes: tuple[str, ...]
    color_family: str
    style: str
    cap_range: str
    cosplay: bool


@dataclass
class TryOnPlan:
    """Scenario-level generation plan for virtual try-on."""

    scene: str
    lighting: str
    pose: str
    recommended_product_ids: list[str]
    generation_prompt: str


_FACE_SHAPES = ("oval", "round", "square", "heart", "diamond")
_SKIN_TONES = ("fair", "neutral", "warm", "deep")


def _normalize_face_shape(value: str) -> str:
    raw = (value or "").strip().lower()
    if raw in _FACE_SHAPES:
        return raw
    return "oval"


def _normalize_skin_tone(value: str) -> str:
    raw = (value or "").strip().lower()
    if raw in _SKIN_TONES:
        return raw
    return "neutral"


def _clamp(number: float, low: float, high: float) -> float:
    return max(low, min(high, number))


def analyze_avatar(
    face_shape_hint: str,
    skin_tone_hint: str,
    style_keywords: list[str] | None = None,
    scene_keywords: list[str] | None = None,
) -> AvatarInsight:
    """Generate avatar insight with lightweight AI rules.

    This method is deterministic and can run without external AI services.
    """

    face_shape = _normalize_face_shape(face_shape_hint)
    skin_tone = _normalize_skin_tone(skin_tone_hint)
    styles = [item.strip().lower() for item in (style_keywords or []) if item.strip()]
    scenes = [item.strip().lower() for item in (scene_keywords or []) if item.strip()]

    if "cosplay" in styles or "anime" in styles:
        suggested_colors = ["pink", "blue", "silver"]
    elif skin_tone in {"warm", "deep"}:
        suggested_colors = ["brown", "black", "red"]
    elif skin_tone == "fair":
        suggested_colors = ["silver", "brown", "pink"]
    else:
        suggested_colors = ["brown", "black", "silver"]

    suggested_scenes = ["daily", "photo-shoot", "date"]
    if "cosplay" in styles or "comic-con" in scenes:
        suggested_scenes = ["cosplay", "anime-festival", "stage"]
    elif "office" in scenes:
        suggested_scenes = ["office", "daily", "campus"]

    confidence = 0.72
    if face_shape_hint:
        confidence += 0.08
    if skin_tone_hint:
        confidence += 0.08
    if style_keywords:
        confidence += 0.05
    confidence = _clamp(confidence, 0.62, 0.96)

    notes = (
        f"AI检测你更适合 {face_shape} 脸型友好轮廓，"
        f"建议优先选择 {', '.join(suggested_colors)} 色系，并在 {', '.join(suggested_scenes)} 场景试戴。"
    )
    return AvatarInsight(
        detected_face_shape=face_shape,
        detected_skin_tone=skin_tone,
        confidence=round(confidence, 2),
        suggested_color_families=suggested_colors,
        suggested_scenes=suggested_scenes,
        notes=notes,
    )


class WigAIEngine:
    """Business AI engine for recommendation and planning."""

    def __init__(self, catalog: list[WigProduct] | None = None) -> None:
        self.catalog = catalog or get_catalog()

    def recommend(self, profile: UserProfile, limit: int = 6) -> list[RecommendationItem]:
        """Generate top wig recommendations for a profile."""
        ranked: list[RecommendationItem] = []
        for product in self.catalog:
            fit_score = self._fit_score(profile, product)
            style_score = self._style_score(profile, product)
            scene_score = self._scene_score(profile, product)
            budget_score = self._budget_score(profile, product)
            comfort_score = self._comfort_score(profile, product)
            overall = round(
                fit_score * 0.26
                + style_score * 0.22
                + scene_score * 0.22
                + budget_score * 0.18
                + comfort_score * 0.12,
                2,
            )
            ai_reasons = self._reason_lines(profile, product, fit_score, style_score, scene_score, budget_score)
            ranked.append(
                RecommendationItem(
                    product_id=product.product_id,
                    name=product.name,
                    price_cny=product.price_cny,
                    match_score=overall,
                    fit_score=round(fit_score, 2),
                    style_score=round(style_score, 2),
                    scene_score=round(scene_score, 2),
                    ai_reasons=ai_reasons,
                    scenes=product.scenes,
                    color_family=product.color_family,
                    style=product.style,
                    cap_range=f"{product.cap_min_cm}-{product.cap_max_cm}cm",
                    cosplay=product.cosplay,
                )
            )

        ranked.sort(key=lambda item: item.match_score, reverse=True)
        return ranked[:limit]

    def plan_tryon_scenarios(self, profile: UserProfile, selected_ids: list[str]) -> list[TryOnPlan]:
        """Produce multi-scene generation prompts for virtual try-on."""
        selected_id_set = {item.lower() for item in selected_ids}
        selected = [item for item in self.catalog if item.product_id.lower() in selected_id_set]
        if not selected:
            selected = self.catalog[:3]

        primary_scenes = profile.target_scenes or ["daily", "photo-shoot", "cosplay"]
        plans: list[TryOnPlan] = []
        for scene in primary_scenes[:3]:
            lighting = "soft daylight"
            pose = "front-facing portrait"
            if scene in {"cosplay", "stage", "concert"}:
                lighting = "dramatic colored spotlight"
                pose = "dynamic three-quarter pose"
            elif scene in {"office", "campus"}:
                lighting = "clean indoor natural light"
                pose = "neutral shoulder-up pose"

            recommended_ids = [product.product_id for product in selected if scene in product.scenes]
            if not recommended_ids:
                recommended_ids = [selected[0].product_id]
            prompt = (
                f"Create a photorealistic try-on preview in {scene} scene, "
                f"{lighting}, with {pose}. "
                f"Head circumference reference {profile.head_circumference_cm}cm, "
                f"face shape {profile.face_shape}, style priorities {', '.join(profile.preferred_styles or ['balanced'])}. "
                f"Use wig ids: {', '.join(recommended_ids)}."
            )
            plans.append(
                TryOnPlan(
                    scene=scene,
                    lighting=lighting,
                    pose=pose,
                    recommended_product_ids=recommended_ids,
                    generation_prompt=prompt,
                )
            )
        return plans

    def summarize_catalog(self) -> dict[str, float | int]:
        """Generate catalog dashboard summary."""
        prices = [item.price_cny for item in self.catalog]
        ratings = [item.rating for item in self.catalog]
        return {
            "total_products": len(self.catalog),
            "avg_price_cny": round(mean(prices), 2) if prices else 0,
            "avg_rating": round(mean(ratings), 2) if ratings else 0,
            "cosplay_ratio": round(sum(item.cosplay for item in self.catalog) / len(self.catalog), 2)
            if self.catalog
            else 0,
        }

    def _fit_score(self, profile: UserProfile, product: WigProduct) -> float:
        if product.cap_min_cm <= profile.head_circumference_cm <= product.cap_max_cm:
            base = 95.0
        else:
            min_distance = min(
                abs(profile.head_circumference_cm - product.cap_min_cm),
                abs(profile.head_circumference_cm - product.cap_max_cm),
            )
            base = max(25.0, 92.0 - min_distance * 18)

        if profile.face_shape in product.face_shapes:
            base += 4.0
        return _clamp(base, 0, 100)

    def _style_score(self, profile: UserProfile, product: WigProduct) -> float:
        score = 48.0
        if profile.preferred_styles and product.style in profile.preferred_styles:
            score += 32.0
        if profile.preferred_colors and product.color_family in profile.preferred_colors:
            score += 22.0
        if profile.wants_cosplay == product.cosplay:
            score += 10.0
        if profile.wants_cosplay and product.heat_resistant:
            score += 6.0
        return _clamp(score, 0, 100)

    def _scene_score(self, profile: UserProfile, product: WigProduct) -> float:
        if not profile.target_scenes:
            return 72.0
        intersection = len(set(profile.target_scenes).intersection(product.scenes))
        if intersection == 0:
            return 36.0
        return _clamp(58.0 + 14.0 * intersection, 0, 100)

    def _budget_score(self, profile: UserProfile, product: WigProduct) -> float:
        if profile.budget_min <= product.price_cny <= profile.budget_max:
            return 95.0
        if product.price_cny < profile.budget_min:
            return _clamp(88.0 - (profile.budget_min - product.price_cny) / 15, 30, 90)
        return _clamp(90.0 - (product.price_cny - profile.budget_max) / 12, 10, 88)

    def _comfort_score(self, profile: UserProfile, product: WigProduct) -> float:
        comfort = 100 - (product.weight_g - 120) / 3
        if profile.maintenance_tolerance <= 3 and product.length_cm > 50:
            comfort -= 10
        if profile.comfort_priority >= 8 and product.weight_g > 280:
            comfort -= 12
        return _clamp(comfort, 0, 100)

    def _reason_lines(
        self,
        profile: UserProfile,
        product: WigProduct,
        fit_score: float,
        style_score: float,
        scene_score: float,
        budget_score: float,
    ) -> list[str]:
        reasons = []
        if fit_score >= 90:
            reasons.append("头围匹配度高，佩戴稳定性好。")
        elif fit_score >= 70:
            reasons.append("头围基本匹配，建议配合调节带获得更稳固贴合。")
        else:
            reasons.append("头围偏差较大，建议更换帽围规格。")

        if style_score >= 85:
            reasons.append("风格与颜色高度符合你的偏好。")
        elif style_score >= 65:
            reasons.append("风格方向较匹配，可通过妆造进一步强化效果。")
        else:
            reasons.append("风格匹配一般，建议探索更多颜色或发型。")

        if scene_score >= 85:
            reasons.append("核心使用场景覆盖完整，实用性强。")
        elif scene_score >= 60:
            reasons.append("可覆盖部分场景，适合搭配不同服饰扩展使用。")
        else:
            reasons.append("场景适配度较低，适合作为备选。")

        if budget_score < 60:
            reasons.append("预算压力较高，可考虑分期或相近替代款。")
        if profile.wants_cosplay and product.cosplay:
            reasons.append("支持 cosplay 造型需求，角色还原度更高。")
        return reasons

    def as_dict(self, recommendations: list[RecommendationItem]) -> list[dict[str, object]]:
        """Serialize recommendation dataclasses for JSON response."""
        return [asdict(item) for item in recommendations]
