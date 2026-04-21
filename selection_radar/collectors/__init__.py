"""Collectors for social, commerce, and trends sources."""

from selection_radar.collectors.google_trends import GoogleTrendsCollector
from selection_radar.collectors.market_validation import MarketValidationCollector
from selection_radar.collectors.reddit import RedditCollector
from selection_radar.collectors.tiktok import TikTokCollector
from selection_radar.collectors.x_trends import XTrendsCollector

__all__ = [
    "GoogleTrendsCollector",
    "MarketValidationCollector",
    "RedditCollector",
    "TikTokCollector",
    "XTrendsCollector",
]
