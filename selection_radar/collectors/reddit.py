"""Reddit collector using public OAuth API."""

from __future__ import annotations

from datetime import datetime, timezone
import requests

from selection_radar.collectors.base import BaseCollector
from selection_radar.config import Settings
from selection_radar.models import RawPost


class RedditCollector(BaseCollector):
    platform = "reddit"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def collect(self) -> list[RawPost]:
        if self.settings.demo_mode:
            return self._demo_posts()

        try:
            token = self._get_token()
            if not token:
                return self._demo_posts()
            posts = self._collect_with_token(token)
            return posts or self._demo_posts()
        except requests.RequestException:
            return self._demo_posts()

    def _get_token(self) -> str | None:
        if not self.settings.reddit_client_id or not self.settings.reddit_client_secret:
            return None
        resp = requests.post(
            "https://www.reddit.com/api/v1/access_token",
            data={"grant_type": "client_credentials"},
            auth=(self.settings.reddit_client_id, self.settings.reddit_client_secret),
            headers={"User-Agent": self.settings.reddit_user_agent},
            timeout=self.settings.request_timeout_seconds,
        )
        resp.raise_for_status()
        return resp.json().get("access_token")

    def _collect_with_token(self, token: str) -> list[RawPost]:
        posts: list[RawPost] = []
        headers = {
            "Authorization": f"Bearer {token}",
            "User-Agent": self.settings.reddit_user_agent,
        }
        for subreddit in self.settings.reddit_subreddits:
            url = f"https://oauth.reddit.com/r/{subreddit}/hot"
            response = requests.get(
                url,
                params={"limit": self.settings.max_collect_per_source},
                headers=headers,
                timeout=self.settings.request_timeout_seconds,
            )
            if response.status_code != 200:
                continue
            data = response.json().get("data", {}).get("children", [])
            for item in data:
                post = item.get("data", {})
                created = datetime.fromtimestamp(post.get("created_utc", 0), tz=timezone.utc)
                posts.append(
                    RawPost(
                        platform=self.platform,
                        title=str(post.get("title", "")).strip(),
                        content=str(post.get("selftext", "")).strip(),
                        views=0,
                        likes=int(post.get("ups", 0) or 0),
                        comments=int(post.get("num_comments", 0) or 0),
                        created_at=created.replace(tzinfo=None),
                    )
                )
        return [p for p in posts if p.title]

    @staticmethod
    def _demo_posts() -> list[RawPost]:
        return [
            RawPost(
                platform="reddit",
                title="People keep asking for personalized pet memorial keepsakes",
                content="Need custom urn tags and sympathy bundles for dog owners.",
                likes=431,
                comments=138,
            ),
            RawPost(
                platform="reddit",
                title="Any non-noise baby soothing gadget recommendations?",
                content="Parents want something compact for travel and night routine.",
                likes=290,
                comments=95,
            ),
        ]

