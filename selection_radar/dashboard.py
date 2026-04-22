"""Streamlit multi-page dashboard: cross-border profit operating system."""

from __future__ import annotations

from pathlib import Path

import pandas as pd
import streamlit as st

from selection_radar.config import get_settings
from selection_radar.dashboard_data import build_dashboard_frames
from selection_radar.database import Database
from selection_radar.pipeline import SelectionRadarPipeline


def _latest_file(path: Path, suffix: str) -> Path | None:
    files = sorted(path.glob(f"*{suffix}"), key=lambda p: p.stat().st_mtime, reverse=True)
    return files[0] if files else None


def _apply_theme() -> None:
    st.markdown(
        """
<style>
.stApp { background-color: #0f1117; color: #e5e7eb; }
[data-testid="stSidebar"] { background-color: #151924; }
.card { background: #171b28; border: 1px solid #24293a; border-radius: 14px; padding: 16px; margin-bottom: 12px; }
.kpi-num { font-size: 32px; font-weight: 700; }
.tag-red { color: #ff6b6b; font-weight: 700; }
.tag-blue { color: #4ea8ff; font-weight: 700; }
.tag-purple { color: #b388ff; font-weight: 700; }
.tag-green { color: #69db7c; font-weight: 700; }
</style>
        """,
        unsafe_allow_html=True,
    )


def _load_all(db: Database) -> tuple[pd.DataFrame, pd.DataFrame]:
    products_df, categories_df = build_dashboard_frames(db)
    favorites_rows = db.fetch_favorites()
    if products_df.empty:
        products_df["收藏状态"] = ""
        products_df["收藏备注"] = ""
        return products_df, categories_df

    fav_map: dict[tuple[str, str], dict] = {}
    for row in favorites_rows:
        key = (str(row["favorite_type"]), str(row["favorite_key"]))
        fav_map[key] = {"status": str(row["status"]), "note": str(row["note"])}

    statuses: list[str] = []
    notes: list[str] = []
    for _, item in products_df.iterrows():
        info = fav_map.get(("product", str(item["产品键"])))
        statuses.append(info["status"] if info else "")
        notes.append(info["note"] if info else "")
    products_df = products_df.copy()
    products_df["收藏状态"] = statuses
    products_df["收藏备注"] = notes
    return products_df, categories_df


def _kpi_cards(products_df: pd.DataFrame) -> None:
    today_products = len(products_df)
    high_potential = int(products_df["推荐等级"].isin(["强烈推荐", "可以测试"]).sum())
    new_trend_count = int((products_df["新趋势"] == "是").sum())
    beginner_friendly = int((products_df["新手友好"] == "是").sum())

    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(
            '<div class="card"><div>今日产品数</div><div class="kpi-num tag-blue">%d</div></div>'
            % today_products,
            unsafe_allow_html=True,
        )
    with c2:
        st.markdown(
            '<div class="card"><div>高潜机会数</div><div class="kpi-num tag-red">%d</div></div>'
            % high_potential,
            unsafe_allow_html=True,
        )
    with c3:
        st.markdown(
            '<div class="card"><div>新趋势数</div><div class="kpi-num tag-purple">%d</div></div>'
            % new_trend_count,
            unsafe_allow_html=True,
        )
    with c4:
        st.markdown(
            '<div class="card"><div>新手友好数</div><div class="kpi-num tag-green">%d</div></div>'
            % beginner_friendly,
            unsafe_allow_html=True,
        )


def _product_hover_text(row: pd.Series) -> str:
    return (
        f"热度：{row['热度']} | 讨论：{row['讨论度']} | 平均价格：${row['平均价格']:.0f}\n"
        f"预算：${row['建议日预算']:.0f}/天\n"
        f"结论：{row['一句话结论']}"
    )


