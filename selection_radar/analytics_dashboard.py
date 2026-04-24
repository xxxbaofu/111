"""Streamlit analytics dashboard for Selection Radar."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import streamlit as st

from selection_radar.config import get_settings
from selection_radar.database import Database
from selection_radar.normalization import normalize_product_name, to_chinese_display_name
from selection_radar.pipeline import SelectionRadarPipeline


def _latest_file(path: Path, suffix: str) -> Path | None:
    files = sorted(path.glob(f"*{suffix}"), key=lambda p: p.stat().st_mtime, reverse=True)
    return files[0] if files else None


def _load_dataframe(db: Database) -> pd.DataFrame:
    rows = db.fetch_joined_results()
    aliases = db.fetch_product_aliases()
    aggregated: dict[str, dict] = {}
    for row in rows:
        product_en = str(row["product_name"])
        product_key = normalize_product_name(product_en)
        product_cn = aliases.get(product_key, to_chinese_display_name(product_en))
        metrics = json.loads(row["metrics"])
        tags = json.loads(row["tags"])
        entry = aggregated.get(product_key)
        if entry is None:
            entry = {
                "产品键": product_key,
                "产品英文": product_en,
                "产品中文": product_cn,
                "产品": f"{product_cn}（{product_en}）",
                "分类": row["classification"],
                "结论": row["verdict"],
                "总分": float(row["total_score"]),
                "趋势分": float(row["trend_score"]),
                "利润分": float(row["profit_score"]),
                "竞争分": float(row["competition_score"]),
                "情绪分": float(row["emotion_score"]),
                "新趋势分": float(row["new_trend_score"]),
                "标签": " ".join(tags),
                "标签列表": metrics.get("labels", []),
                "一句话结论": metrics.get("decision_summary", row["reason"]),
                "为什么做": metrics.get("decision_why", row["reason"]),
                "怎么做": metrics.get("decision_how", ""),
                "投流建议": metrics.get("decision_ads", ""),
                "打法": metrics.get("playbook", "低价冲量打法"),
                "预估日收入": float(metrics.get("estimated_daily_revenue", 0.0)),
                "收入等级": str(metrics.get("revenue_level", "低")),
                "测试成本": float(metrics.get("test_cost", 0.0)),
                "建议日预算": float(metrics.get("daily_budget", 0.0)),
                "起量成本": float(metrics.get("scale_cost", 0.0)),
                "来源平台": [],
            }
            aggregated[product_key] = entry

        if row["platform"] not in entry["来源平台"]:
            entry["来源平台"].append(row["platform"])

        if float(row["total_score"]) > float(entry["总分"]):
            entry["分类"] = row["classification"]
            entry["结论"] = row["verdict"]
            entry["总分"] = float(row["total_score"])
            entry["趋势分"] = float(row["trend_score"])
            entry["利润分"] = float(row["profit_score"])
            entry["竞争分"] = float(row["competition_score"])
            entry["情绪分"] = float(row["emotion_score"])
            entry["新趋势分"] = float(row["new_trend_score"])
            entry["标签"] = " ".join(tags)
            entry["标签列表"] = metrics.get("labels", [])
            entry["一句话结论"] = metrics.get("decision_summary", row["reason"])
            entry["为什么做"] = metrics.get("decision_why", row["reason"])
            entry["怎么做"] = metrics.get("decision_how", "")
            entry["投流建议"] = metrics.get("decision_ads", "")
            entry["打法"] = metrics.get("playbook", "低价冲量打法")
            entry["预估日收入"] = float(metrics.get("estimated_daily_revenue", 0.0))
            entry["收入等级"] = str(metrics.get("revenue_level", "低"))
            entry["测试成本"] = float(metrics.get("test_cost", 0.0))
            entry["建议日预算"] = float(metrics.get("daily_budget", 0.0))
            entry["起量成本"] = float(metrics.get("scale_cost", 0.0))

    data = []
    for item in aggregated.values():
        item["来源数"] = len(item["来源平台"])
        item["来源平台"] = " / ".join(sorted(item["来源平台"]))
        data.append(item)
    return pd.DataFrame(sorted(data, key=lambda x: float(x["总分"]), reverse=True))


def _render_today_focus(df: pd.DataFrame) -> None:
    st.subheader("今日重点机会（Top 5）")
    top = df.head(5)
    for _, row in top.iterrows():
        with st.container(border=True):
            c1, c2, c3 = st.columns([3, 1, 1])
            c1.markdown(f"### {row['产品']}")
            c2.metric("总分", f"{row['总分']:.1f}/100")
            c3.metric("结论", row["结论"])
            st.markdown(
                f"- **预估日收入**：`${row['预估日收入']:.0f}`（{row['收入等级']}）  \n"
                f"- **一句话理由**：{row['一句话结论']}  \n"
                f"- **打法**：{row['打法']}  \n"
                f"- **来源**：{row['来源平台']}（{row['来源数']}）"
            )


def _render_pools(df: pd.DataFrame) -> None:
    st.subheader("分类机会池")
    pool_labels = ["爆发趋势", "蓝海机会", "小众暴利", "情绪驱动", "新趋势", "长期稳定需求"]
    for label in pool_labels:
        subset = df[df["标签列表"].apply(lambda labels: label in labels)]
        st.markdown(f"#### {label}")
        if subset.empty:
            st.caption("暂无")
        else:
            st.dataframe(
                subset[["产品", "总分", "结论", "预估日收入", "打法", "来源平台"]],
                use_container_width=True,
                hide_index=True,
            )


def _render_trend_changes(df: pd.DataFrame) -> None:
    st.subheader("趋势变化")
    rising = df.sort_values("新趋势分", ascending=False).head(5)
    emerging = df[df["标签列表"].apply(lambda labels: "新趋势" in labels or "爆发趋势" in labels)].head(5)
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**上涨中产品**")
        st.dataframe(rising[["产品", "新趋势分", "总分", "结论"]], use_container_width=True, hide_index=True)
    with c2:
        st.markdown("**新出现信号**")
        st.dataframe(emerging[["产品", "标签", "总分", "结论"]], use_container_width=True, hide_index=True)


def _render_filters(df: pd.DataFrame) -> pd.DataFrame:
    st.subheader("筛选系统")
    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        class_filter = st.multiselect("按分类", sorted(df["分类"].unique().tolist()))
    with c2:
        min_score = st.slider("按总分", min_value=0, max_value=100, value=60)
    with c3:
        revenue_filter = st.multiselect("按收入等级", ["低", "中", "高", "爆款级"])
    with c4:
        min_comp = st.slider("按竞争程度(越高越蓝海)", min_value=0.0, max_value=10.0, value=0.0)
    with c5:
        emotion_only = st.checkbox("仅情绪驱动", value=False)

    out = df[df["总分"] >= min_score]
    out = out[out["竞争分"] >= min_comp]
    if class_filter:
        out = out[out["分类"].isin(class_filter)]
    if revenue_filter:
        out = out[out["收入等级"].isin(revenue_filter)]
    if emotion_only:
        out = out[out["标签列表"].apply(lambda labels: "情绪驱动" in labels)]
    return out


def render_analytics_dashboard() -> None:
    st.set_page_config(page_title="Selection Radar", layout="wide")
    st.title("Selection Radar - 跨境赚钱操作系统")

    settings = get_settings()
    db = Database(settings.db_path)
    pipeline = SelectionRadarPipeline(settings)

    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("运行全流程", use_container_width=True):
            summary = pipeline.run_all()
            st.success(f"执行完成: {summary}")
    with col2:
        if st.button("仅刷新结果", use_container_width=True):
            pipeline.write_outputs()
            st.success("已刷新机会池输出")
    with col3:
        st.caption(f"数据库: `{settings.db_path}`")
        st.caption(f"输出目录: `{settings.output_dir}`")

    st.divider()
    df = _load_dataframe(db)
    if df.empty:
        st.warning("当前还没有可视化数据，请先执行一次流水线。")
        return

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("机会总数", len(df))
    c2.metric("平均总分", f"{float(df['总分'].mean()):.1f}/100")
    c3.metric("可执行数", int(df["结论"].isin(["强烈推荐", "可以测试"]).sum()))
    c4.metric("高收入机会", int((df["预估日收入"] >= 1000).sum()))

    _render_today_focus(df)
    st.divider()
    _render_pools(df)
    st.divider()
    _render_trend_changes(df)
    st.divider()

    filtered = _render_filters(df)
    if filtered.empty:
        st.warning("筛选后暂无数据，请放宽筛选条件。")
        return
    st.subheader("机会池明细")
    st.dataframe(
        filtered[
            [
                "产品",
                "分类",
                "总分",
                "结论",
                "预估日收入",
                "收入等级",
                "打法",
                "来源平台",
                "来源数",
                "趋势分",
                "利润分",
                "竞争分",
                "情绪分",
                "新趋势分",
                "标签",
            ]
        ],
        use_container_width=True,
        hide_index=True,
    )

    st.subheader("产品详情页")
    selected_product = st.selectbox("选择产品", options=filtered["产品"].tolist())
    details = filtered[filtered["产品"] == selected_product].iloc[0]
    lcol, rcol = st.columns(2)
    with lcol:
        st.markdown(f"- **产品名（中+英）**：{details['产品']}")
        st.markdown(f"- **分类**：{details['分类']}")
        st.markdown(f"- **总分**：{details['总分']:.1f}/100")
        st.markdown(f"- **决策**：{details['结论']}")
        st.markdown(f"- **预估收入**：`${details['预估日收入']:.0f}/天`（{details['收入等级']}）")
        st.markdown(f"- **测试成本**：`${details['测试成本']:.0f}`")
        st.markdown(f"- **建议日预算**：`${details['建议日预算']:.0f}`")
        st.markdown(f"- **起量成本**：`${details['起量成本']:.0f}`")
        st.markdown(f"- **打法**：{details['打法']}")
    with rcol:
        st.markdown("**AI解释**")
        st.markdown(f"1) 简单结论：{details['一句话结论']}")
        st.markdown(f"2) 为什么：{details['为什么做']}")
        st.markdown(f"3) 怎么做：{details['怎么做']}")
        st.markdown(f"4) 投流建议：{details['投流建议']}")
        st.markdown(f"- 数据来源：{details['来源平台']}")

    settings = get_settings()
    latest_md = _latest_file(settings.output_dir, ".md")
    latest_json = _latest_file(settings.output_dir, ".json")
    st.divider()
    st.subheader("最近导出")
    if latest_md:
        st.code(str(latest_md))
    if latest_json:
        st.code(str(latest_json))


if __name__ == "__main__":
    render_analytics_dashboard()
