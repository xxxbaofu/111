"""Shared content and rendering helpers for the AIHeal Streamlit site."""

from __future__ import annotations

import json
from typing import Final

import pandas as pd
import streamlit as st

SITE_STRUCTURE: Final = {
    "site": {
        "name": "AIHeal",
        "structure": [
            {
                "page": "home",
                "sections": [
                    "hero",
                    "core_features",
                    "demo_report",
                    "use_cases",
                    "data_sources",
                    "cta",
                    "infrastructure",
                    "developer_entry",
                ],
            },
            {
                "page": "product",
                "sections": [
                    "overview",
                    "health_snapshot",
                    "trend_tracking",
                    "ai_report",
                    "comparison",
                ],
            },
            {
                "page": "demo",
                "sections": [
                    "full_report",
                    "analysis_logic",
                    "risk_detection",
                    "action_plan",
                ],
            },
            {
                "page": "scenarios",
                "sections": [
                    "office_workers",
                    "family_health",
                    "fitness_users",
                    "chronic_conditions",
                ],
            },
            {
                "page": "technology",
                "sections": [
                    "data_ownership",
                    "privacy",
                    "ai_model",
                    "decentralization",
                ],
            },
            {
                "page": "download",
                "sections": [
                    "ios",
                    "android",
                    "qr_code",
                ],
            },
            {
                "page": "developers",
                "sections": [
                    "api",
                    "agent",
                    "sdk",
                ],
            },
        ]
    }
}

PAGE_META: Final = {
    "home": {"title": "AIHeal | Home", "label": "Home", "path": "Home.py"},
    "product": {"title": "AIHeal | Product", "label": "Product", "path": "pages/01_Product.py"},
    "demo": {"title": "AIHeal | Demo", "label": "Demo", "path": "pages/02_Demo_Report.py"},
    "scenarios": {"title": "AIHeal | Scenarios", "label": "Scenarios", "path": "pages/03_Scenarios.py"},
    "technology": {"title": "AIHeal | Technology", "label": "Technology", "path": "pages/04_Technology.py"},
    "download": {"title": "AIHeal | Download", "label": "Download", "path": "pages/05_Download.py"},
    "developers": {"title": "AIHeal | Developers", "label": "Developers", "path": "pages/06_Developers.py"},
}

CONVERSION_FUNNEL: Final = [
    {"title": "首页", "goal": "让用户看懂 AIHeal 能帮他什么。"},
    {"title": "查看报告 Demo", "goal": "让用户相信输出结果具体且可信。"},
    {"title": "下载 App", "goal": "降低阻力，不登录也能先看示例。"},
    {"title": "首次分析", "goal": "立刻给出评分与建议，不让用户等待。"},
    {"title": "留存", "goal": "用趋势追踪与提醒形成日常习惯。"},
]

CORE_FEATURES: Final = [
    {
        "title": "健康评分",
        "description": "实时生成你的健康状态评分，让每天的身体状态有一个清晰起点。",
        "metric_label": "今日状态",
        "metric_value": "82 / 100",
    },
    {
        "title": "趋势分析",
        "description": "持续追踪睡眠、心率、活动变化，帮助你看到身体的长期信号。",
        "metric_label": "已建立基线",
        "metric_value": "4 周趋势",
    },
    {
        "title": "AI 报告",
        "description": "自动发现风险、解释原因，并生成今天就能执行的行动建议。",
        "metric_label": "本周建议",
        "metric_value": "3 条",
    },
]

HOME_USE_CASES: Final = [
    {
        "title": "打工人",
        "description": "睡眠差但不知道原因，AI 从作息、活动和压力信号里找出关键问题。",
    },
    {
        "title": "家庭",
        "description": "父母健康趋势出现变化时，系统自动提醒，让关心更及时。",
    },
    {
        "title": "健身",
        "description": "把训练、恢复和睡眠放到同一张图里，帮助优化训练效果。",
    },
]

DATA_SOURCES: Final = [
    {"title": "Apple Health", "description": "统一读取步数、睡眠、心率等基础健康信号。"},
    {"title": "智能设备", "description": "兼容手表、手环和其他可穿戴设备的数据输入。"},
    {"title": "手动输入", "description": "用户可主动补充情绪、疼痛、用药和生活习惯信息。"},
    {"title": "医疗报告", "description": "将体检或化验结果纳入上下文，提升 AI 判断的完整性。"},
]

INFRASTRUCTURE_PILLARS: Final = [
    {"title": "数据主权", "description": "用户决定连接哪些数据源，也决定哪些 AI 能读取这些数据。"},
    {"title": "隐私保护", "description": "敏感健康信息默认按最小权限处理，尽量减少暴露面。"},
    {"title": "去中心化", "description": "基础设施支持多端接入与可迁移性，不把健康历史锁死在单一平台。"},
]

