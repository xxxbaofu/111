"""Product normalization and Chinese display helpers."""

from __future__ import annotations

import re


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

