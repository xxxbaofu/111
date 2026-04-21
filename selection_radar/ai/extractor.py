"""AI-based product extraction with deterministic fallback."""

from __future__ import annotations

import json

from openai import OpenAI

from selection_radar.config import Settings
from selection_radar.models import ProductCandidate

EMOTION_KEYWORDS = {"pet", "death", "memorial", "health", "baby", "lonely", "loneliness"}


class ProductExtractor:
    """Extract product candidates from social text."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._client = OpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None

    def extract_from_text(self, title: str, content: str) -> list[ProductCandidate]:
        """Extract one or more candidates from title + content."""
        text = f"{title}\n{content}".strip()
        if self.settings.demo_mode or self._client is None:
            return [self._fallback_extract(text)]

        prompt = (
            "从以下内容中提取：\n"
            "1. 产品名称\n"
            "2. 类目\n"
            "3. 是否属于情绪驱动产品（是/否）\n"
            "输出 JSON 数组: [{name, category, keywords, emotion_tag}]\n\n"
            f"内容:\n{text}"
        )
        response = self._client.responses.create(
            model=self.settings.openai_model,
            input=prompt,
        )
        content = response.output_text.strip()
        try:
            data = json.loads(content)
            if isinstance(data, dict):
                data = [data]
            candidates: list[ProductCandidate] = []
            for item in data:
                if not isinstance(item, dict):
                    continue
                candidates.append(
                    ProductCandidate(
                        name=str(item.get("name", "Unknown Product")).strip() or "Unknown Product",
                        category=str(item.get("category", "general")).strip() or "general",
                        keywords=[
                            str(x).strip() for x in item.get("keywords", []) if str(x).strip()
                        ],
                        emotion_tag=bool(item.get("emotion_tag", False)),
                    )
                )
            return candidates or [self._fallback_extract(text)]
        except json.JSONDecodeError:
            return [self._fallback_extract(text)]

    def _fallback_extract(self, text: str) -> ProductCandidate:
        lowered = text.lower()
        tokens = [token.strip(".,!?:;#[]()\"'") for token in lowered.split() if token.strip()]
        keywords = sorted({token for token in tokens if len(token) > 3})[:6]

        emotion_tag = any(word in lowered for word in EMOTION_KEYWORDS)
        if "memorial" in lowered or "urn" in lowered:
            return ProductCandidate(
                name="Pet Memorial Keepsake",
                category="pet memorial",
                keywords=keywords or ["pet", "memorial", "keepsake"],
                emotion_tag=True,
            )
        if "baby" in lowered:
            return ProductCandidate(
                name="Baby Sleep Soother",
                category="baby",
                keywords=keywords or ["baby", "sleep", "soothing"],
                emotion_tag=True,
            )
        if "health" in lowered or "pain" in lowered:
            return ProductCandidate(
                name="Home Health Relief Gadget",
                category="health",
                keywords=keywords or ["health", "relief", "home"],
                emotion_tag=True,
            )
        return ProductCandidate(
            name=(text.splitlines()[0][:80] if text else "Potential Product"),
            category="general",
            keywords=keywords or ["trend", "product"],
            emotion_tag=emotion_tag,
        )