PRODUCT_OVERVIEW: Final = [
    {"title": "Health Snapshot", "description": "用一页概览查看今天的身体状态、恢复情况和主要异常。"},
    {"title": "Trend Tracking", "description": "用趋势而不是单点数据理解自己，避免被偶发波动误导。"},
    {"title": "AI Report", "description": "从原始健康信号到结论、风险和行动建议，一次性给出结果。"},
]

DEMO_REPORT: Final = {
    "score": "82 / 100",
    "status": "良好",
    "findings": ["睡眠质量下降", "心率波动异常"],
    "risk": "近期可能存在疲劳累积风险。",
    "analysis": "你的睡眠时长减少，同时夜间心率偏高，可能与压力或作息不规律有关。",
    "actions": ["提前 30 分钟入睡", "减少晚间蓝光", "增加轻度运动"],
}

PRODUCT_COMPARISON: Final = [
    {
        "方式": "手动记录",
        "理解成本": "高",
        "是否能发现风险": "弱",
        "是否能给行动建议": "几乎没有",
        "是否适合日常坚持": "低",
    },
    {
        "方式": "普通设备面板",
        "理解成本": "中",
        "是否能发现风险": "一般",
        "是否能给行动建议": "有限",
        "是否适合日常坚持": "中",
    },
    {
        "方式": "AIHeal",
        "理解成本": "低",
        "是否能发现风险": "强",
        "是否能给行动建议": "强",
        "是否适合日常坚持": "高",
    },
]

SCENARIO_DETAILS: Final = {
    "打工人": {
        "problem": "白天很累，但不知道是睡眠、压力还是活动结构出了问题。",
        "outcome": "AI 自动把睡眠债、心率负荷和活动不足串成一条因果线，减少靠感觉判断。",
        "report": "优先修复晚间作息，降低夜间唤醒次数，并补齐轻运动时段。",
    },
    "家庭健康": {
        "problem": "父母不一定会主动表达不舒服，但数据变化常常先出现。",
        "outcome": "系统持续监测趋势偏离，在状态连续恶化时发出提醒。",
        "report": "近 2 周步数下降 18%，睡眠片段化增加，建议补充问诊或复查。",
    },
    "健身用户": {
        "problem": "训练量增加了，但恢复质量、心率和睡眠未必同步跟上。",
        "outcome": "把训练刺激和恢复结果放在同一个模型里看，避免越练越疲劳。",
        "report": "恢复指数下降，建议把今天训练强度下调到轻中等并优先补觉。",
    },
    "慢性健康管理": {
        "problem": "慢性状况更需要看趋势和异常组合，而不是只看单次读数。",
        "outcome": "AI 输出连续趋势摘要，帮助用户与家属更快注意到变化。",
        "report": "连续 7 天睡眠不足并伴随静息心率抬升，需关注疲劳和依从性问题。",
    },
}

TECHNOLOGY_PILLARS: Final = [
    {
        "title": "Data Ownership",
        "description": "用户不是数据的租客。每一份健康数据都应当可导入、可审计、可迁移。",
    },
    {
        "title": "Privacy by Default",
        "description": "AI 只处理完成分析所需的最小上下文，不把隐私当作增长代价。",
    },
    {
        "title": "Health AI Model",
        "description": "模型先理解趋势，再判断异常，再生成清晰建议，而不是只输出模糊安慰。",
    },
    {
        "title": "Decentralized Interoperability",
        "description": "底层能力支持开放接入，方便未来对接更多设备、代理与健康应用。",
    },
]

DOWNLOAD_CHANNELS: Final = [
    {
        "title": "iOS",
        "description": "优先接入 Apple Health，适合对健康数据自动同步要求较高的用户。",
        "status": "TestFlight waitlist",
    },
    {
        "title": "Android",
        "description": "面向更多设备生态，支持手环、手机健康服务与手动补充信息。",
        "status": "Beta signup",
    },
]

DEVELOPER_RESOURCES: Final = {
    "api": {
        "title": "Health Insight API",
        "description": "面向健康应用、陪练 Agent 和家庭健康工具输出统一的风险分析结果。",
        "snippet": """POST /v1/health/report
{
  "user_id": "demo-user",
  "signals": {
    "sleep_hours": 6.1,
    "resting_heart_rate": 74,
    "activity_minutes": 28
  }
}""",
    },
    "agent": {
        "title": "Agent Workflow",
        "description": "Agent 先读取授权后的健康上下文，再调用评分、风险检测和建议生成模块。",
        "snippet": """1. Collect signals
2. Build baseline
3. Detect risk clusters
4. Generate action plan""",
    },
    "sdk": {
        "title": "SDK Direction",
        "description": "SDK 面向 iOS、Android 和 server-side tools，统一事件模型与授权接口。",
        "snippet": """from aiheal import Client

client = Client(api_key="demo-key")
report = client.reports.create(user_id="demo-user")
print(report.health_score)""",
    },
}

