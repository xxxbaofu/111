"""Streamlit marketing site for AIHeal."""

from __future__ import annotations

import pandas as pd
import streamlit as st


SITE_STRUCTURE = {
    "home": [
        "hero",
        "core_features",
        "demo_report",
        "use_cases",
        "data_sources",
        "cta",
        "infrastructure",
        "developer_entry",
    ],
    "product": [
        "overview",
        "health_snapshot",
        "trend_tracking",
        "ai_report",
        "comparison",
    ],
    "demo": [
        "full_report",
        "analysis_logic",
        "risk_detection",
        "action_plan",
    ],
    "scenarios": [
        "office_workers",
        "family_health",
        "fitness_users",
        "chronic_conditions",
    ],
    "technology": [
        "data_ownership",
        "privacy",
        "ai_model",
        "decentralization",
    ],
    "download": [
        "ios",
        "android",
        "qr_code",
    ],
    "developers": [
        "api",
        "agent",
        "sdk",
    ],
}

PAGE_LABELS = {
    "home": "Home",
    "product": "Product",
    "demo": "Demo",
    "scenarios": "Scenarios",
    "technology": "Technology",
    "download": "Download",
    "developers": "Developers",
}

HEALTH_TREND = pd.DataFrame(
    {
        "Day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "Sleep Score": [86, 84, 79, 76, 74, 80, 82],
        "Recovery": [88, 85, 80, 78, 75, 81, 84],
        "Stress Load": [42, 45, 51, 58, 61, 50, 46],
    }
).set_index("Day")


