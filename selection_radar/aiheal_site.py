"""Streamlit marketing site for AIHeal."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd
import streamlit as st


CONTENT_PATH = Path(__file__).resolve().parent.parent / "content" / "aiheal_site.json"
PAGE_ORDER = ["home", "product", "demo", "scenarios", "technology", "download", "developers"]


def _copy(lang: str, zh: str, en: str) -> str:
    return zh if lang == "zh" else en


def _text(value: Any, lang: str) -> str:
    if isinstance(value, dict):
        if lang in value:
            return str(value[lang])
        if "zh" in value:
            return str(value["zh"])
        if "en" in value:
            return str(value["en"])
    return str(value)


def _normalize_page(page: str, site: dict[str, Any]) -> str:
    if page in site["page_labels"]:
        return page
    return "home"


def _normalize_lang(lang: str) -> str:
    return lang if lang in {"zh", "en"} else "zh"


def _query_value(name: str, default: str) -> str:
    if hasattr(st, "query_params"):
        value = st.query_params.get(name, default)
    else:
        value = st.experimental_get_query_params().get(name, [default])
    if isinstance(value, list):
        return str(value[0]) if value else default
    return str(value)


def _set_query_values(**values: str) -> None:
    if hasattr(st, "query_params"):
        for key, value in values.items():
            st.query_params[key] = value
    else:
        st.experimental_set_query_params(**values)


def _load_site() -> dict[str, Any]:
    return json.loads(CONTENT_PATH.read_text(encoding="utf-8"))["site"]


def _page_label(site: dict[str, Any], page: str, lang: str) -> str:
    return _text(site["page_labels"][page], lang)


def _go_to_page(page: str) -> None:
    st.session_state["aiheal_page"] = page
    _set_query_values(page=page, lang=st.session_state["aiheal_lang"])
    st.rerun()


def _inject_styles() -> None:
    st.markdown(
        """
        <style>
        .stApp {
            background:
                radial-gradient(circle at top right, rgba(59, 130, 246, 0.10), transparent 28%),
                linear-gradient(180deg, #f8fbff 0%, #ffffff 26%, #f7f8fc 100%);
        }
        .block-container {
            max-width: 1180px;
            padding-top: 2rem;
            padding-bottom: 4rem;
        }
        .aiheal-eyebrow {
            display: inline-block;
            padding: 0.35rem 0.8rem;
            border-radius: 999px;
            background: rgba(37, 99, 235, 0.10);
            color: #2563eb;
            font-size: 0.82rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            margin-bottom: 0.9rem;
        }
        .aiheal-brand {
            font-size: 2rem;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 0.1rem;
        }
        .aiheal-tagline {
            font-size: 1rem;
            color: #475569;
            margin-bottom: 0;
        }
        .aiheal-hero-title {
            font-size: 3.1rem;
            line-height: 1.08;
            font-weight: 800;
            color: #0f172a;
            margin: 0.1rem 0 0.4rem 0;
        }
        .aiheal-hero-subtitle {
            font-size: 1.3rem;
            line-height: 1.35;
            color: #1d4ed8;
            font-weight: 650;
            margin-bottom: 0.8rem;
        }
        .aiheal-lead {
            font-size: 1.03rem;
            line-height: 1.75;
            color: #334155;
        }
        .aiheal-section-title {
            font-size: 2rem;
            font-weight: 780;
            color: #0f172a;
            margin-bottom: 0.2rem;
        }
        .aiheal-section-copy {
            color: #475569;
            line-height: 1.7;
            margin-bottom: 1rem;
        }
        .aiheal-card {
            background: rgba(255, 255, 255, 0.90);
            border: 1px solid rgba(148, 163, 184, 0.18);
            border-radius: 22px;
            padding: 1.15rem;
            min-height: 190px;
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.05);
        }
        .aiheal-card h4 {
            margin: 0 0 0.55rem 0;
            font-size: 1.1rem;
            color: #0f172a;
        }
        .aiheal-card p {
            margin: 0;
            color: #475569;
            line-height: 1.65;
        }
        .aiheal-stat {
            background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
            border-radius: 18px;
            border: 1px solid rgba(148, 163, 184, 0.2);
            padding: 1rem;
            text-align: left;
        }
        .aiheal-stat .value {
            display: block;
            font-size: 1.6rem;
            font-weight: 750;
            color: #0f172a;
        }
        .aiheal-stat .label {
            color: #64748b;
            font-size: 0.92rem;
        }
        .aiheal-pill {
            display: inline-block;
            padding: 0.45rem 0.85rem;
            margin: 0.2rem 0.35rem 0.2rem 0;
            border-radius: 999px;
            background: #eff6ff;
            color: #1d4ed8;
            border: 1px solid rgba(59, 130, 246, 0.16);
            font-size: 0.9rem;
            font-weight: 600;
        }
        .aiheal-phone {
            background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
            color: #f8fafc;
            border-radius: 28px;
            padding: 1.1rem;
            border: 1px solid rgba(148, 163, 184, 0.20);
            box-shadow: 0 30px 60px rgba(15, 23, 42, 0.32);
        }
        .aiheal-phone-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #cbd5e1;
            font-size: 0.85rem;
            margin-bottom: 0.8rem;
        }
        .aiheal-phone-score {
            font-size: 3rem;
            font-weight: 800;
            line-height: 1;
            color: #ffffff;
            margin-top: 0.2rem;
        }
        .aiheal-phone-score-label {
            color: #94a3b8;
            font-size: 0.95rem;
            margin-bottom: 1rem;
        }
        .aiheal-phone-metrics {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
            margin-bottom: 1rem;
        }
        .aiheal-phone-metric {
            background: rgba(255, 255, 255, 0.06);
            border-radius: 18px;
            padding: 0.8rem;
        }
        .aiheal-phone-metric strong {
            display: block;
            font-size: 1.05rem;
            margin-bottom: 0.2rem;
            color: #ffffff;
        }
        .aiheal-phone-metric span {
            color: #cbd5e1;
            font-size: 0.85rem;
        }
        .aiheal-risk {
            background: rgba(59, 130, 246, 0.12);
            border: 1px solid rgba(96, 165, 250, 0.20);
            border-radius: 18px;
            padding: 0.9rem;
            margin-bottom: 0.9rem;
        }
        .aiheal-risk-label {
            color: #93c5fd;
            font-size: 0.84rem;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            margin-bottom: 0.25rem;
        }
        .aiheal-risk-text {
            color: #eff6ff;
            font-size: 0.96rem;
            line-height: 1.5;
        }
        .aiheal-mini-bars {
            display: flex;
            align-items: flex-end;
            gap: 0.4rem;
            height: 68px;
            margin-top: 0.35rem;
        }
        .aiheal-mini-bars span {
            display: block;
            width: 100%;
            border-radius: 999px 999px 10px 10px;
            background: linear-gradient(180deg, #60a5fa 0%, #2563eb 100%);
        }
        .aiheal-cta {
            background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
            border-radius: 28px;
            padding: 1.4rem;
            color: #f8fafc;
            border: 1px solid rgba(148, 163, 184, 0.16);
        }
        .aiheal-cta h3 {
            color: #ffffff;
            margin: 0 0 0.5rem 0;
            font-size: 1.7rem;
        }
        .aiheal-cta p {
            color: #dbeafe;
            line-height: 1.7;
            margin-bottom: 0;
        }
        .aiheal-path {
            display: flex;
            flex-wrap: wrap;
            gap: 0.55rem;
        }
        .aiheal-path-step {
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.55rem 0.85rem;
            border-radius: 999px;
            background: #f8fafc;
            border: 1px solid rgba(148, 163, 184, 0.20);
            color: #0f172a;
            font-size: 0.92rem;
            font-weight: 600;
        }
        .aiheal-path-step::after {
            content: ">";
            color: #94a3b8;
        }
        .aiheal-path-step:last-child::after {
            content: "";
        }
        .aiheal-note {
            color: #64748b;
            font-size: 0.92rem;
            line-height: 1.6;
        }
        .aiheal-qr {
            background: repeating-linear-gradient(
                45deg,
                #0f172a,
                #0f172a 10px,
                #e2e8f0 10px,
                #e2e8f0 20px
            );
            border-radius: 22px;
            min-height: 230px;
            border: 12px solid white;
            box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.25);
        }
        .aiheal-code-note {
            color: #475569;
            font-size: 0.92rem;
        }
        @media (max-width: 900px) {
            .aiheal-hero-title {
                font-size: 2.4rem;
            }
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def _section_heading(title: str, description: str) -> None:
    st.markdown(f"<div class='aiheal-section-title'>{title}</div>", unsafe_allow_html=True)
    st.markdown(f"<div class='aiheal-section-copy'>{description}</div>", unsafe_allow_html=True)


def _card(title: str, body: str) -> None:
    st.markdown(
        f"""
        <div class="aiheal-card">
            <h4>{title}</h4>
            <p>{body}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _badge_list(items: list[Any], lang: str) -> None:
    html = "".join(f"<span class='aiheal-pill'>{_text(item, lang)}</span>" for item in items)
    st.markdown(html, unsafe_allow_html=True)


def _trend_dataframe(lang: str) -> pd.DataFrame:
    return pd.DataFrame(
        {
            _copy(lang, "日期", "Day"): ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            _copy(lang, "健康评分", "Health score"): [79, 81, 84, 80, 78, 82, 82],
            _copy(lang, "睡眠时长", "Sleep hours"): [7.1, 7.0, 6.7, 6.3, 6.1, 6.6, 6.8],
        }
    ).set_index(_copy(lang, "日期", "Day"))


def _signal_dataframe(lang: str) -> pd.DataFrame:
    return pd.DataFrame(
        {
            _copy(lang, "日期", "Day"): ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            _copy(lang, "睡眠", "Sleep"): [7.2, 7.0, 6.8, 6.4, 6.2, 6.7, 6.9],
            _copy(lang, "夜间心率", "Night HR"): [63, 64, 66, 68, 70, 69, 67],
            _copy(lang, "活动恢复", "Recovery"): [82, 80, 79, 75, 72, 78, 81],
        }
    ).set_index(_copy(lang, "日期", "Day"))


def _phone_shell(site: dict[str, Any], lang: str) -> None:
    report = site["demo_report_template"]
    status = _text(report["health_score"]["status"], lang)
    risk = _text(report["risk"], lang)
    score_label = _copy(lang, "健康评分", "Health Score")
    html = f"""
    <div class="aiheal-phone">
        <div class="aiheal-phone-top">
            <span>AIHeal</span>
            <span>{status}</span>
        </div>
        <div class="aiheal-phone-score">{report["health_score"]["score"]}</div>
        <div class="aiheal-phone-score-label">{score_label}</div>
        <div class="aiheal-phone-metrics">
            <div class="aiheal-phone-metric">
                <strong>6h 32m</strong>
                <span>{_copy(lang, "睡眠", "Sleep")}</span>
            </div>
            <div class="aiheal-phone-metric">
                <strong>72 bpm</strong>
                <span>{_copy(lang, "夜间心率", "Night HR")}</span>
            </div>
            <div class="aiheal-phone-metric">
                <strong>8.4k</strong>
                <span>{_copy(lang, "活动量", "Activity")}</span>
            </div>
            <div class="aiheal-phone-metric">
                <strong>{status}</strong>
                <span>{_copy(lang, "当前状态", "Current state")}</span>
            </div>
        </div>
        <div class="aiheal-risk">
            <div class="aiheal-risk-label">{_copy(lang, "风险提示", "Risk alert")}</div>
            <div class="aiheal-risk-text">{risk}</div>
        </div>
        <div class="aiheal-risk-label">{_copy(lang, "趋势", "Trend")}</div>
        <div class="aiheal-mini-bars">
            <span style="height: 32%;"></span>
            <span style="height: 58%;"></span>
            <span style="height: 74%;"></span>
            <span style="height: 52%;"></span>
            <span style="height: 68%;"></span>
            <span style="height: 84%;"></span>
            <span style="height: 92%;"></span>
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


def _report_card(site: dict[str, Any], lang: str) -> None:
    report = site["demo_report_template"]
    findings = report["findings"]
    actions = report["actions"]

    with st.container(border=True):
        title_col, score_col = st.columns([3, 1])
        title_col.markdown(f"### {_copy(lang, '示例健康报告', 'Sample Health Report')}")
        score_col.metric(
            _copy(lang, "健康评分", "Health Score"),
            f"{report['health_score']['score']} / 100",
            _text(report["health_score"]["status"], lang),
        )

        st.markdown(f"**{_copy(lang, '关键发现', 'Key findings')}**")
        for item in findings:
            st.markdown(f"- {_text(item, lang)}")

        st.warning(f"{_copy(lang, '风险提示', 'Risk alert')}: {_text(report['risk'], lang)}")
        st.info(f"{_copy(lang, 'AI 分析', 'AI analysis')}: {_text(report['analysis'], lang)}")

        st.markdown(f"**{_copy(lang, '行动建议', 'Action plan')}**")
        for action in actions:
            st.markdown(f"1. {_text(action, lang)}")


def _conversion_card(site: dict[str, Any], lang: str) -> None:
    funnel = site["conversion_funnel"]
    _section_heading(
        _copy(lang, "转化路径", "Conversion journey"),
        _copy(
            lang,
            "遵循功能 -> 结果 -> 信任 -> 愿景的顺序，让用户先看懂，再相信，最后采取行动。",
            "Follow the sequence of features -> results -> trust -> vision so users understand first, believe next, and act last.",
        ),
    )
    html = "".join(
        f"<span class='aiheal-path-step'>{_text(step, lang)}</span>"
        for step in funnel["path"]
    )
    st.markdown(f"<div class='aiheal-path'>{html}</div>", unsafe_allow_html=True)
    st.write("")
    cols = st.columns(len(funnel["steps"]))
    for col, step in zip(cols, funnel["steps"]):
        with col:
            with st.container(border=True):
                st.caption(_text(step["stage"], lang))
                st.markdown(f"**{_text(step['goal'], lang)}**")
    st.caption(
        _copy(lang, "体验原则", "Experience principles")
        + ": "
        + " / ".join(_text(item, lang) for item in funnel["experience_principles"])
    )


def _render_home(site: dict[str, Any], lang: str) -> None:
    hero = site["home_ui"]["hero"]
    feature_cards = site["home_ui"]["core_features"]
    use_cases = site["home_ui"]["use_cases"]

    left, right = st.columns([1.2, 0.95], gap="large")
    with left:
        st.markdown(
            f"<div class='aiheal-eyebrow'>{_copy(lang, 'AI 健康分析', 'AI health intelligence')}</div>",
            unsafe_allow_html=True,
        )
        st.markdown(
            f"<div class='aiheal-hero-title'>{_text(hero['title'], lang)}</div>",
            unsafe_allow_html=True,
        )
        st.markdown(
            f"<div class='aiheal-hero-subtitle'>{_text(hero['subtitle'], lang)}</div>",
            unsafe_allow_html=True,
        )
        st.markdown(
            f"<div class='aiheal-lead'>{_text(hero['description'], lang)}</div>",
            unsafe_allow_html=True,
        )
        button_cols = st.columns(2)
        with button_cols[0]:
            if st.button(_text(hero["primary_cta"], lang), key="home-hero-primary", type="primary", use_container_width=True):
                _go_to_page("download")
        with button_cols[1]:
            if st.button(_text(hero["secondary_cta"], lang), key="home-hero-secondary", use_container_width=True):
                _go_to_page("demo")
        st.caption(
            _copy(
                lang,
                "不登录也能先看 Demo，先让用户看懂结果。",
                "Let users see the demo without logging in so the value is obvious first.",
            )
        )
    with right:
        _phone_shell(site, lang)

    st.write("")
    _section_heading(
        _copy(lang, "核心功能", "Core features"),
        _copy(
            lang,
            "首页先回答一个问题：AIHeal 能具体帮用户做什么。",
            "The home page answers one question first: what can AIHeal actually do for the user?",
        ),
    )
    cols = st.columns(3)
    for col, feature in zip(cols, feature_cards):
        with col:
            _card(_text(feature["title"], lang), _text(feature["description"], lang))

    st.write("")
    demo_left, demo_right = st.columns([1.05, 0.95], gap="large")
    with demo_left:
        _section_heading(
            _copy(lang, "Demo 报告", "Demo report"),
            _copy(
                lang,
                "这是首页最重要的转化模块：先展示结果，再建立信任。",
                "This is the most important conversion block on the home page: show the result first, then build trust.",
            ),
        )
        _report_card(site, lang)
    with demo_right:
        _section_heading(
            _copy(lang, "趋势与可信度", "Trend and trust"),
            _copy(
                lang,
                "报告不是孤立结论，而是基于连续信号变化给出的判断。",
                "The report is not a one-off guess. It is grounded in changes across continuous health signals.",
            ),
        )
        st.line_chart(_trend_dataframe(lang), use_container_width=True)
        _conversion_card(site, lang)

    st.write("")
    _section_heading(
        _copy(lang, "使用场景", "Use cases"),
        _copy(
            lang,
            "用真实场景而不是抽象概念，帮助用户快速代入自己。",
            "Use real scenarios instead of abstract promises so people can see themselves in the product quickly.",
        ),
    )
    cols = st.columns(3)
    for col, item in zip(cols, use_cases):
        with col:
            _card(_text(item["title"], lang), _text(item["description"], lang))

    st.write("")
    _section_heading(
        _copy(lang, "数据来源", "Data sources"),
        _copy(
            lang,
            "支持来自系统、设备和用户输入的多源健康信号。",
            "Support health signals from operating systems, devices, and direct user input.",
        ),
    )
    _badge_list(site["home_ui"]["data_sources"], lang)

    st.write("")
    cta_left, cta_right = st.columns([1.2, 0.8], gap="large")
    with cta_left:
        st.markdown(
            f"""
            <div class="aiheal-cta">
                <h3>{_copy(lang, "立即开始你的第一次分析", "Start your first analysis now")}</h3>
                <p>{_copy(lang, "首页的任务是让用户看懂，Demo 的任务是让用户相信，下载页的任务是把阻力降到最低。", "The home page helps users understand, the demo helps them believe, and the download page removes friction.")}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with cta_right:
        if st.button(_copy(lang, "Download App", "Download App"), key="home-cta-download", type="primary", use_container_width=True):
            _go_to_page("download")
        if st.button(_copy(lang, "查看完整 Demo", "View full demo"), key="home-cta-demo", use_container_width=True):
            _go_to_page("demo")

    st.write("")
    infra = site["home_ui"]["infrastructure"]
    _section_heading(
        infra["title"],
        _copy(
            lang,
            "技术愿景放在价值之后呈现，让用户先看到帮助，再理解为什么值得信任。",
            "Present the technical vision after the value is clear so users first see the benefit, then understand why it is trustworthy.",
        ),
    )
    _badge_list(infra["pillars"], lang)
    st.caption(
        " / ".join(_text(item, lang) for item in site["core_principles"])
    )

    st.write("")
    _section_heading(
        _copy(lang, "开发者入口", "Developer entry"),
        _copy(
            lang,
            "如果你想把健康分析能力接入自己的产品，可以从 Developers 页面进入 API、Agent 与 SDK 模块。",
            "If you want to embed health analysis into your own product, the Developers page is the entry point for API, agent, and SDK options.",
        ),
    )
    with st.container(border=True):
        st.markdown(f"**{_copy(lang, '开发者能力层', 'Developer capability layer')}**")
        st.markdown(
            _copy(
                lang,
                "结构化报告、风险检测和行动建议可以独立作为能力层输出。",
                "Structured reports, risk detection, and action plans can be exposed as a standalone capability layer.",
            )
        )
        if st.button(_copy(lang, "前往开发者页面", "Open developers page"), key="home-developers", use_container_width=True):
            _go_to_page("developers")


def _render_product(site: dict[str, Any], lang: str) -> None:
    page = site["product_page"]
    _section_heading(_text(page["headline"], lang), _text(page["description"], lang))

    cols = st.columns(3)
    for col, item in zip(cols, page["overview"]):
        with col:
            _card(_text(item["title"], lang), _text(item["description"], lang))

    st.write("")
    snapshot = page["health_snapshot"]
    _section_heading(_text(snapshot["title"], lang), _text(snapshot["description"], lang))
    metric_cols = st.columns(len(snapshot["metrics"]))
    for col, item in zip(metric_cols, snapshot["metrics"]):
        with col:
            st.markdown(
                f"""
                <div class="aiheal-stat">
                    <span class="value">{_text(item["value"], lang)}</span>
                    <span class="label">{_text(item["label"], lang)}</span>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.write("")
    trend_left, trend_right = st.columns([1.1, 0.9], gap="large")
    with trend_left:
        trend = page["trend_tracking"]
        _section_heading(_text(trend["title"], lang), _text(trend["description"], lang))
        st.line_chart(_signal_dataframe(lang), use_container_width=True)
    with trend_right:
        st.markdown(f"### {_copy(lang, '趋势解读重点', 'What the trends mean')}")
        for bullet in page["trend_tracking"]["bullets"]:
            st.markdown(f"- {_text(bullet, lang)}")

        st.markdown(f"### {_text(page['ai_report']['title'], lang)}")
        st.markdown(_text(page["ai_report"]["description"], lang))
        for bullet in page["ai_report"]["bullets"]:
            st.markdown(f"- {_text(bullet, lang)}")

    st.write("")
    comparison = page["comparison"]
    _section_heading(_text(comparison["title"], lang), "")
    comparison_rows = []
    legacy_label = _copy(lang, "传统方式", "Legacy way")
    for row in comparison["rows"]:
        comparison_rows.append(
            {
                _copy(lang, "维度", "Dimension"): _text(row["dimension"], lang),
                "AIHeal": _text(row["aiheal"], lang),
                legacy_label: _text(row["legacy"], lang),
            }
        )
    st.dataframe(pd.DataFrame(comparison_rows), use_container_width=True, hide_index=True)

    action_cols = st.columns(2)
    with action_cols[0]:
        if st.button(_copy(lang, "查看 Demo 报告", "See the demo report"), key="product-demo", use_container_width=True):
            _go_to_page("demo")
    with action_cols[1]:
        if st.button(_copy(lang, "下载 App", "Download the app"), key="product-download", type="primary", use_container_width=True):
            _go_to_page("download")


def _render_demo(site: dict[str, Any], lang: str) -> None:
    page = site["demo_page"]
    _section_heading(_text(page["headline"], lang), _text(page["description"], lang))

    left, right = st.columns([1.05, 0.95], gap="large")
    with left:
        _report_card(site, lang)
    with right:
        st.markdown(f"### {_copy(lang, '趋势图表', 'Trend chart')}")
        st.line_chart(_signal_dataframe(lang), use_container_width=True)
        st.caption(
            _copy(
                lang,
                "图表是示例，但它说明了报告必须建立在趋势之上，而不是一句模糊结论。",
                "The chart is illustrative, but it shows that the report must be grounded in trends rather than a vague one-line judgment.",
            )
        )

    st.write("")
    logic = page["analysis_logic"]
    _section_heading(_text(logic["title"], lang), _copy(lang, "一份可信的报告背后是什么逻辑。", "What logic sits behind a report users can trust."))
    cols = st.columns(len(logic["steps"]))
    for col, item in zip(cols, logic["steps"]):
        with col:
            _card(_text(item["title"], lang), _text(item["body"], lang))

    st.write("")
    risk = page["risk_detection"]
    _section_heading(_text(risk["title"], lang), _copy(lang, "系统会优先标记最值得注意的模式。", "The system highlights the patterns that deserve attention first."))
    cols = st.columns(len(risk["items"]))
    severity_text = {
        "high": _copy(lang, "高优先级", "High priority"),
        "medium": _copy(lang, "中等优先级", "Medium priority"),
        "low": _copy(lang, "低优先级", "Low priority"),
    }
    for col, item in zip(cols, risk["items"]):
        with col:
            with st.container(border=True):
                st.caption(severity_text.get(item["severity"], item["severity"]))
                st.markdown(f"**{_text(item['title'], lang)}**")
                st.markdown(_text(item["body"], lang))

    st.write("")
    action_plan = page["action_plan"]
    _section_heading(_text(action_plan["title"], lang), _copy(lang, "建议必须具体到今天就能执行。", "Recommendations must be concrete enough to act on today."))
    with st.container(border=True):
        for idx, item in enumerate(action_plan["items"], start=1):
            st.markdown(f"{idx}. {_text(item, lang)}")
        st.info(_text(action_plan["follow_up"], lang))

    action_cols = st.columns(2)
    with action_cols[0]:
        if st.button(_copy(lang, "立即体验", "Try it now"), key="demo-download", type="primary", use_container_width=True):
            _go_to_page("download")
    with action_cols[1]:
        if st.button(_copy(lang, "查看产品能力", "Explore the product"), key="demo-product", use_container_width=True):
            _go_to_page("product")


def _render_scenarios(site: dict[str, Any], lang: str) -> None:
    page = site["scenarios_page"]
    _section_heading(_text(page["headline"], lang), _text(page["description"], lang))

    rows = [page["items"][:2], page["items"][2:]]
    for group in rows:
        cols = st.columns(2, gap="large")
        for col, item in zip(cols, group):
            with col:
                with st.container(border=True):
                    st.markdown(f"### {_text(item['title'], lang)}")
                    st.markdown(f"**{_copy(lang, '问题', 'Problem')}**")
                    st.markdown(_text(item["problem"], lang))
                    st.markdown(f"**{_copy(lang, 'AIHeal 带来的结果', 'Outcome with AIHeal')}**")
                    st.markdown(_text(item["outcome"], lang))

    if st.button(_copy(lang, "查看示例报告", "View sample report"), key="scenarios-demo", type="primary", use_container_width=True):
        _go_to_page("demo")


def _render_technology(site: dict[str, Any], lang: str) -> None:
    page = site["technology_page"]
    _section_heading(_text(page["headline"], lang), _text(page["description"], lang))

    cols = st.columns(2, gap="large")
    for col, item in zip(cols * 2, page["sections"]):
        with col:
            _card(_text(item["title"], lang), _text(item["body"], lang))

    st.write("")
    with st.container(border=True):
        st.markdown(f"**{_copy(lang, '核心提示', 'Core reminder')}**")
        st.markdown(_text(page["note"], lang))


def _render_download(site: dict[str, Any], lang: str) -> None:
    page = site["download_page"]
    _section_heading(_text(page["headline"], lang), _text(page["description"], lang))

    left, right = st.columns([1, 0.85], gap="large")
    with left:
        platform_cols = st.columns(len(page["platforms"]))
        for col, item in zip(platform_cols, page["platforms"]):
            with col:
                _card(_text(item["title"], lang), _text(item["body"], lang))

        st.write("")
        with st.container(border=True):
            st.markdown(f"### {_copy(lang, '首次使用体验', 'First-use experience')}")
            for item in page["onboarding"]:
                st.markdown(f"- {_text(item, lang)}")
    with right:
        st.markdown(f"### {_text(page['qr']['title'], lang)}")
        st.markdown("<div class='aiheal-qr'></div>", unsafe_allow_html=True)
        st.caption(_text(page["qr"]["body"], lang))
        st.code(page["qr"]["link"])

    action_cols = st.columns(2)
    with action_cols[0]:
        if st.button(_copy(lang, "先看 Demo", "See the demo first"), key="download-demo", use_container_width=True):
            _go_to_page("demo")
    with action_cols[1]:
        if st.button(_copy(lang, "进入开发者入口", "Open developer entry"), key="download-developers", use_container_width=True):
            _go_to_page("developers")


def _render_developers(site: dict[str, Any], lang: str) -> None:
    page = site["developers_page"]
    _section_heading(_text(page["headline"], lang), _text(page["description"], lang))

    cols = st.columns(3, gap="large")
    for col, card in zip(cols, page["cards"]):
        with col:
            _card(_text(card["title"], lang), _text(card["body"], lang))

    snippet_left, snippet_right = st.columns(2, gap="large")
    with snippet_left:
        st.markdown("### API")
        st.caption(_copy(lang, "结构化报告接口示意", "Example structured report request"))
        st.code(page["api_snippet"], language="json")
    with snippet_right:
        st.markdown("### SDK")
        st.caption(_copy(lang, "嵌入式调用示意", "Example embedded SDK usage"))
        st.code(page["sdk_snippet"], language="typescript")

    st.write("")
    with st.container(border=True):
        console = page["internal_console"]
        st.markdown(f"### {_text(console['title'], lang)}")
        st.markdown(_text(console["body"], lang))
        st.code(console["command"], language="bash")

    st.write("")
    with st.container(border=True):
        st.markdown(f"### {_copy(lang, '内容与入口文件', 'Content and entry files')}")
        st.markdown(
            _copy(
                lang,
                "当前站点内容来自结构化 JSON，主入口和原始分析控制台分别独立保留。",
                "The site content is driven by structured JSON, while the main entry and original analytics console are preserved separately.",
            )
        )
        st.code(
            "content/aiheal_site.json\nselection_radar/dashboard.py\nselection_radar/analytics_dashboard.py",
            language="text",
        )


def render_aiheal_site() -> None:
    st.set_page_config(page_title="AIHeal", layout="wide", initial_sidebar_state="expanded")
    _inject_styles()

    site = _load_site()
    query_page = _normalize_page(_query_value("page", "home"), site)
    query_lang = _normalize_lang(_query_value("lang", "zh"))
    st.session_state["aiheal_page"] = query_page
    st.session_state["aiheal_lang"] = query_lang

    with st.sidebar:
        st.markdown(f"## {site['name']}")
        st.caption(_text(site["tagline"], query_lang))
        language = st.radio(
            _copy(query_lang, "语言", "Language"),
            options=["zh", "en"],
            index=0 if query_lang == "zh" else 1,
            format_func=lambda code: "中文" if code == "zh" else "English",
        )
        if language != query_lang:
            st.session_state["aiheal_lang"] = language
            _set_query_values(page=query_page, lang=language)
            st.rerun()

        st.divider()
        st.markdown(f"### {_copy(language, '核心路径', 'Core path')}")
        for step in site["conversion_funnel"]["path"]:
            st.markdown(f"- {_text(step, language)}")
        st.caption(
            _copy(
                language,
                "不登录也能先看 Demo，并在首次使用时立刻给出结果。",
                "Let users see the demo without login and deliver a result immediately on first use.",
            )
        )

    current_lang = st.session_state["aiheal_lang"]
    current_page = st.session_state["aiheal_page"]

    brand_col, meta_col = st.columns([1.8, 1], gap="large")
    with brand_col:
        st.markdown(f"<div class='aiheal-brand'>{site['name']}</div>", unsafe_allow_html=True)
        st.markdown(f"<div class='aiheal-tagline'>{_text(site['tagline'], current_lang)}</div>", unsafe_allow_html=True)
    with meta_col:
        st.caption(_copy(current_lang, "当前页面", "Current page"))
        st.markdown(f"**{_page_label(site, current_page, current_lang)}**")
        if st.button(_copy(current_lang, "下载 App", "Download App"), key="top-download", type="primary", use_container_width=True):
            _go_to_page("download")

    nav_cols = st.columns(len(PAGE_ORDER))
    for col, page in zip(nav_cols, PAGE_ORDER):
        with col:
            if st.button(
                _page_label(site, page, current_lang),
                key=f"nav-{page}",
                use_container_width=True,
                type="primary" if current_page == page else "secondary",
            ):
                if page != current_page:
                    _go_to_page(page)

    st.divider()

    renderers = {
        "home": _render_home,
        "product": _render_product,
        "demo": _render_demo,
        "scenarios": _render_scenarios,
        "technology": _render_technology,
        "download": _render_download,
        "developers": _render_developers,
    }
    renderers[current_page](site, current_lang)

    st.divider()
    st.markdown(
        f"<div class='aiheal-note'>{_copy(current_lang, 'AIHeal 站点内容来自 content/aiheal_site.json，原始分析看板保留在 selection_radar/analytics_dashboard.py。', 'AIHeal site content is driven by content/aiheal_site.json, while the original analytics console remains in selection_radar/analytics_dashboard.py.')}</div>",
        unsafe_allow_html=True,
    )