QR_PATTERN: Final = [
    "1111111001001111",
    "1000001011100001",
    "1011101000101111",
    "1011101011101001",
    "1011101000101011",
    "1000001010110001",
    "1111111010101111",
    "0001000001010000",
    "1110111011101110",
    "0010001010000010",
    "1111111010111010",
    "1000001000101010",
    "1011101011101010",
    "1000101000100010",
    "1110101110111010",
    "1111111001001111",
]


def configure_page(page_key: str) -> None:
    """Apply consistent page configuration and theme."""

    st.set_page_config(page_title=PAGE_META[page_key]["title"], layout="wide")
    apply_brand_theme()


def apply_brand_theme() -> None:
    """Inject a lightweight brand theme for the marketing site."""

    st.markdown(
        """
        <style>
        .block-container {
            padding-top: 2rem;
            padding-bottom: 4rem;
            max-width: 1180px;
        }
        .aiheal-badge {
            display: inline-block;
            padding: 0.35rem 0.8rem;
            border-radius: 999px;
            background: linear-gradient(90deg, #0ea5e9, #22c55e);
            color: white;
            font-size: 0.85rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .hero-card {
            border: 1px solid rgba(14, 165, 233, 0.16);
            border-radius: 24px;
            padding: 1.4rem;
            background: linear-gradient(180deg, rgba(14, 165, 233, 0.08), rgba(255, 255, 255, 0.9));
        }
        .phone-shell {
            border: 10px solid #0f172a;
            border-radius: 28px;
            padding: 1rem;
            background: linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%);
            box-shadow: 0 20px 45px rgba(15, 23, 42, 0.16);
        }
        .phone-title {
            font-size: 0.8rem;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 0.5rem;
        }
        .phone-score {
            display: flex;
            align-items: baseline;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        .phone-score strong {
            font-size: 2rem;
            color: #0f172a;
        }
        .phone-pill {
            display: inline-block;
            margin-top: 0.4rem;
            padding: 0.25rem 0.6rem;
            border-radius: 999px;
            background: #dcfce7;
            color: #166534;
            font-size: 0.75rem;
            font-weight: 600;
        }
        .phone-row {
            display: flex;
            justify-content: space-between;
            padding: 0.7rem 0.8rem;
            margin-top: 0.5rem;
            border-radius: 14px;
            background: white;
            border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .phone-row span {
            color: #475569;
        }
        .section-kicker {
            color: #0284c7;
            font-size: 0.9rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
        }
        .section-caption {
            color: #475569;
            max-width: 760px;
        }
        .cta-banner {
            border-radius: 24px;
            padding: 1.5rem;
            background: linear-gradient(135deg, #082f49, #0f766e);
            color: white;
        }
        .cta-banner p {
            color: rgba(255, 255, 255, 0.82);
        }
        .qr-grid {
            display: inline-grid;
            grid-template-columns: repeat(16, 12px);
            gap: 3px;
            padding: 16px;
            background: white;
            border-radius: 18px;
            border: 1px solid rgba(148, 163, 184, 0.25);
        }
        .qr-cell {
            width: 12px;
            height: 12px;
            border-radius: 2px;
            background: #e2e8f0;
        }
        .qr-cell.filled {
            background: #0f172a;
        }
        div[data-testid="stMetric"] {
            background: rgba(248, 250, 252, 0.9);
            border: 1px solid rgba(148, 163, 184, 0.2);
            padding: 0.85rem;
            border-radius: 18px;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_sidebar(page_key: str) -> None:
    """Render shared sidebar content for all pages."""

    with st.sidebar:
        st.markdown("## AIHeal")
        st.caption("Your AI Health Copilot")
        st.caption("Understand your body through data, not guesswork.")

        if hasattr(st, "page_link"):
            st.page_link("Home.py", label="Home", use_container_width=True)
            for item in PAGE_META.values():
                if item["path"] != "Home.py":
                    st.page_link(item["path"], label=item["label"], use_container_width=True)

        st.divider()
        st.markdown("### 转化漏斗")
        for index, step in enumerate(CONVERSION_FUNNEL, start=1):
            prefix = "->" if index == 1 else f"{index}."
            st.markdown(f"{prefix} **{step['title']}**")
            st.caption(step["goal"])

        st.divider()
        active_sections = next(
            entry["sections"] for entry in SITE_STRUCTURE["site"]["structure"] if entry["page"] == page_key
        )
        st.markdown("### 当前页面结构")
        for section in active_sections:
            st.markdown(f"- `{section}`")

        with st.expander("整站 JSON 结构", expanded=False):
            st.code(json.dumps(SITE_STRUCTURE, ensure_ascii=False, indent=2), language="json")


def render_top_nav(active_page: str) -> None:
    """Render a lightweight top navigation bar."""

    columns = st.columns([1.7] + [1] * len(PAGE_META))
    with columns[0]:
        st.markdown("### AIHeal")
        st.caption("AI 健康管家")

    for column, (page_key, item) in zip(columns[1:], PAGE_META.items()):
        with column:
            if page_key == active_page:
                st.markdown(f"**{item['label']}**")
            elif hasattr(st, "page_link"):
                st.page_link(item["path"], label=item["label"], use_container_width=True)
            else:
                st.caption(item["label"])

    st.divider()


def render_section_intro(kicker: str, title: str, description: str) -> None:
    """Render a section heading trio."""

    st.markdown(f'<div class="section-kicker">{kicker}</div>', unsafe_allow_html=True)
    st.markdown(f"## {title}")
    st.markdown(f'<div class="section-caption">{description}</div>', unsafe_allow_html=True)


def render_card_grid(items: list[dict[str, str]], columns_count: int = 3) -> None:
    """Render a simple grid of bordered content cards."""

    columns = st.columns(columns_count)
    for index, item in enumerate(items):
        with columns[index % columns_count]:
            with st.container(border=True):
                st.markdown(f"### {item['title']}")
                st.write(item["description"])
                metric_label = item.get("metric_label")
                metric_value = item.get("metric_value")
                if metric_label and metric_value:
                    st.metric(metric_label, metric_value)
                status = item.get("status")
                if status:
                    st.caption(status)


def build_demo_trend_frame() -> pd.DataFrame:
    """Return the report trend chart used across the site."""

    return pd.DataFrame(
        {
            "Week": ["Week 1", "Week 2", "Week 3", "Week 4"],
            "Health Score": [76, 80, 79, 82],
            "Recovery Index": [71, 74, 72, 78],
            "Stress Load": [68, 65, 70, 61],
        }
    )


def build_vital_signals_frame() -> pd.DataFrame:
    """Return sample vital sign data shown in product and demo pages."""

    return pd.DataFrame(
        {
            "Day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            "Sleep Hours": [6.2, 6.4, 5.9, 6.1, 6.7, 7.1, 6.8],
            "Resting Heart Rate": [73, 72, 75, 76, 74, 71, 72],
            "Active Minutes": [24, 31, 22, 18, 34, 48, 42],
        }
    )


def _page_button(label: str, target_page: str, button_type: str, key: str) -> None:
    """Render a navigation button with a Streamlit fallback."""

    if st.button(label, type=button_type, use_container_width=True, key=key):
        if hasattr(st, "switch_page"):
            st.switch_page(target_page)
        else:
            st.info("Please use the sidebar navigation in this Streamlit version.")


def _render_phone_mockup() -> None:
    """Render the hero phone preview."""

    st.markdown(
        """
        <div class="phone-shell">
          <div class="phone-title">AIHeal Today</div>
          <div class="phone-score">
            <span>Health Score</span>
            <strong>82</strong>
          </div>
          <div class="phone-pill">Status: Good</div>
          <div class="phone-row"><span>Sleep</span><strong>6h 48m</strong></div>
          <div class="phone-row"><span>Resting HR</span><strong>72 bpm</strong></div>
          <div class="phone-row"><span>Recovery</span><strong>Stable</strong></div>
          <div class="phone-row"><span>Next action</span><strong>Sleep 30m earlier</strong></div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _build_qr_html() -> str:
    """Build a small pseudo QR block for the download page."""

    cells: list[str] = []
    for row in QR_PATTERN:
        for cell in row:
            classes = "qr-cell filled" if cell == "1" else "qr-cell"
            cells.append(f'<span class="{classes}"></span>')
    return '<div class="qr-grid">' + "".join(cells) + "</div>"


def render_footer_cta(
    *,
    title: str,
    description: str,
    primary_label: str,
    primary_target: str,
    secondary_label: str,
    secondary_target: str,
    key_prefix: str,
) -> None:
    """Render a shared CTA banner."""

    st.markdown(
        f"""
        <div class="cta-banner">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        """,
        unsafe_allow_html=True,
    )
    c1, c2 = st.columns(2)
    with c1:
        _page_button(primary_label, primary_target, "primary", f"{key_prefix}-primary")
    with c2:
        _page_button(secondary_label, secondary_target, "secondary", f"{key_prefix}-secondary")


def render_home_page() -> None:
    """Render the landing page."""

    render_sidebar("home")
    render_top_nav("home")

    left, right = st.columns([1.2, 0.8], vertical_alignment="center")
    with left:
        st.markdown('<div class="aiheal-badge">AI-powered everyday wellbeing</div>', unsafe_allow_html=True)
        st.title("AI 健康管家")
        st.subheader("用数据理解你的身体，而不是猜")
        st.write("AI 自动分析你的健康数据，发现潜在风险，并生成可执行的健康建议。")
        st.caption("Your AI Health Copilot")
        st.caption("Understand your body through data, not guesswork.")
        st.caption(
            "AI analyzes your health signals, detects risks, and generates actionable insights for everyday wellbeing."
        )

        cta_left, cta_right = st.columns(2)
        with cta_left:
            _page_button("立即体验", PAGE_META["demo"]["path"], "primary", "home-hero-demo")
        with cta_right:
            _page_button("查看示例报告", PAGE_META["demo"]["path"], "secondary", "home-hero-report")

        with st.container(border=True):
            st.markdown("### 用户路径")
            st.markdown("首页 -> 查看报告 Demo -> 点击体验 -> 下载 App -> 首次分析 -> 留存")
            st.caption("首页要让用户看懂，Demo 要让用户相信，下载要降低阻力，首次使用必须立刻给结果。")

    with right:
        _render_phone_mockup()

    st.divider()
    render_section_intro("Core Features", "先讲功能，再讲结果", "用户首先要理解 AIHeal 能帮自己完成什么。")
    render_card_grid(CORE_FEATURES, columns_count=3)

    st.divider()
    render_section_intro("Demo Report", "用结果建立信任", "示例报告是首页最核心的转化模块，需要把结论、风险和建议一眼说清。")
    report_col, trend_col = st.columns([0.95, 1.05], vertical_alignment="top")
    with report_col:
        with st.container(border=True):
            st.metric("Health Score", DEMO_REPORT["score"], f"状态：{DEMO_REPORT['status']}")
            st.markdown("#### 关键发现")
            for finding in DEMO_REPORT["findings"]:
                st.markdown(f"- {finding}")
            st.markdown("#### 风险提示")
            st.warning(DEMO_REPORT["risk"])
            st.markdown("#### AI 分析")
            st.write(DEMO_REPORT["analysis"])
            st.markdown("#### 行动建议")
            for action in DEMO_REPORT["actions"]:
                st.markdown(f"- {action}")

    with trend_col:
        with st.container(border=True):
            st.markdown("#### 趋势")
            st.line_chart(build_demo_trend_frame().set_index("Week"))
            st.caption("趋势图让用户直观看到变化，而不只是读一段 AI 文字。")

    st.divider()
    render_section_intro("Use Cases", "从真实场景解释价值", "不是所有人都懂健康术语，但都能理解自己的具体问题。")
    render_card_grid(HOME_USE_CASES, columns_count=3)

    st.divider()
    render_section_intro("Data Sources", "把关键输入说清楚", "数据越完整，健康理解越接近真实状态。")
    render_card_grid(DATA_SOURCES, columns_count=4)

    st.divider()
    render_footer_cta(
        title="Ready to see your first health snapshot?",
        description="不登录也能先看 Demo，真正使用时要尽快给出评分和建议。",
        primary_label="Download App",
        primary_target=PAGE_META["download"]["path"],
        secondary_label="立即开始",
        secondary_target=PAGE_META["demo"]["path"],
        key_prefix="home-cta",
    )

    st.divider()
    render_section_intro(
        "Infrastructure",
        "Personal Health AI Infrastructure",
        "在用户先理解价值之后，再说明底层如何保障数据主权、隐私与可迁移性。",
    )
    render_card_grid(INFRASTRUCTURE_PILLARS, columns_count=3)

    st.divider()
    render_section_intro(
        "Developer Entry",
        "给开发者一个清晰入口",
        "AIHeal 面向 API、Agent 和 SDK 开放，同时保留仓库原有的数据工作台能力。",
    )
    dev_left, dev_right = st.columns([1, 1], vertical_alignment="top")
    with dev_left:
        render_card_grid(
            [
                {"title": "API", "description": "统一健康分析输出，方便接入 App、助手和家庭健康产品。"},
                {"title": "Agent", "description": "用代理去做解释、提醒与陪伴式健康工作流。"},
                {"title": "SDK", "description": "为 iOS、Android 和服务端提供一致的开发接口。"},
            ],
            columns_count=1,
        )
    with dev_right:
        with st.container(border=True):
            st.markdown("### Legacy dashboard")
            st.write("仓库当前仍保留原有 Streamlit 数据工作台，方便开发者查看现有数据流程。")
            st.code(
                "streamlit run selection_radar/dashboard.py --server.port 8501 --server.headless true",
                language="bash",
            )
            _page_button("进入 Developers 页面", PAGE_META["developers"]["path"], "primary", "home-developers")


def render_product_page() -> None:
    """Render the product page."""

    render_sidebar("product")
    render_top_nav("product")
    render_section_intro(
        "Product",
        "A product that turns signals into decisions",
        "Product 页面需要把概览、状态、趋势、AI 报告和差异化能力串成一条完整链路。",
    )

    render_card_grid(PRODUCT_OVERVIEW, columns_count=3)
    st.divider()

    render_section_intro(
        "Health Snapshot",
        "一天的状态，从一个页面开始",
        "先给一个清晰总览，让用户知道今天身体是更接近恢复、透支还是稳定。",
    )
    snapshot_cols = st.columns(4)
    snapshot_metrics = [
        ("Health Score", "82 / 100", "+3 vs last week"),
        ("Sleep", "6h 48m", "仍低于个人基线"),
        ("Resting HR", "72 bpm", "-2 bpm"),
        ("Activity", "42 min", "接近目标"),
    ]
    for col, (label, value, delta) in zip(snapshot_cols, snapshot_metrics):
        with col:
            st.metric(label, value, delta)

    st.divider()
    render_section_intro(
        "Trend Tracking",
        "趋势比单点更重要",
        "睡眠、心率和活动只有放在连续时间里看，才会形成可靠判断。",
    )
    vitals_col, score_col = st.columns([1.05, 0.95], vertical_alignment="top")
    with vitals_col:
        with st.container(border=True):
            st.markdown("#### 每日生命体征")
            vitals = build_vital_signals_frame().set_index("Day")
            st.line_chart(vitals)
    with score_col:
        with st.container(border=True):
            st.markdown("#### 4 周趋势概览")
            st.area_chart(build_demo_trend_frame().set_index("Week"))
            st.caption("趋势模块同时服务于健康解释与留存。")

    st.divider()
    render_section_intro(
        "AI Report",
        "不是展示数据，而是解释数据",
        "AIHeal 的输出结构应该总是稳定：关键发现、风险提示、原因分析、行动建议。",
    )
    report_cols = st.columns(3)
    report_blocks = [
        {"title": "关键发现", "description": "睡眠质量下降，夜间恢复不足。"},
        {"title": "风险提示", "description": "近期可能存在疲劳累积和日间注意力下降风险。"},
        {"title": "行动建议", "description": "提前入睡、减少晚间蓝光、把高强度训练改到恢复后。"},
    ]
    for col, block in zip(report_cols, report_blocks):
        with col:
            with st.container(border=True):
                st.markdown(f"### {block['title']}")
                st.write(block["description"])

    st.divider()
    render_section_intro(
        "Comparison",
        "用户为什么会选择 AIHeal",
        "差异化重点不是数据采集本身，而是把多源数据转成可信、可执行的判断。",
    )
    st.dataframe(pd.DataFrame(PRODUCT_COMPARISON), use_container_width=True, hide_index=True)

    st.divider()
    render_footer_cta(
        title="See the full report before you download",
        description="先让用户看到结果，再把下载与首次体验放在自然的位置。",
        primary_label="查看完整 Demo",
        primary_target=PAGE_META["demo"]["path"],
        secondary_label="下载 App",
        secondary_target=PAGE_META["download"]["path"],
        key_prefix="product-cta",
    )


def render_demo_page() -> None:
    """Render the demo report page."""

    render_sidebar("demo")
    render_top_nav("demo")
    render_section_intro(
        "Demo",
        "The report is the conversion engine",
        "Demo 页面要完成两件事：让用户看懂结果，也让用户相信分析逻辑不是黑箱。",
    )

    report_col, side_col = st.columns([1.05, 0.95], vertical_alignment="top")
    with report_col:
        with st.container(border=True):
            st.markdown("### 完整报告")
            st.metric("Health Score", DEMO_REPORT["score"], f"状态：{DEMO_REPORT['status']}")
            st.markdown("#### 关键发现")
            for finding in DEMO_REPORT["findings"]:
                st.markdown(f"- {finding}")
            st.markdown("#### 风险提示")
            st.error(DEMO_REPORT["risk"])
            st.markdown("#### AI 分析")
            st.write(DEMO_REPORT["analysis"])
            st.markdown("#### 行动建议")
            for index, action in enumerate(DEMO_REPORT["actions"], start=1):
                st.markdown(f"{index}. {action}")
    with side_col:
        with st.container(border=True):
            st.markdown("### 趋势图")
            st.line_chart(build_demo_trend_frame().set_index("Week"))
            st.markdown("### 生命体征")
            st.dataframe(build_vital_signals_frame(), use_container_width=True, hide_index=True)

    st.divider()
    render_section_intro(
        "Analysis Logic",
        "让用户知道 AI 是怎么得出结论的",
        "解释顺序遵循：信号采集 -> 建立基线 -> 风险识别 -> 行动建议。",
    )
    logic_steps = [
        {"title": "1. Collect", "description": "从 Apple Health、设备、手动输入和报告读取健康信号。"},
        {"title": "2. Baseline", "description": "先建立个人基线，而不是拿单次读数做绝对判断。"},
        {"title": "3. Detect", "description": "识别睡眠、心率、恢复和活动之间的异常组合。"},
        {"title": "4. Recommend", "description": "把结论翻译成今天就能执行的建议。"},
    ]
    render_card_grid(logic_steps, columns_count=4)

    st.divider()
    render_section_intro(
        "Risk Detection",
        "风险不是靠猜，是靠组合信号",
        "当多个信号同时偏离基线时，AIHeal 会优先标记真正值得注意的问题。",
    )
    risk_cols = st.columns(3)
    risk_cards = [
        ("睡眠债", 72, "连续 4 天睡眠不足"),
        ("恢复不足", 64, "夜间恢复指数偏低"),
        ("压力负荷", 68, "心率抬升且活动碎片化"),
    ]
    for col, (label, value, note) in zip(risk_cols, risk_cards):
        with col:
            with st.container(border=True):
                st.markdown(f"### {label}")
                st.progress(value / 100)
                st.caption(note)

    st.divider()
    render_section_intro(
        "Action Plan",
        "建议要可执行，而不是泛泛而谈",
        "AIHeal 给出的建议必须贴近日常节奏，降低执行门槛。",
    )
    action_plan = pd.DataFrame(
        [
            {"Priority": "High", "Action": "Tonight: sleep 30 minutes earlier", "Expected impact": "Reduce sleep debt"},
            {"Priority": "Medium", "Action": "After dinner: reduce blue light exposure", "Expected impact": "Improve sleep onset"},
            {"Priority": "Medium", "Action": "Tomorrow: 20 minutes light activity", "Expected impact": "Stabilize recovery"},
        ]
    )
    st.dataframe(action_plan, use_container_width=True, hide_index=True)

    with st.expander("查看示例 JSON 输出", expanded=False):
        st.code(
            json.dumps(
                {
                    "health_score": 82,
                    "status": "good",
                    "findings": DEMO_REPORT["findings"],
                    "risk": DEMO_REPORT["risk"],
                    "analysis": DEMO_REPORT["analysis"],
                    "actions": DEMO_REPORT["actions"],
                },
                ensure_ascii=False,
                indent=2,
            ),
            language="json",
        )

    st.divider()
    render_footer_cta(
        title="体验完整的首次分析路径",
        description="先看示例，再下载 App，首次进入就应该快速给出第一份健康评分。",
        primary_label="下载 App",
        primary_target=PAGE_META["download"]["path"],
        secondary_label="查看 Product",
        secondary_target=PAGE_META["product"]["path"],
        key_prefix="demo-cta",
    )


def render_scenarios_page() -> None:
    """Render the scenario page."""

    render_sidebar("scenarios")
    render_top_nav("scenarios")
    render_section_intro(
        "Scenarios",
        "把抽象能力翻译成具体生活",
        "场景化表达能让用户迅速判断自己是不是 AIHeal 的目标用户。",
    )

    tabs = st.tabs(list(SCENARIO_DETAILS.keys()))
    for tab, (name, detail) in zip(tabs, SCENARIO_DETAILS.items()):
        with tab:
            problem_col, result_col = st.columns(2, vertical_alignment="top")
            with problem_col:
                with st.container(border=True):
                    st.markdown(f"### {name}")
                    st.markdown("#### 用户问题")
                    st.write(detail["problem"])
                    st.markdown("#### AIHeal 价值")
                    st.write(detail["outcome"])
            with result_col:
                with st.container(border=True):
                    st.markdown("### 示例输出")
                    st.write(detail["report"])

    st.divider()
    render_footer_cta(
        title="Need a report users can understand quickly?",
        description="示例场景之后，最自然的下一步就是让用户去看完整 Demo。",
        primary_label="查看 Demo",
        primary_target=PAGE_META["demo"]["path"],
        secondary_label="回到首页",
        secondary_target=PAGE_META["home"]["path"],
        key_prefix="scenarios-cta",
    )


def render_technology_page() -> None:
    """Render the technology page."""

    render_sidebar("technology")
    render_top_nav("technology")
    render_section_intro(
        "Technology",
        "Trustworthy health infrastructure comes after user value",
        "先解决用户问题，再解释底层技术，是这套站点叙事的核心顺序。",
    )

    render_card_grid(TECHNOLOGY_PILLARS, columns_count=2)
    st.divider()

    detail_cols = st.columns(2, vertical_alignment="top")
    with detail_cols[0]:
        with st.container(border=True):
            st.markdown("### 数据主权与隐私")
            st.markdown("- 用户选择授权范围")
            st.markdown("- 分析前说明数据用途")
            st.markdown("- 敏感数据按最小权限处理")
            st.markdown("- 支持导出、审计与迁移")
    with detail_cols[1]:
        with st.container(border=True):
            st.markdown("### AI 模型与去中心化")
            st.markdown("- 先建立个人基线，再识别异常")
            st.markdown("- 输出稳定报告结构，便于集成")
            st.markdown("- 允许未来接入更多设备与代理")
            st.markdown("- 保持基础设施开放性与可替换性")

    st.divider()
    render_footer_cta(
        title="Technology matters more after trust is built",
        description="当用户已经看懂价值与结果，再回看技术设计，会更容易接受这套愿景。",
        primary_label="查看 Product",
        primary_target=PAGE_META["product"]["path"],
        secondary_label="下载 App",
        secondary_target=PAGE_META["download"]["path"],
        key_prefix="technology-cta",
    )


def render_download_page() -> None:
    """Render the download page."""

    render_sidebar("download")
    render_top_nav("download")
    render_section_intro(
        "Download",
        "Lower friction before signup",
        "下载页需要把阻力降到最低：先给用户方向，再给试用入口和轻量说明。",
    )

    render_card_grid(DOWNLOAD_CHANNELS, columns_count=2)
    st.divider()

    qr_col, info_col = st.columns([0.8, 1.2], vertical_alignment="center")
    with qr_col:
        st.markdown(_build_qr_html(), unsafe_allow_html=True)
    with info_col:
        with st.container(border=True):
            st.markdown("### 扫码或访问下载地址")
            st.write("aiheal.app/download")
            st.caption("不登录也能先浏览 Demo，进入 App 后应立即生成第一份评分。")
            st.code("https://aiheal.app/download", language="text")

    st.divider()
    render_footer_cta(
        title="Want proof before install?",
        description="如果用户还没准备好下载，最好的下一步是继续看示例报告。",
        primary_label="查看示例报告",
        primary_target=PAGE_META["demo"]["path"],
        secondary_label="回到首页",
        secondary_target=PAGE_META["home"]["path"],
        key_prefix="download-cta",
    )


def render_developers_page() -> None:
    """Render the developers page."""

    render_sidebar("developers")
    render_top_nav("developers")
    render_section_intro(
        "Developers",
        "API, agent and SDK entry points",
        "开发者页面需要把可集成能力说清楚，同时给出与现有仓库能力的连接点。",
    )

    columns = st.columns(3, vertical_alignment="top")
    for column, key in zip(columns, ["api", "agent", "sdk"]):
        resource = DEVELOPER_RESOURCES[key]
        with column:
            with st.container(border=True):
                st.markdown(f"### {resource['title']}")
                st.write(resource["description"])
                st.code(resource["snippet"])

    st.divider()
    infra_col, json_col = st.columns(2, vertical_alignment="top")
    with infra_col:
        with st.container(border=True):
            st.markdown("### Current repo developer entry")
            st.write("当前仓库仍保留 Selection Radar 的数据流水线与旧版 Streamlit 工作台。")
            st.code("python main.py --mode run-once", language="bash")
            st.code(
                "streamlit run selection_radar/dashboard.py --server.port 8501 --server.headless true",
                language="bash",
            )
    with json_col:
        with st.container(border=True):
            st.markdown("### Site map JSON")
            st.code(json.dumps(SITE_STRUCTURE, ensure_ascii=False, indent=2), language="json")

    st.divider()
    render_footer_cta(
        title="Build on top of a stable report structure",
        description="统一的报告结构更适合被 API、Agent 与 SDK 长期复用。",
        primary_label="查看 Technology",
        primary_target=PAGE_META["technology"]["path"],
        secondary_label="回到首页",
        secondary_target=PAGE_META["home"]["path"],
        key_prefix="developers-cta",
    )
