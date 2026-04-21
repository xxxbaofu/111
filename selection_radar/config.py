"""Configuration helpers for Selection Radar v0.1."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(slots=True)
class Settings:
    """Runtime configuration loaded from environment variables."""

    db_path: Path
    output_dir: Path
    demo_mode: bool
    openai_api_key: str | None
    openai_model: str
    apify_token: str | None
    apify_actor_id: str
    tiktok_keywords: tuple[str, ...]
    reddit_client_id: str | None
    reddit_client_secret: str | None
    reddit_user_agent: str
    reddit_subreddits: tuple[str, ...]
    amazon_base_url: str
    etsy_base_url: str

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            db_path=Path(os.getenv("SELECTION_RADAR_DB", "selection_radar.db")),
            output_dir=Path(os.getenv("SELECTION_RADAR_OUTPUT_DIR", "output")),
            demo_mode=os.getenv("SELECTION_RADAR_DEMO_MODE", "true").lower() == "true",
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            openai_model=os.getenv("SELECTION_RADAR_OPENAI_MODEL", "gpt-4.1-mini"),
            apify_token=os.getenv("APIFY_TOKEN"),
            apify_actor_id=os.getenv(
                "SELECTION_RADAR_APIFY_ACTOR_ID", "clockworks~tiktok-scraper"
            ),
            tiktok_keywords=tuple(
                x.strip()
                for x in os.getenv(
                    "SELECTION_RADAR_TIKTOK_KEYWORDS",
                    "viral product,pet memorial,baby soothing,health gadget",
                ).split(",")
                if x.strip()
            ),
            reddit_client_id=os.getenv("REDDIT_CLIENT_ID"),
            reddit_client_secret=os.getenv("REDDIT_CLIENT_SECRET"),
            reddit_user_agent=os.getenv(
                "REDDIT_USER_AGENT", "selection-radar/0.1 by cloud-agent"
            ),
            reddit_subreddits=tuple(
                x.strip()
                for x in os.getenv(
                    "SELECTION_RADAR_REDDIT_SUBREDDITS",
                    "Entrepreneur,smallbusiness,petloss,beyondthebump",
                ).split(",")
                if x.strip()
            ),
            amazon_base_url=os.getenv(
                "SELECTION_RADAR_AMAZON_BASE_URL", "https://www.amazon.com"
            ),
            etsy_base_url=os.getenv(
                "SELECTION_RADAR_ETSY_BASE_URL", "https://www.etsy.com"
            ),
        )


def get_settings() -> Settings:
    """Return a settings object loaded from current environment."""
    return Settings.from_env()
