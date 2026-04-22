"""Product normalization and Chinese display helpers."""

from __future__ import annotations

import re
from datetime import datetime, timedelta, timezone


_RE_WORD = re.compile(r"[a-z0-9]+")


def normalize_product_name(name: str) -> str:
    lowered = name.strip().lower()
    tokens = _RE_WORD.findall(lowered)
    return " ".join(tokens) if tokens else lowered


def to_chinese_display_name(english_name: str) -> str:
    name = english_name.lower()
    mapping = {
        "pet memorial keepsake": "宠物纪念盒",
        "baby sleep soother": "婴儿安抚器",
        "home health relief gadget": "家庭健康缓解器",
        "white noise": "白噪音安抚器",
        "memorial": "纪念用品",
        "pet": "宠物用品",
        "baby": "婴儿用品",
        "health": "健康用品",
    }
    for key, value in mapping.items():
        if key in name:
            return value
    # basic title to Chinese-like fallback for unknown products
    return f"机会产品-{english_name[:12]}"


def to_english_display_name(name: str) -> str:
    normalized = normalize_product_name(name)
    if not normalized:
        return name.strip()
    return " ".join(word.capitalize() for word in normalized.split())


def to_category_cn(category: str) -> str:
    key = category.strip().lower()
    mapping = {
        "pet memorial": "宠物纪念",
        "baby": "婴儿护理",
        "health": "健康护理",
        "general": "泛品类",
        "home": "家居",
    }
    for k, v in mapping.items():
        if k in key:
            return v
    return category or "泛品类"


def score_to_level(value: float, *, high: float, mid: float) -> str:
    if value >= high:
        return "高"
    if value >= mid:
        return "中"
    return "低"


def is_recent(iso_time: str, days: int = 3) -> bool:
    try:
        dt = datetime.fromisoformat(iso_time)
    except ValueError:
        return False
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return dt >= now - timedelta(days=days)

