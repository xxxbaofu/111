"""Shared collector interfaces and deterministic demo helpers."""

from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime, timedelta
from hashlib import md5
from random import Random

from selection_radar.models import RawPost


class BaseCollector(ABC):
    """Abstract collector interface."""

    @abstractmethod
    def collect(self) -> list[RawPost]:
        """Collect raw posts."""


def seeded_int(seed_key: str, low: int, high: int) -> int:
    digest = md5(seed_key.encode("utf-8"), usedforsecurity=False).hexdigest()
    rng = Random(int(digest[:8], 16))
    return rng.randint(low, high)


def recent_time(seed_key: str, max_hours_ago: int = 72) -> datetime:
    hours = seeded_int(f"{seed_key}:hours", 0, max_hours_ago)
    minutes = seeded_int(f"{seed_key}:minutes", 0, 59)
    return datetime.utcnow() - timedelta(hours=hours, minutes=minutes)
