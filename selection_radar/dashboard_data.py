"""Data shaping layer for multi-page dashboard views."""

from __future__ import annotations

import json
from collections import defaultdict

import pandas as pd

from selection_radar.database import Database
from selection_radar.normalization import (
    normalize_product_name,
    score_to_level,
    to_category_cn,
    to_chinese_display_name,
    to_english_display_name,
)


def build_dashboard_frames(db: Database) -> tuple[pd.DataFrame, pd.DataFrame]:
    rows = db.fetch_joined_results()
    aliases = db.fetch_product_aliases()
    products_map: dict[str, dict] = {}
    category_map: dict[str, dict] = defaultdict(
        lambda: {
            "品类": "",
            "热度指数": 0.0,
            "讨论度指数": 0.0,
            "平均价格": 0.0,
            "产品数量": 0,
            "趋势指数": 0.0,
        }
    )

    for row in rows:
        key_name = str(row["product_name"])
        product_en = to_english_display_name(key_name)
        product_key = normalize_product_name(product_en)
        product_cn = aliases.get(product_key, to_chinese_display_name(product_en))
        category_raw = str(row["category"])
        category_cn = to_category_cn(category_raw)
        metrics = json.loads(row["metrics"])
        tags = json.loads(row["tags"])
        trend_score = float(row["trend_score"])
        competition_score = float(row["competition_score"])
        total_score = float(row["total_score"])
        discussion_index = float(
            ((trend_score + competition_score + float(row["new_trend_score"])) / 3.0) * 10.0
        )

        current = products_map.get(product_key)
        if current is None:
            current = {
                "产品键": product_key,
                "产品英文": product_en,
                "产品中文": product_cn,
                "产品名": f"{product_cn}（{product_en}）",
                "分类": str(row["classification"]),
                "推荐等级": str(row["verdict"]),
                "总分": total_score,
                "热度": score_to_level(trend_score, high=7.5, mid=5.0),
                "热度分": trend_score,
                "讨论度": score_to_level(discussion_index / 10, high=7.2, mid=4.8),
                "讨论度分": discussion_index,
                "平均价格": round(float(row["profit_score"]) * 6.0 + 18.0, 2),
                "预估测试预算": float(metrics.get("test_cost", 0.0)),
                "一句话结论": str(metrics.get("decision_summary", row["reason"])),
                "为什么": str(metrics.get("decision_why", row["reason"])),
                "怎么做": str(metrics.get("decision_how", "")),
                "风险": (
                    "竞争快速升温风险" if competition_score < 5.0 else "同质化素材风险"
                ),
                "投流建议": str(metrics.get("decision_ads", "")),
                "打法": str(metrics.get("playbook", "低价冲量打法")),
                "预估日收入": float(metrics.get("estimated_daily_revenue", 0.0)),
                "收入等级": str(metrics.get("revenue_level", "低")),
                "测试成本": float(metrics.get("test_cost", 0.0)),
                "建议日预算": float(metrics.get("daily_budget", 0.0)),
                "起量成本": float(metrics.get("scale_cost", 0.0)),
                "新手友好": (
                    "是"
                    if str(row["verdict"]) in {"强烈推荐", "可以测试"}
                    and float(metrics.get("test_cost", 0.0)) <= 120
                    else "否"
                ),
                "投流难度": (
                    "低"
                    if str(row["verdict"]) in {"强烈推荐", "可以测试"}
                    and competition_score >= 6.0
                    else "中"
                ),
                "标签": " ".join(tags),
                "标签列表": metrics.get("labels", []),
                "来源平台": [],
                "出现时间": "",
                "新趋势": "是" if float(row["new_trend_score"]) >= 7.5 else "否",
                "是否高客单": "是"
                if "高客单价" in metrics.get("labels", [])
                else "否",
                "品类中文": category_cn,
                "品类英文": category_raw,
                "平台适配": _platform_fit(metrics.get("playbook", "低价冲量打法")),
                "平均评论量": float(row["avg_reviews"]),
                "价格区间": f"${float(row['min_price']):.0f}-${float(row['max_price']):.0f}",
            }
            products_map[product_key] = current

        platform = str(row["platform"])
        if platform not in current["来源平台"]:
            current["来源平台"].append(platform)

        if total_score > float(current["总分"]):
            current["分类"] = str(row["classification"])
            current["推荐等级"] = str(row["verdict"])
            current["总分"] = total_score
            current["热度分"] = trend_score
            current["热度"] = score_to_level(trend_score, high=7.5, mid=5.0)
            current["讨论度分"] = discussion_index
            current["讨论度"] = score_to_level(discussion_index / 10, high=7.2, mid=4.8)
            current["一句话结论"] = str(metrics.get("decision_summary", row["reason"]))
            current["为什么"] = str(metrics.get("decision_why", row["reason"]))
            current["怎么做"] = str(metrics.get("decision_how", ""))
            current["投流建议"] = str(metrics.get("decision_ads", ""))
            current["打法"] = str(metrics.get("playbook", "低价冲量打法"))
            current["预估日收入"] = float(metrics.get("estimated_daily_revenue", 0.0))
            current["收入等级"] = str(metrics.get("revenue_level", "低"))
            current["测试成本"] = float(metrics.get("test_cost", 0.0))
            current["建议日预算"] = float(metrics.get("daily_budget", 0.0))
            current["起量成本"] = float(metrics.get("scale_cost", 0.0))
            current["标签列表"] = metrics.get("labels", [])
            current["标签"] = " ".join(tags)
            current["新趋势"] = "是" if float(row["new_trend_score"]) >= 7.5 else "否"
            current["风险"] = "竞争快速升温风险" if competition_score < 5.0 else "同质化素材风险"
            current["平台适配"] = _platform_fit(metrics.get("playbook", "低价冲量打法"))
            current["平均评论量"] = float(row["avg_reviews"])
            current["价格区间"] = f"${float(row['min_price']):.0f}-${float(row['max_price']):.0f}"

    product_rows: list[dict] = []
    for item in products_map.values():
        item["来源数"] = len(item["来源平台"])
        item["来源平台"] = " / ".join(sorted(item["来源平台"]))
        item["出现时间"] = "近3天" if item["新趋势"] == "是" else "3天前"
        product_rows.append(item)

        cat = category_map[item["品类中文"]]
        cat["品类"] = item["品类中文"]
        cat["热度指数"] += float(item["热度分"])
        cat["讨论度指数"] += float(item["讨论度分"] / 10.0)
        cat["平均价格"] += float(item["平均价格"])
        cat["产品数量"] += 1
        cat["趋势指数"] += float(1 if item["新趋势"] == "是" else 0.4)

    products_df = pd.DataFrame(
        sorted(product_rows, key=lambda x: float(x["总分"]), reverse=True)
    )

    category_rows: list[dict] = []
    for value in category_map.values():
        count = max(1, int(value["产品数量"]))
        heat = value["热度指数"] / count
        discuss = value["讨论度指数"] / count
        trend_idx = value["趋势指数"] / count
        if trend_idx >= 0.75:
            trend = "上升"
            trend_arrow = "↑"
        elif trend_idx <= 0.45:
            trend = "下降"
            trend_arrow = "↓"
        else:
            trend = "平稳"
            trend_arrow = "→"
        recommend = (
            "值得关注（小众高利润）" if heat >= 6.5 and discuss >= 6.2 else "继续观察"
        )
        category_rows.append(
            {
                "品类名称": value["品类"],
                "热度指数": round(heat, 2),
                "讨论度指数": round(discuss, 2),
                "平均价格": round(value["平均价格"] / count, 2),
                "产品数量": int(value["产品数量"]),
                "趋势": trend,
                "趋势符号": trend_arrow,
                "推荐等级": recommend,
                "竞争度": round(max(0.0, 10.0 - discuss), 2),
            }
        )
    categories_df = pd.DataFrame(
        sorted(category_rows, key=lambda x: float(x["热度指数"]), reverse=True)
    )
    return products_df, categories_df


def _platform_fit(playbook: str) -> str:
    if "短视频" in playbook or "情绪内容" in playbook:
        return "TikTok优先"
    if "高客单" in playbook:
        return "Meta优先"
    return "TikTok + Meta"