def _inject_styles() -> None:
    st.markdown(
        """
        <style>
            .stApp {
                background: linear-gradient(180deg, #f5fbff 0%, #ffffff 30%, #f7fffb 100%);
            }
            .block-container {
                padding-top: 1.5rem;
                padding-bottom: 4rem;
                max-width: 1200px;
            }
            .eyebrow {
                color: #0f766e;
                font-size: 0.9rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }
            .hero-title {
                font-size: 3.2rem;
                line-height: 1.05;
                font-weight: 800;
                color: #0f172a;
                margin: 0.3rem 0 1rem 0;
            }
            .hero-subtitle {
                font-size: 1.35rem;
                line-height: 1.6;
                color: #334155;
                margin-bottom: 0.75rem;
            }
            .hero-description {
                font-size: 1rem;
                line-height: 1.8;
                color: #475569;
                margin-bottom: 1.25rem;
            }
            .section-title {
                font-size: 2rem;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 0.4rem;
            }
            .section-copy {
                color: #475569;
                line-height: 1.8;
                margin-bottom: 1rem;
            }
            .card {
                background: rgba(255, 255, 255, 0.88);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 22px;
                padding: 1.35rem;
                box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
                height: 100%;
            }
            .card h3, .card h4 {
                color: #0f172a;
                margin-top: 0;
                margin-bottom: 0.55rem;
            }
            .card p, .card li {
                color: #475569;
                line-height: 1.7;
            }
            .pill {
                display: inline-block;
                padding: 0.35rem 0.7rem;
                border-radius: 999px;
                background: #e6fffb;
                color: #0f766e;
                font-weight: 700;
                font-size: 0.82rem;
                margin-right: 0.35rem;
                margin-bottom: 0.35rem;
            }
            .phone-shell {
                background: linear-gradient(180deg, #0f172a 0%, #111827 100%);
                color: #f8fafc;
                border-radius: 32px;
                padding: 1.2rem;
                border: 6px solid #1e293b;
                box-shadow: 0 20px 50px rgba(15, 23, 42, 0.28);
            }
            .phone-top {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                font-size: 0.82rem;
                color: #cbd5e1;
            }
            .score-card {
                background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
                border-radius: 24px;
                padding: 1rem;
                margin-bottom: 0.9rem;
            }
            .score-number {
                font-size: 2.9rem;
                line-height: 1;
                font-weight: 800;
                margin: 0.4rem 0;
            }
            .phone-note {
                background: rgba(148, 163, 184, 0.14);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 18px;
                padding: 0.8rem;
                margin-top: 0.65rem;
            }
            .nav-wrap {
                background: rgba(255, 255, 255, 0.78);
                border: 1px solid rgba(148, 163, 184, 0.2);
                border-radius: 22px;
                padding: 0.9rem 1rem;
                margin-bottom: 1.4rem;
                box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
            }
            .cta-panel {
                background: linear-gradient(135deg, #0f172a 0%, #0f766e 100%);
                color: #f8fafc;
                border-radius: 28px;
                padding: 1.5rem;
                box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
            }
            .cta-panel h3, .cta-panel p, .cta-panel li {
                color: #f8fafc;
            }
            .small-muted {
                color: #64748b;
                font-size: 0.92rem;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )


def _get_current_page() -> str:
    query_value = st.query_params.get("page", "home")
    if isinstance(query_value, list):
        query_value = query_value[0]
    page = str(query_value).lower().strip()
    if page not in SITE_STRUCTURE:
        return "home"
    return page


def _set_page(page: str) -> None:
    st.query_params["page"] = page
    st.rerun()


def _render_nav(current_page: str) -> None:
    st.markdown('<div class="nav-wrap">', unsafe_allow_html=True)
    left, right = st.columns([3, 7])
    with left:
        st.markdown("### AIHeal")
        st.caption("Your AI Health Copilot")
    with right:
        nav_cols = st.columns(len(PAGE_LABELS))
        for col, (page_key, label) in zip(nav_cols, PAGE_LABELS.items()):
            button_type = "primary" if current_page == page_key else "secondary"
            if col.button(label, key=f"nav-{page_key}", use_container_width=True, type=button_type):
                _set_page(page_key)
    st.markdown("</div>", unsafe_allow_html=True)


def _render_section_header(eyebrow: str, title: str, copy: str) -> None:
    st.markdown(f'<div class="eyebrow">{eyebrow}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="section-title">{title}</div>', unsafe_allow_html=True)
    st.markdown(f'<div class="section-copy">{copy}</div>', unsafe_allow_html=True)


def _render_card(title: str, body: str, footer: str = "") -> None:
    footer_html = f'<p class="small-muted">{footer}</p>' if footer else ""
    st.markdown(
        f"""
        <div class="card">
            <h3>{title}</h3>
            <p>{body}</p>
            {footer_html}
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_phone_mock() -> None:
    st.markdown(
        """
        <div class="phone-shell">
            <div class="phone-top">
                <span>AIHeal Preview</span>
                <span>09:41</span>
            </div>
            <div class="score-card">
                <div>Health Score</div>
                <div class="score-number">82</div>
                <div>Status: Good</div>
            </div>
            <div class="phone-note">
                <strong>Sleep trend</strong><br/>
                Sleep quality dropped for 4 consecutive days.
            </div>
            <div class="phone-note">
                <strong>Risk signal</strong><br/>
                Fatigue accumulation may be building from stress and later bedtimes.
            </div>
            <div class="phone-note">
                <strong>Next step</strong><br/>
                Move bedtime earlier by 30 minutes and reduce blue light after 10pm.
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_home() -> None:
    hero_left, hero_right = st.columns([1.15, 0.85], gap="large")
    with hero_left:
        st.markdown('<div class="eyebrow">AI HEALTH INFRASTRUCTURE</div>', unsafe_allow_html=True)
        st.markdown('<div class="hero-title">AI 健康管家</div>', unsafe_allow_html=True)
        st.markdown(
            '<div class="hero-subtitle">用数据理解你的身体，而不是猜<br/>自动分析健康状态，发现风险，并生成可执行建议</div>',
            unsafe_allow_html=True,
        )
        st.markdown(
            '<div class="hero-description">Your AI Health Copilot. Understand your body through data, not guesswork. AI analyzes your health signals, detects risks, and generates actionable insights for everyday wellbeing.</div>',
            unsafe_allow_html=True,
        )
        cta1, cta2 = st.columns(2)
        if cta1.button("立即体验", use_container_width=True, type="primary"):
            _set_page("download")
        if cta2.button("查看示例报告", use_container_width=True):
            _set_page("demo")
        st.caption("首页 -> 查看报告 Demo -> 点击体验 -> 下载 App -> 首次分析 -> 留存")
    with hero_right:
        _render_phone_mock()

    st.divider()
    _render_section_header(
        "Core Features",
        "先讲功能，再展示结果",
        "用户首先需要快速理解 AIHeal 能帮他做什么，所以首页优先展示健康评分、趋势分析和 AI 报告三项核心能力。",
    )
    feature_cols = st.columns(3, gap="large")
    with feature_cols[0]:
        _render_card("健康评分", "实时生成你的健康状态评分，帮助你用一个清晰数字判断今天的身体表现。", "Health snapshot in seconds")
    with feature_cols[1]:
        _render_card("趋势分析", "追踪睡眠、心率、活动变化，不只看单点数据，而是看连续趋势是否偏离基线。", "Track the changes that matter")
    with feature_cols[2]:
        _render_card("AI 报告", "发现风险并给出行动建议，让用户从看懂数据直接走到可执行下一步。", "From signals to action")

    st.divider()
    _render_section_header(
        "Demo Report",
        "先让用户相信：一眼看懂结果",
        "示例报告需要足够具体，才能让用户理解 AIHeal 不只是记录数据，而是把杂乱信号组织成可执行判断。",
    )
    metrics = st.columns(4)
    metrics[0].metric("Health Score", "82 / 100", "状态：良好")
    metrics[1].metric("睡眠问题", "已检测", "连续 4 天")
    metrics[2].metric("风险提示", "疲劳累积", "需尽早干预")
    metrics[3].metric("行动建议", "3 项", "今晚即可开始")

    report_left, report_right = st.columns([1.1, 0.9], gap="large")
    with report_left:
        st.markdown(
            """
            <div class="card">
                <h3>AI Demo Report</h3>
                <p><strong>关键发现</strong><br/>睡眠质量下降，夜间心率波动增加，恢复效率在工作日后半段持续走低。</p>
                <p><strong>风险提示</strong><br/>近期可能存在疲劳累积风险，若继续延迟入睡，白天专注度和训练恢复都可能继续下滑。</p>
                <p><strong>AI 分析</strong><br/>你的睡眠时长减少，同时夜间心率偏高，可能与压力或作息不规律有关。</p>
                <p><strong>行动建议</strong></p>
                <ul>
                    <li>提前 30 分钟入睡</li>
                    <li>减少晚间蓝光暴露</li>
                    <li>增加轻度运动与晚饭后步行</li>
                </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with report_right:
        st.markdown("#### 趋势图表")
        st.line_chart(HEALTH_TREND[["Sleep Score", "Recovery"]], height=280, use_container_width=True)
        st.caption("趋势是示例数据，用于展示 AIHeal 如何把散点信号转成可解释的健康变化。")

    st.divider()
    _render_section_header(
        "Use Cases",
        "使用场景",
        "AIHeal 的场景表达要紧贴真实问题：不是讲算法，而是说明用户会在哪些日常时刻得到帮助。",
    )
    use_case_cols = st.columns(4, gap="large")
    use_cases = [
        ("打工人", "睡眠差但不知道原因，AI 会结合睡眠、心率和压力变化给出原因线索与调整建议。"),
        ("家庭健康", "父母健康变化不易察觉，系统会自动发现偏离趋势并及时提醒。"),
        ("健身用户", "把睡眠、恢复与活动数据联动起来，帮助用户优化训练效果。"),
        ("慢病管理", "连续追踪关键指标，帮助用户更早发现值得留意的风险变化。"),
    ]
    for col, (title, copy) in zip(use_case_cols, use_cases):
        with col:
            _render_card(title, copy)

    st.divider()
    _render_section_header(
        "Data Sources",
        "数据来源",
        "AIHeal 兼容多种健康输入方式，让用户不需要额外学习复杂流程，也能快速开始首次分析。",
    )
    source_cols = st.columns(4, gap="large")
    sources = [
        ("Apple Health", "同步日常健康记录，作为健康快照与趋势分析的基础。"),
        ("智能设备", "接入穿戴设备与监测仪器，持续获得心率、睡眠与活动信号。"),
        ("手动输入", "补充主观症状、用药、感受与生活习惯等关键上下文。"),
        ("医疗报告", "导入检查或化验结果，为 AI 解释提供更完整的依据。"),
    ]
    for col, (title, copy) in zip(source_cols, sources):
        with col:
            _render_card(title, copy)

    st.divider()
    st.markdown(
        """
        <div class="cta-panel">
            <h3>Download App / 立即开始</h3>
            <p>不登录也能先看 Demo，不填信息也能理解价值；首次分析必须尽快给到结果，让用户在第一次打开时就看到健康评分与建议。</p>
            <ul>
                <li>首页：让用户看懂</li>
                <li>Demo：让用户相信</li>
                <li>下载：降低阻力</li>
                <li>首次使用：立刻给结果</li>
            </ul>
        </div>
        """,
        unsafe_allow_html=True,
    )
    cta_cols = st.columns(2)
    if cta_cols[0].button("Download App", use_container_width=True, type="primary", key="home-download"):
        _set_page("download")
    if cta_cols[1].button("Explore Demo Report", use_container_width=True, key="home-demo"):
        _set_page("demo")

    st.divider()
    _render_section_header(
        "Infrastructure",
        "Personal Health AI Infrastructure",
        "愿景层内容放在后面呈现，用于建立长期信任：用户先看到可用价值，再理解底层原则。",
    )
    infra_cols = st.columns(3, gap="large")
    infra_cards = [
        ("数据主权", "用户拥有自己的健康数据与导出权，不被锁定在单一平台。"),
        ("隐私保护", "敏感信息最小化暴露，默认围绕个人健康隐私设计产品体验。"),
        ("去中心化", "在保证体验易懂的前提下，以更开放的基础设施连接个人与智能服务。"),
    ]
    for col, (title, copy) in zip(infra_cols, infra_cards):
        with col:
            _render_card(title, copy)

    st.divider()
    _render_section_header(
        "Developer Entry",
        "为开发者与生态伙伴预留入口",
        "当用户价值与产品可信度建立之后，再开放 API、Agent 与 SDK 入口，帮助第三方在 AIHeal 上构建场景化体验。",
    )
    dev_cols = st.columns(3, gap="large")
    entries = [
        ("API", "Read normalized health snapshots, trends, and report outputs."),
        ("Agent", "Trigger goal-based health agents for coaching, follow-up, and summaries."),
        ("SDK", "Embed AIHeal insight modules inside wellness or care apps."),
    ]
    for col, (title, copy) in zip(dev_cols, entries):
        with col:
            _render_card(title, copy)
    if st.button("Go to Developers", use_container_width=True, key="home-dev"):
        _set_page("developers")


def _render_product() -> None:
    _render_section_header(
        "Product",
        "From health data to understandable decisions",
        "AIHeal 的产品页围绕 overview、health snapshot、trend tracking、AI report 和 comparison 展开，强调它如何把复杂健康数据转成用户看得懂的结论。",
    )
    overview, snapshot = st.columns(2, gap="large")
    with overview:
        _render_card(
            "Overview",
            "AIHeal combines passive health data, manual input, and medical context into one personal health layer so users can understand daily wellbeing without guessing.",
        )
    with snapshot:
        _render_card(
            "Health Snapshot",
            "A single screen summarizes health score, recovery, sleep quality, stress, and alert level so users can assess their current state immediately.",
        )

    tracking, report = st.columns(2, gap="large")
    with tracking:
        _render_card(
            "Trend Tracking",
            "Longitudinal views reveal if sleep, heart rate, or activity are drifting over time, turning isolated data points into meaningful patterns.",
        )
    with report:
        _render_card(
            "AI Report",
            "Every report turns signal detection into clear explanations, risk prompts, and action steps designed for everyday behavior change.",
        )

    st.markdown("#### Comparison")
    comparison_df = pd.DataFrame(
        [
            {"Dimension": "Raw trackers", "Traditional tools": "Show data streams", "AIHeal": "Explains what changed and why it matters"},
            {"Dimension": "First-time value", "Traditional tools": "Requires setup and interpretation", "AIHeal": "Generates an immediate health snapshot"},
            {"Dimension": "Decision support", "Traditional tools": "Leaves user to interpret", "AIHeal": "Provides actionable next steps"},
            {"Dimension": "Continuity", "Traditional tools": "Fragmented across apps", "AIHeal": "Unifies daily, trend, and report layers"},
        ]
    )
    st.dataframe(comparison_df, use_container_width=True, hide_index=True)


def _render_demo() -> None:
    _render_section_header(
        "Demo",
        "完整示例报告",
        "Demo 页承担最关键的转化职责：让用户相信 AIHeal 确实能从数据里看出问题，并给出可执行建议。",
    )
    report_cols = st.columns([0.9, 1.1], gap="large")
    with report_cols[0]:
        st.markdown(
            """
            <div class="card">
                <h3>82 / 100</h3>
                <p><strong>状态：</strong>良好</p>
                <p><strong>关键发现</strong><br/>睡眠质量下降，心率波动异常。</p>
                <p><strong>风险提示</strong><br/>近期可能存在疲劳累积风险。</p>
                <p><strong>AI 分析</strong><br/>你的睡眠时长减少，同时夜间心率偏高，可能与压力或作息不规律有关。</p>
                <p><strong>行动建议</strong></p>
                <ul>
                    <li>提前 30 分钟入睡</li>
                    <li>减少晚间蓝光</li>
                    <li>增加轻度运动</li>
                </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with report_cols[1]:
        st.markdown("#### Trend")
        st.line_chart(HEALTH_TREND, height=300, use_container_width=True)
        st.caption("示例图表强调趋势层的重要性，因为趋势比单次波动更能建立用户信任。")

    logic_cols = st.columns(3, gap="large")
    logic_cards = [
        ("Analysis Logic", "Cross-check sleep duration, resting heart rate, activity intensity, and user notes to identify compounded changes."),
        ("Risk Detection", "Flag deviations when multiple indicators move together instead of overreacting to a single outlier."),
        ("Action Plan", "Translate the report into tonight, this week, and ongoing actions so next steps feel concrete."),
    ]
    for col, (title, copy) in zip(logic_cols, logic_cards):
        with col:
            _render_card(title, copy)


def _render_scenarios() -> None:
    _render_section_header(
        "Scenarios",
        "围绕用户问题组织场景",
        "不同人群不需要不同的复杂术语，他们需要的是与自己生活贴合的提醒、解释和建议。",
    )
    scenario_rows = [
        ("Office Workers", "Long hours, inconsistent sleep, and stress build-up become visible through trend-based alerts and simple recovery suggestions."),
        ("Family Health", "Caregivers can notice parent health changes earlier through ongoing summaries instead of waiting for obvious symptoms."),
        ("Fitness Users", "Training load, sleep, and recovery are connected so people can optimize performance without overtraining."),
        ("Chronic Conditions", "Continuous tracking highlights subtle changes that may deserve attention or follow-up conversations."),
    ]
    for title, copy in scenario_rows:
        _render_card(title, copy)
        st.write("")


def _render_technology() -> None:
    _render_section_header(
        "Technology",
        "信任建立在底层原则之上",
        "技术页用于回答用户与合作伙伴更深层的问题：数据归谁、如何保护隐私、AI 如何工作，以及为什么基础设施需要更开放。",
    )
    tech_cols = st.columns(2, gap="large")
    cards = [
        ("Data Ownership", "Health data should remain user-controlled, portable, and understandable."),
        ("Privacy", "Sensitive health context deserves privacy-first defaults and minimal exposure."),
        ("AI Model", "AIHeal turns multiple health signals into plain-language summaries, risk prompts, and actionable recommendations."),
        ("Decentralization", "Open infrastructure reduces lock-in and enables a broader ecosystem of personal health agents."),
    ]
    for idx, (title, copy) in enumerate(cards):
        with tech_cols[idx % 2]:
            _render_card(title, copy)


def _render_download() -> None:
    _render_section_header(
        "Download",
        "降低下载与首次体验阻力",
        "下载页要非常直接：告诉用户可以在哪下载、为什么现在就值得下载，以及扫码后会得到什么。",
    )
    platform_cols = st.columns(2, gap="large")
    with platform_cols[0]:
        _render_card("iOS", "Connect Apple Health, preview your first report, and get an immediate health snapshot on iPhone.")
        if st.button("Download for iOS", use_container_width=True, type="primary", key="ios-download"):
            st.toast("iOS download flow placeholder")
    with platform_cols[1]:
        _render_card("Android", "Sync supported devices, log symptoms manually, and receive trend-driven health guidance on Android.")
        if st.button("Download for Android", use_container_width=True, key="android-download"):
            st.toast("Android download flow placeholder")

    st.markdown(
        """
        <div class="card">
            <h3>QR Code</h3>
            <p>Scan to download</p>
            <pre style="font-size: 0.85rem; line-height: 1.1; color: #0f172a;">
█████████████████
██ ██  █  ██  ██
██   ███  ███ ██
██ █  ██ ██   ██
██  ███   █ █ ██
██ ██   ████  ██
█████████████████
            </pre>
            <p class="small-muted">Use this area for the production QR asset once mobile download links are finalized.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )


def _render_developers() -> None:
    _render_section_header(
        "Developers",
        "API, Agent, SDK",
        "开发者页把 AIHeal 的基础能力产品化，便于第三方把健康快照、报告和代理能力嵌入自己的场景。",
    )
    dev_cols = st.columns(3, gap="large")
    items = [
        ("API", "Access normalized health data, scores, risk flags, and AI report payloads."),
        ("Agent", "Create wellness assistants that follow up on trends, generate reminders, or personalize recommendations."),
        ("SDK", "Embed charts, report cards, and onboarding flows inside health, insurance, or care products."),
    ]
    for col, (title, copy) in zip(dev_cols, items):
        with col:
            _render_card(title, copy)

    st.markdown("#### API Example")
    st.code(
        """
GET /v1/health/report/latest
{
  "score": 82,
  "status": "good",
  "findings": ["sleep quality decline", "elevated night heart rate"],
  "risk": "fatigue accumulation",
  "actions": ["sleep 30 minutes earlier", "reduce blue light", "add light exercise"]
}
        """.strip(),
        language="json",
    )
    st.markdown("#### Site Structure JSON")
    st.json({"site": {"name": "AIHeal", "structure": [{"page": page, "sections": sections} for page, sections in SITE_STRUCTURE.items()]}})


def render_dashboard() -> None:
    st.set_page_config(page_title="AIHeal", layout="wide", initial_sidebar_state="collapsed")
    _inject_styles()

    current_page = _get_current_page()
    _render_nav(current_page)

    if current_page == "home":
        _render_home()
    elif current_page == "product":
        _render_product()
    elif current_page == "demo":
        _render_demo()
    elif current_page == "scenarios":
        _render_scenarios()
    elif current_page == "technology":
        _render_technology()
    elif current_page == "download":
        _render_download()
    elif current_page == "developers":
        _render_developers()


if __name__ == "__main__":
    render_dashboard()
