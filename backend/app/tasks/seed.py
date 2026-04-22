"""Seed task for API-triggered bootstrap."""

from __future__ import annotations

from app.seeds import seed_demo


def seed_sample_data() -> dict[str, int]:
    """Run demo seed and return a simple status payload."""
    seed_demo()
    return {"seeded": 1}