def _dashboard_page(products_df: pd.DataFrame, categories_df: pd.DataFrame) -> None:
    _kpi_cards(products_df)
    st.subheader("今日重点机会（Top 5）")
    for _, row in products_df.head(5).iterrows():
        with st.container(border=True):
            st.markdown(f"### {row['产品中文']}")
            st.caption(row["产品英文"])
            st.markdown(
                f"**{row['分类']}** | ⭐ **{row['总分']:.0f}分**  \n"
                f"热度：{row['热度']} | 讨论：{row['讨论度']} | 价格：{row['价格区间']}  \n"
                f"预算：${row['建议日预算']:.0f}/天"
            )
            st.info(row["一句话结论"])
            with st.expander("悬停解释（简要）"):
                st.write(_product_hover_text(row))

    st.subheader("今日重点品类（Category Radar）")
    only_rising = st.checkbox("只看上升品类", value=False)
    view = categories_df[categories_df["趋势"] == "上升"] if only_rising else categories_df
    st.dataframe(
        view[["品类名称", "热度指数", "讨论度指数", "平均价格", "产品数量", "趋势符号", "推荐等级"]],
        use_container_width=True,
        hide_index=True,
    )

    st.subheader("新趋势提醒")
    trend_df = products_df[products_df["新趋势"] == "是"].copy().head(10)
    if trend_df.empty:
        st.caption("暂无新趋势提醒")
    else:
        trend_df["新关键词"] = trend_df["产品英文"].str.lower()
        st.dataframe(
            trend_df[["新关键词", "产品名", "来源数", "出现时间", "来源平台"]],
            use_container_width=True,
            hide_index=True,
        )


def _category_radar_page(products_df: pd.DataFrame, categories_df: pd.DataFrame, db: Database) -> None:
    st.subheader("品类雷达")
    left, mid, right = st.columns([1, 2, 2])
    with left:
        keyword = st.text_input("品类关键词")
        cats = st.multiselect("多选分类", sorted(categories_df["品类名称"].tolist()))
        price_min, price_max = st.slider("价格区间", min_value=0, max_value=300, value=(0, 300))
        high_ticket = st.checkbox("高客单优先")
        beginner_only = st.checkbox("仅新手友好")

    filt = products_df.copy()
    if keyword:
        filt = filt[filt["品类中文"].str.contains(keyword, case=False, regex=False)]
    if cats:
        filt = filt[filt["品类中文"].isin(cats)]
    filt = filt[(filt["平均价格"] >= price_min) & (filt["平均价格"] <= price_max)]
    if high_ticket:
        filt = filt[filt["是否高客单"] == "是"]
    if beginner_only:
        filt = filt[filt["新手友好"] == "是"]

    # 兼容旧数据列，避免字段缺失导致 KeyError
    if "竞争分" not in filt.columns:
        filt = filt.copy()
        if "竞争度" in filt.columns:
            filt["竞争分"] = pd.to_numeric(filt["竞争度"], errors="coerce").fillna(0.0)
        else:
            filt["竞争分"] = 0.0

    cat_view = (
        filt.groupby("品类中文")
        .agg(
            热度=("热度分", "mean"),
            讨论度=("讨论度分", "mean"),
            平均价格=("平均价格", "mean"),
            产品数=("产品键", "count"),
            竞争度=("竞争分", "mean"),
            趋势变化=("新趋势", lambda x: "上升" if (x == "是").mean() >= 0.5 else "平稳"),
        )
        .reset_index()
    )
    with mid:
        st.markdown("#### 品类列表")
        st.dataframe(cat_view, use_container_width=True, hide_index=True)
    with right:
        st.markdown("#### 品类详情")
        if cat_view.empty:
            st.caption("当前筛选暂无品类数据")
        else:
            sel = st.selectbox("选择品类", options=cat_view["品类中文"].tolist())
            cdata = filt[filt["品类中文"] == sel]
            st.line_chart(cdata[["热度分", "讨论度分"]].reset_index(drop=True))
            st.bar_chart(cdata["来源数"].value_counts())
            st.success("推荐打法（AI）：先做3套素材AB测试，主打痛点+场景化。")
            fav = st.checkbox("收藏该品类", value=False, key=f"fav-cat-{sel}")
            if fav:
                db.upsert_favorite(favorite_type="category", favorite_key=sel, status="准备测试")


