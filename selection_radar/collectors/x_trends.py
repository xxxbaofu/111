"""X (Twitter) keyword discussion signal collector."""

from __future__ import annotations

from selection_radar.collectors.base import BaseCollector, recent_time, seeded_int
from selection_radar.config import Settings
from selection_radar.models import RawPost


class XTrendsCollector(BaseCollector):
    """MVP supplementary source for discussion signals."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def collect(self) -> list[RawPost]:
        if not self.settings.demo_mode:
            return []
        posts: list[RawPost] = []
        for keyword in self.settings.tiktok_keywords[:3]:
            posts.append(
                RawPost(
                    platform="x",
                    title=f"X discussion spike: {keyword}",
                    content=f"Keyword '{keyword}' has rising discussion volume.",
                    views=seeded_int(f"x:{keyword}:views", 2_000, 20_000),
                    likes=seeded_int(f"x:{keyword}:likes", 100, 2_500),
                    comments=seeded_int(f"x:{keyword}:comments", 20, 500),
                    created_at=recent_time(f"x:{keyword}", max_hours_ago=24),
                )
            )
        return posts
