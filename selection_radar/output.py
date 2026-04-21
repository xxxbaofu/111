"""Result rendering helpers."""

from __future__ import annotations


def render_grouped_markdown(rows: list[dict]) -> str:
    grouped: dict[str, list[dict]] = {
        "爆发趋势": [],
        "蓝海机会": [],
        "小众暴利": [],
        "新趋势": [],
        "观察名单": [],
    }
    for row in rows:
        key = row["classification"]
        grouped.setdefault(key, []).append(row)

    lines: list[str] = ["# Selection Radar v0.1 Opportunities", ""]
    section_emoji = {
        "爆发趋势": "🧨",
        "蓝海机会": "🟢",
        "小众暴利": "💰",
        "新趋势": "🆕",
        "观察名单": "📌",
    }

    for section in ("爆发趋势", "蓝海机会", "小众暴利", "新趋势", "观察名单"):
        lines.append(f"## {section_emoji.get(section, '📌')} {section}")
        items = grouped.get(section, [])
        if not items:
            lines.append("- 暂无")
            lines.append("")
            continue
        for item in items:
            lines.append(f"- 产品：{item['product']}")
            lines.append(f"  标签：{' '.join(item['tags'])}")
            lines.append(f"  评分：{item['total_score']:.2f}")
            lines.append(f"  结论：{item['verdict']}")
            lines.append(f"  理由：{item['reason']}")
            lines.append("")
    return "\n".join(lines).strip() + "\n"