def _product_pool_page(products_df: pd.DataFrame) -> pd.DataFrame:
    st.subheader("产品机会池")
    c1, c2, c3, c4, c5 = st.columns(5)
    with c1:
        class_filter = st.multiselect("分类筛选", sorted(products_df["分类"].unique().tolist()))
    with c2:
        min_score = st.slider("分数筛选", 0, 100, 70)
    with c3:
        rev_filter = st.multiselect("收入等级", ["低", "中", "高", "爆款级"])
    with c4:
        diff_filter = st.multiselect("投流难度", ["低", "中", "高"])
    with c5:
        beginner = st.selectbox("新手友好", ["全部", "是", "否"])

    out = products_df[products_df["总分"] >= min_score]
    if class_filter:
        out = out[out["分类"].isin(class_filter)]
    if rev_filter:
        out = out[out["收入等级"].isin(rev_filter)]
    if diff_filter:
        out = out[out["投流难度"].isin(diff_filter)]
    if beginner != "全部":
        out = out[out["新手友好"] == beginner]

    if out.empty:
        st.caption("当前筛选暂无产品")
    else:
        st.dataframe(
            out[
                [
                    "产品名",
                    "分类",
                    "总分",
                    "热度",
                    "讨论度",
                    "平均价格",
                    "收入等级",
                    "投流难度",
                    "推荐等级",
                    "标签",
                ]
            ],
            use_container_width=True,
            hide_index=True,
        )
    return out


def _product_detail_page(df: pd.DataFrame, db: Database) -> None:
    st.subheader("产品详情页")
    if df.empty:
        st.caption("暂无可展示产品")
        return
    product_name = st.selectbox("选择产品", options=df["产品名"].tolist())
    row = df[df["产品名"] == product_name].iloc[0]

    c1, c2 = st.columns(2)
    with c1:
        st.markdown(f"- 中文产品名：**{row['产品中文']}**")
        st.markdown(f"- 英文名：`{row['产品英文']}`")
        st.markdown(f"- 品类：{row['品类中文']}")
        st.markdown(f"- 总分：{row['总分']:.1f}/100")
        st.markdown(f"- 分类标签：{row['标签']}")
    with c2:
        st.markdown("**核心指标**")
        st.markdown(
            f"- 热度：{row['热度']}  \n"
            f"- 讨论度：{row['讨论度']}  \n"
            f"- 竞争度：{row['竞争分']:.1f}  \n"
            f"- 利润潜力：{row['利润分']:.1f}  \n"
            f"- 新手友好度：{row['新手友好']}"
        )

    st.markdown("**市场数据**")
    st.markdown(
        f"- 平均价格：${row['平均价格']:.1f}  \n"
        f"- 价格区间：{row['价格区间']}  \n"
        f"- 平台分布：{row['来源平台']}  \n"
        f"- 产品数量：{row['来源数']}  \n"
        f"- 评论量（讨论指数）：{row['讨论度分']:.1f}"
    )

    st.markdown("**AI解释（中文）**")
    st.markdown(f"1) 一句话结论：{row['一句话结论']}")
    st.markdown(f"2) 为什么：{row['为什么']}")
    st.markdown(f"3) 怎么做：{row['怎么做']}")
    st.markdown(f"4) 风险：{row['风险']}")

    st.markdown("**投流建议**")
    st.markdown(
        f"- 推荐平台：{row['平台适配']}  \n"
        f"- 建议日预算：${row['建议日预算']:.0f}  \n"
        f"- 测试预算：${row['测试成本']:.0f}  \n"
        f"- 素材数量：3条  \n"
        f"- 测试周期：2天  \n"
        f"- 是否适合新手：{row['新手友好']}"
    )

    st.markdown("**打法建议（最关键）**")
    st.info(f"打法类型：{row['打法']}")
    st.write("- 视频讲故事\n- 评论区引导\n- 避免硬广开场")

    status = st.selectbox("标记状态", ["准备测试", "已测试", "放弃"])
    note = st.text_input("备注")
    if st.button("收藏该产品"):
        db.upsert_favorite(
            favorite_type="product",
            favorite_key=str(row["产品键"]),
            status=status,
            note=note,
        )
        st.success("已加入我的关注")


