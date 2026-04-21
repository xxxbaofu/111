"""Domain models used by Selection Radar."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(slots=True)
class RawPost:
    platform: str
    title: str
    content: str = ""
    views: int = 0
    likes: int = 0
    comments: int = 0
    created_at: datetime = field(default_factory=datetime.utcnow)


@dataclass(slots=True)
class Product:
    raw_post_id: int
    name: str
    category: str
    keywords: list[str]
    emotion_tag: bool


@dataclass(slots=True)
class ProductCandidate:
    name: str
    category: str
    keywords: list[str]
    emotion_tag: bool


@dataclass(slots=True)
class MarketData:
    product_id: int
    source: str
    price: float
    cost: float
    review_count: int
    rating: float


@dataclass(slots=True)
class TrendSignal:
    keyword: str
    seven_day_avg: float
    thirty_day_avg: float
    last3_vs_prev_ratio: float


@dataclass(slots=True)
class ScoreBreakdown:
    trend_score: float
    profit_score: float
    competition_score: float
    emotion_score: float
    new_trend_score: float
    total_score: float


@dataclass(slots=True)
class OpportunityResult:
    opportunity_type: str
    tags: list[str]
    verdict: str
    reason: str
    metrics: dict[str, Any]
    raw: dict[str, Any] = field(default_factory=dict)


@dataclass(slots=True)
class PersistedRawPost:
    id: int
    platform: str
    title: str
    content: str
    views: int
    likes: int
    comments: int
    created_at: datetime


@dataclass(slots=True)
class PersistedProduct:
    id: int
    raw_post_id: int
    name: str
    category: str
    keywords: list[str]
    emotion_tag: bool
