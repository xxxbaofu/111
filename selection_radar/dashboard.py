"""Streamlit dashboard for Selection Radar."""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd
import streamlit as st

from selection_radar.config import get_settings
from selection_radar.database import Database
from selection_radar.pipeline import SelectionRadarPipeline


def _load_dataframe(db: Database) -> pd.DataFrame:
    rows = db.fetch_joined_results()
    normalized = []
    for row in rows:
        normalized.append(
            {
                "product": row["product_name"],
                "category": row["category"],
                "classification": row["classification"],
                "verdict": row["verdict"],
                "total_score": float(row["total_score"]),
                "trend_score": float(row["trend_score"]),
                "profit_score": float(row["profit_score"]),
                "competition_score": float(row["competition_score"]),
                "emotion_score": float(row["emotion_score"]),
                "new_trend_score": float(row["new_trend_score"]),
                "tags": " ".join(json.loads(row["tags"])),
                "reason": row["reason"],
            }
        )
    return pd.DataFrame(normalized)


def _latest_file(path: Path, suffix: str) -> Path | None:
    files = sorted(path.glob(f"*{suffix}"), key=lambda p: p.stat().st_mtime, reverse=True)
    return files[0] if files else None


def render_dashboard() -> None:
    st.set_page_config(page_title="Selection Radar", layout="wide")
    st.title("Selection Radar v0.1 - 可视化后台")

    settings = get_settings()
    db = Database(settings.db_path)
    pipeline = SelectionRadarPipeline(settings)

    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("运行全流程"):
            summary = pipeline.run_all()
            st.success(f"执行完成: {summary}")
    with col2:
        if st.button("仅采集 + 评分"):
            pipeline.run_data_collection()
            pipeline.run_ai_extraction()
            pipeline.run_market_validation()
            pipeline.run_scoring_and_classification()
            pipeline.write_outputs()
            st.success("已完成分步执行并输出结果")
    with col3:
        st.caption(f"数据库: `{settings.db_path}`")
        st.caption(f"输出目录: `{settings.output_dir}`")

    st.divider()
    df = _load_dataframe(db)
    if df.empty:
        st.warning("当前还没有可视化数据，请先执行一次流水线。")
        return

    c1, c2, c3, c4 = st.columns(4)
    c1.metric("机会数", len(df))
    c2.metric("平均总分", round(float(df["total_score"].mean()), 2))
    c3.metric("建议测试", int((df["verdict"] == "建议测试").sum()))
    c4.metric("新趋势", int((df["classification"] == "新趋势").sum()))

    st.subheader("机会分类分布")
    st.bar_chart(df["classification"].value_counts())

    st.subheader("Top 机会")
    show_cols = [
        "product",
        "classification",
        "total_score",
        "verdict",
        "tags",
        "trend_score",
        "profit_score",
        "competition_score",
        "emotion_score",
        "new_trend_score",
    ]
    st.dataframe(df[show_cols], use_container_width=True)

    st.subheader("查看单个产品理由")
    product = st.selectbox("选择产品", options=df["product"].tolist())
    selected = df[df["product"] == product].iloc[0]
    st.markdown(f"- 类目：`{selected['category']}`")
    st.markdown(f"- 分类：`{selected['classification']}`")
    st.markdown(f"- 评分：`{selected['total_score']}`")
    st.markdown(f"- 结论：`{selected['verdict']}`")
    st.markdown(f"- 标签：{selected['tags']}")
    st.markdown(f"- 理由：{selected['reason']}")

    latest_md = _latest_file(settings.output_dir, ".md")
    latest_json = _latest_file(settings.output_dir, ".json")
    st.divider()
    st.subheader("最近导出文件")
    if latest_md:
        st.code(str(latest_md))
    if latest_json:
        st.code(str(latest_json))


if __name__ == "__main__":
    render_dashboard()