def _ads_strategy_page(df: pd.DataFrame) -> None:
    st.subheader("投流与玩法页")
    st.markdown("### 平台对比")
    st.table(
        pd.DataFrame(
            [
                {"平台": "TikTok", "适合度": "高", "成本": "中", "难度": "中"},
                {"平台": "Meta", "适合度": "中", "成本": "高", "难度": "高"},
            ]
        )
    )

    st.markdown("### 投流预算模型")
    if df.empty:
        st.caption("暂无预算数据")
    else:
        b1, b2, b3 = st.columns(3)
        b1.metric("测试预算均值", f"${df['测试成本'].mean():.0f}")
        b2.metric("起量预算均值", f"${df['起量成本'].mean():.0f}")
        b3.metric("日预算均值", f"${df['建议日预算'].mean():.0f}")

    st.markdown("### 品类打法模板")
    st.markdown("**宠物类**：情绪内容 + 高客单 + 评论转化")
    st.markdown("**婴儿类**：痛点视频 + 对比效果 + 短视频起量")


def _favorites_page(db: Database, products_df: pd.DataFrame, categories_df: pd.DataFrame) -> None:
    st.subheader("我的关注")
    favorites = db.fetch_favorites()
    if not favorites:
        st.caption("你还没有收藏内容")
        return
    rows = []
    product_map = {str(r["产品键"]): r for _, r in products_df.iterrows()}
    category_map = {str(r["品类名称"]): r for _, r in categories_df.iterrows()}
    for item in favorites:
        ftype = str(item["favorite_type"])
        fkey = str(item["favorite_key"])
        if ftype == "product":
            p = product_map.get(fkey)
            name = p["产品名"] if p is not None else fkey
        else:
            c = category_map.get(fkey)
            name = f"{fkey}（{c['推荐等级']}）" if c is not None else fkey
        rows.append(
            {
                "类型": "产品" if ftype == "product" else "品类",
                "名称": name,
                "状态": str(item["status"]),
                "备注": str(item["note"]),
                "更新时间": str(item["updated_at"]),
            }
        )
    fav_df = pd.DataFrame(rows)
    st.dataframe(fav_df, use_container_width=True, hide_index=True)


def _pipeline_seed_if_needed(
    *, db: Database, pipeline: SelectionRadarPipeline, products_df: pd.DataFrame
) -> pd.DataFrame:
    if products_df.empty:
        summary = pipeline.run_all()
        st.success(f"已自动执行初始化流程：{summary}")
        products_df, _categories_df = _load_all(db)
    return products_df


def render_dashboard() -> None:
    st.set_page_config(page_title="跨境赚钱操作系统", layout="wide")
    _apply_theme()
    st.title("跨境赚钱操作系统")
    st.caption("少数据，多结论：打开30秒知道今天看什么、测什么。")

    settings = get_settings()
    db = Database(settings.db_path)
    pipeline = SelectionRadarPipeline(settings)

    top_c1, top_c2, top_c3 = st.columns(3)
    with top_c1:
        if st.button("运行全流程", use_container_width=True):
            summary = pipeline.run_all()
            st.success(f"执行完成：{summary}")
    with top_c2:
        if st.button("仅刷新输出", use_container_width=True):
            pipeline.write_outputs()
            st.success("已刷新输出文件")
    with top_c3:
        st.caption(f"数据库：{settings.db_path}")
        st.caption(f"输出目录：{settings.output_dir}")

    products_df, categories_df = _load_all(db)
    products_df = _pipeline_seed_if_needed(db=db, pipeline=pipeline, products_df=products_df)
    products_df, categories_df = _load_all(db)
    if products_df.empty:
        st.warning("暂无可展示数据，请检查数据抓取配置。")
        return

    menu = st.sidebar.radio(
        "页面导航",
        [
            "首页 Dashboard",
            "品类雷达",
            "产品机会池",
            "产品详情页",
            "投流与玩法",
            "我的关注",
        ],
    )

    if menu == "首页 Dashboard":
        _dashboard_page(products_df, categories_df)
    elif menu == "品类雷达":
        _category_radar_page(products_df, categories_df, db)
    elif menu == "产品机会池":
        _product_pool_page(products_df)
    elif menu == "产品详情页":
        _product_detail_page(products_df, db)
    elif menu == "投流与玩法":
        _ads_strategy_page(products_df)
    else:
        _favorites_page(db, products_df, categories_df)

    st.divider()
    latest_md = _latest_file(settings.output_dir, ".md")
    latest_json = _latest_file(settings.output_dir, ".json")
    st.subheader("最近导出")
    if latest_md:
        st.code(str(latest_md))
    if latest_json:
        st.code(str(latest_json))


if __name__ == "__main__":
    render_dashboard()
