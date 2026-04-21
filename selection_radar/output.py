"""Result rendering helpers."""

from __future__ import annotations


def render_grouped_markdown(rows: list[dict]) -> str:
    grouped: dict[str, list[dict]] = {
        "爆发趋势": [],
        "蓝海机会": [],
        "小众暴利": [],
        "情绪驱动": [],
        "长期稳定需求": [],
        "新趋势": [],
        "观察名单": [],
    }
    for row in rows:
        key = row["classification"]
        grouped.setdefault(key, []).append(row)

    lines: list[str] = ["# Selection Radar v0.2 决策机会池", ""]
    section_emoji = {
        "爆发趋势": "🧨",
        "蓝海机会": "🟢",
        "小众暴利": "💰",
        "情绪驱动": "❤️",
        "长期稳定需求": "📈",
        "新趋势": "🆕",
        "观察名单": "📌",
    }

    for section in ("爆发趋势", "蓝海机会", "小众暴利", "情绪驱动", "长期稳定需求", "新趋势", "观察名单"):
        lines.append(f"## {section_emoji.get(section, '📌')} {section}")
        items = grouped.get(section, [])
        if not items:
            lines.append("- 暂无")
            lines.append("")
            continue
        for item in items:
            lines.append(f"- 产品：{item.get('product_display', item.get('product', '未知产品'))}")
            lines.append(f"  标签：{' '.join(item['tags'])}")
            lines.append(f"  总分：{item['total_score']:.1f}/100")
            lines.append(f"  结论：{item['verdict']}")
            lines.append(
                "  子分："
                f"趋势{item['trend_score']:.1f}/10, 利润{item['profit_score']:.1f}/10, "
                f"竞争{item['competition_score']:.1f}/10, 情绪{item['emotion_score']:.1f}/10, "
                f"新趋势{item['new_trend_score']:.1f}/10"
            )
            lines.append(
                f"  收益预估：${item.get('estimated_daily_revenue', 0):.0f}/天（{item.get('revenue_level', '低')}）"
            )
            lines.append(
                f"  投流建议：测试${item.get('test_cost', 0):.0f}，日预算${item.get('daily_budget', 0):.0f}，起量${item.get('scale_cost', 0):.0f}"
            )
            lines.append(f"  打法：{item.get('playbook', '低价冲量打法')}")
            lines.append(f"  简要结论：{item.get('decision_summary', item.get('reason', ''))}")
            lines.append(f"  为什么：{item.get('decision_why', item.get('reason', ''))}")
            lines.append(f"  怎么做：{item.get('decision_how', '')}")
            lines.append("")
    return "\n".join(lines).strip() + "\n"

