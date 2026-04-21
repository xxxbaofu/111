"""TikTok collector via Apify, with demo fallback."""

from __future__ import annotations

from datetime import datetime, timedelta

import requests

from selection_radar.collectors.base import BaseCollector
from selection_radar.config import Settings
from selection_radar.models import RawPost


class TikTokCollector(BaseCollector):
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def collect(self, limit: int = 20) -> list[RawPost]:
        if self.settings.demo_mode or not self.settings.apify_token:
            return self._demo_posts()
        return self._collect_from_apify(limit=limit)

    def _collect_from_apify(self, limit: int) -> list[RawPost]:
        run_url = (
            f"https://api.apify.com/v2/acts/{self.settings.apify_actor_id}/run-sync-get-dataset-items"
        )
        params = {"token": self.settings.apify_token}
        payload = {
            "searchQueries": list(self.settings.tiktok_keywords),
            "resultsPerPage": min(limit, 50),
        }
        response = requests.post(run_url, params=params, json=payload, timeout=60)
        response.raise_for_status()
        items = response.json()
        posts: list[RawPost] = []
        for item in items[:limit]:
            hashtags = item.get("hashtags") or []
            posts.append(
                RawPost(
                    platform="tiktok",
                    title=str(item.get("text") or item.get("title") or ""),
                    content=" ".join(str(x) for x in hashtags),
                    views=int(item.get("playCount") or item.get("views") or 0),
                    likes=int(item.get("diggCount") or item.get("likes") or 0),
                    comments=int(item.get("commentCount") or item.get("comments") or 0),
                    created_at=datetime.utcnow(),
                )
            )
        return posts

    @staticmethod
    def _demo_posts() -> list[RawPost]:
        now = datetime.utcnow()
        return [
            RawPost(
                platform="tiktok",
                title="Pet memorial glass pendant keepsake",
                content="#petloss #memorial #handmade",
                views=420_000,
                likes=48_000,
                comments=3_500,
                created_at=now - timedelta(hours=5),
            ),
            RawPost(
                platform="tiktok",
                title="Portable baby white noise shusher toy",
                content="#baby #sleep #newparents",
                views=310_000,
                likes=26_000,
                comments=2_400,
                created_at=now - timedelta(hours=8),
            ),
            RawPost(
                platform="tiktok",
                title="Heatless neck pain relief wrap trending",
                content="#health #painrelief #wellness",
                views=280_000,
                likes=30_000,
                comments=1_600,
                created_at=now - timedelta(hours=10),
            ),
        ]
