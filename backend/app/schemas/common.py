"""Shared schemas and enums for API contracts."""

from __future__ import annotations

from enum import Enum
from typing import Any

from pydantic import BaseModel


class Region(str, Enum):
    US = "US"
    UK = "UK"
    EU = "EU"
    SEA = "SEA"
    JP = "JP"
    KR = "KR"
    XHS = "XHS"


class ApiMessage(BaseModel):
    message: str


class ScorePayload(BaseModel):
    heat: float
    growth: float
    discussion: float
    competition: float
    ads_growth: float


class AIExplainPayload(BaseModel):
    product: str
    category: str
    market: str
    score: float
    budget_daily: float = 20.0
    extra: dict[str, Any] | None = None
