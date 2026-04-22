"""Query helpers for region/category/product API payloads."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.entities import (
    Ad,
    Bookmark,
    Category,
    DailyMetric,
    HeadLeader,
    Product,
    WorkflowHistory,
    WorkflowTask,
)


def _product_to_payload(product: Product) -> dict[str, Any]:
    return {
        "id": product.id,
        "name_en": product.name_en,
        "name_cn": product.name_cn,
        "category_id": product.category_id,
        "market": product.market,
        "price_avg": product.price_avg,
        "price_min": product.price_min,
        "price_max": product.price_max,
        "heat_score": product.heat_score,
        "growth_score": product.growth_score,
        "discussion_score": product.discussion_score,
        "competition_score": product.competition_score,
        "score": product.total_score,
        "recommendation": product.recommendation,
        "strategy_type": product.strategy_type,
        "budget_daily": product.budget_daily,
        "budget_test": product.budget_test,
        "budget_scale": product.budget_scale,
        "estimated_daily_revenue": product.estimated_daily_revenue,
        "data_level": product.data_level,
    }


def get_market_payload(db: Session, *, region: str) -> dict[str, Any]:
    product_count = db.scalar(select(func.count(Product.id)).where(Product.market == region)) or 0
    category_count = (
        db.scalar(select(func.count(Category.id)).where(Category.market == region)) or 0
    )
    avg_growth = (
        db.scalar(select(func.avg(Product.growth_score)).where(Product.market == region)) or 0.0
    )
    avg_heat = (
        db.scalar(select(func.avg(Product.heat_score)).where(Product.market == region)) or 0.0
    )
    ads_count = db.scalar(select(func.count(Ad.id)).where(Ad.market == region)) or 0
    week_ago = date.today() - timedelta(days=7)
    trend_count = (
        db.scalar(
            select(func.count(DailyMetric.id))
            .join(Product, Product.id == DailyMetric.product_id)
            .where(Product.market == region, DailyMetric.date >= week_ago)
        )
        or 0
    )
    return {
        "region": region,
        "kpis": {
            "product_count": int(product_count),
            "category_count": int(category_count),
            "ads_count": int(ads_count),
            "new_trend_count": int(trend_count),
            "avg_growth": round(float(avg_growth), 3),
            "avg_heat": round(float(avg_heat), 3),
        },
    }


def list_products_payload(
    db: Session,
    *,
    region: str,
    category: str | None = None,
    min_score: float | None = None,
) -> dict[str, Any]:
    stmt = select(Product).where(Product.market == region)
    if category:
        stmt = stmt.join(Category, Category.id == Product.category_id).where(
            Category.name.ilike(f"%{category}%")
        )
    products = db.scalars(stmt).all()
    rows = [_product_to_payload(p) for p in products]
    if min_score is not None:
        rows = [row for row in rows if float(row["score"]) >= float(min_score)]
    rows.sort(key=lambda row: float(row["score"]), reverse=True)
    return {"region": region, "count": len(rows), "items": rows}


def get_product_payload(db: Session, *, product_id: int) -> dict[str, Any] | None:
    product = db.get(Product, product_id)
    if product is None:
        return None
    metrics = db.scalars(
        select(DailyMetric)
        .where(DailyMetric.product_id == product_id)
        .order_by(desc(DailyMetric.date))
        .limit(30)
    ).all()
    ads = db.scalars(
        select(Ad).where(Ad.product_id == product_id).order_by(desc(Ad.appear_count))
    ).all()
    category = db.get(Category, product.category_id)
    payload = _product_to_payload(product)
    payload["category"] = {
        "id": category.id if category else None,
        "name": category.name if category else "",
        "market": category.market if category else "",
    }
    payload["daily_metrics"] = [
        {
            "date": item.date.isoformat(),
            "heat": item.heat,
            "discussion": item.discussion,
            "ads_count": item.ads_count,
            "mention_count": item.mention_count,
        }
        for item in metrics
    ]
    payload["ads"] = [
        {
            "id": ad.id,
            "platform": ad.platform,
            "creative_type": ad.creative_type,
            "appear_count": ad.appear_count,
            "last_seen": ad.last_seen.isoformat(),
            "market": ad.market,
        }
        for ad in ads
    ]
    payload["decision"] = {
        "conclusion": product.recommendation or "观望",
        "why": (
            f"热度 {product.heat_score:.2f}、增长 {product.growth_score:.3f}、"
            f"讨论 {product.discussion_score:.2f}、竞争 {product.competition_score:.1f}"
        ),
        "how": product.strategy_type or "先做 2-3 条素材测试，验证 CTR 与 CVR。",
        "budget": {
            "daily": round(float(product.budget_daily), 2),
            "test": round(float(product.budget_test), 2),
            "scale": round(float(product.budget_scale), 2),
        },
        "risk": (
            "竞争偏高，注意素材同质化与 CPM 抬升。"
            if float(product.competition_score) >= 60
            else "关注履约与库存周转，避免断货影响放量。"
        ),
    }
    return payload


def get_growth_payload(db: Session, *, region: str) -> dict[str, Any]:
    category_growth = db.execute(
        select(
            Category.name.label("category"),
            func.avg(Product.growth_score).label("growth_score"),
            func.avg(Product.heat_score).label("heat_score"),
            func.avg(Product.discussion_score).label("discussion_score"),
        )
        .join(Product, Product.category_id == Category.id)
        .where(Category.market == region)
        .group_by(Category.name)
        .order_by(desc("growth_score"))
    ).all()

    product_growth = db.execute(
        select(
            Product.id,
            Product.name_cn,
            Product.name_en,
            Product.growth_score,
            Product.heat_score,
            Product.discussion_score,
            Product.total_score,
        )
        .where(Product.market == region)
        .order_by(desc(Product.growth_score))
        .limit(50)
    ).all()

    platform_growth = db.execute(
        select(
            Ad.platform,
            func.count(Ad.id).label("ads_count"),
            func.avg(Ad.appear_count).label("avg_appear"),
        )
        .where(Ad.market == region)
        .group_by(Ad.platform)
        .order_by(desc("ads_count"))
    ).all()

    return {
        "region": region,
        "category_growth": [
            {
                "category": row.category,
                "growth_score": round(float(row.growth_score or 0), 3),
                "heat_score": round(float(row.heat_score or 0), 3),
                "discussion_score": round(float(row.discussion_score or 0), 3),
            }
            for row in category_growth
        ],
        "product_growth": [
            {
                "product_id": row.id,
                "name_cn": row.name_cn,
                "name_en": row.name_en,
                "growth_score": round(float(row.growth_score or 0), 3),
                "heat_score": round(float(row.heat_score or 0), 3),
                "discussion_score": round(float(row.discussion_score or 0), 3),
                "total_score": round(float(row.total_score or 0), 2),
            }
            for row in product_growth
        ],
        "platform_growth": [
            {
                "platform": row.platform,
                "ads_count": int(row.ads_count or 0),
                "avg_appear": round(float(row.avg_appear or 0), 2),
            }
            for row in platform_growth
        ],
    }


def get_ads_by_product(db: Session, *, product_id: int) -> dict[str, Any]:
    ads = db.scalars(
        select(Ad).where(Ad.product_id == product_id).order_by(desc(Ad.appear_count))
    ).all()
    return {
        "product_id": product_id,
        "count": len(ads),
        "items": [
            {
                "id": ad.id,
                "platform": ad.platform,
                "creative_type": ad.creative_type,
                "appear_count": ad.appear_count,
                "last_seen": ad.last_seen.isoformat(),
                "market": ad.market,
            }
            for ad in ads
        ],
    }


def get_leaders_payload(db: Session, *, region: str) -> dict[str, Any]:
    rows = db.scalars(
        select(HeadLeader)
        .where(HeadLeader.market == region)
        .order_by(desc(HeadLeader.growth), desc(HeadLeader.score))
        .limit(100)
    ).all()
    grouped: dict[str, list[dict[str, Any]]] = {"product": [], "shop": [], "creator": []}
    for row in rows:
        item = {
            "name": row.name,
            "market": row.market,
            "score": round(float(row.score), 2),
            "growth": round(float(row.growth), 3),
        }
        grouped.setdefault(row.type, []).append(item)
    return {"region": region, "leaders": grouped}


def get_categories_payload(
    db: Session,
    *,
    region: str,
    keyword: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> dict[str, Any]:
    stmt = select(Category).where(Category.market == region)
    if keyword:
        stmt = stmt.where(Category.name.ilike(f"%{keyword}%"))
    categories = db.scalars(stmt.order_by(desc(Category.growth_score))).all()

    rows: list[dict[str, Any]] = []
    for cat in categories:
        if min_price is not None and float(cat.avg_price) < float(min_price):
            continue
        if max_price is not None and float(cat.avg_price) > float(max_price):
            continue
        rows.append(
            {
                "id": cat.id,
                "name": cat.name,
                "market": cat.market,
                "heat_score": round(float(cat.heat_score), 3),
                "growth_score": round(float(cat.growth_score), 3),
                "avg_price": round(float(cat.avg_price), 2),
                "product_count": int(cat.product_count),
            }
        )
    return {"region": region, "count": len(rows), "items": rows}


def get_regions_overview_payload(db: Session) -> dict[str, Any]:
    rows = db.execute(
        select(
            Product.market.label("region"),
            func.count(Product.id).label("product_count"),
            func.avg(Product.growth_score).label("avg_growth"),
            func.avg(Product.total_score).label("avg_score"),
            func.avg(Product.budget_daily).label("avg_budget_daily"),
        )
        .group_by(Product.market)
        .order_by(desc("avg_growth"))
    ).all()

    items = [
        {
            "region": str(row.region),
            "product_count": int(row.product_count or 0),
            "avg_growth": round(float(row.avg_growth or 0), 3),
            "avg_score": round(float(row.avg_score or 0), 2),
            "avg_budget_daily": round(float(row.avg_budget_daily or 0), 2),
            "judgement": (
                "优先投入"
                if float(row.avg_growth or 0) >= 0.45 and float(row.avg_score or 0) >= 70
                else "可小测"
                if float(row.avg_growth or 0) >= 0.2
                else "观望"
            ),
        }
        for row in rows
    ]
    return {"count": len(items), "items": items}


def get_decisions_payload(db: Session, *, region: str, top_n: int = 10) -> dict[str, Any]:
    items = db.scalars(
        select(Product)
        .where(Product.market == region)
        .order_by(desc(Product.total_score), desc(Product.growth_score))
        .limit(top_n)
    ).all()
    out: list[dict[str, Any]] = []
    for item in items:
        conclusion = item.recommendation or "观望"
        why = (
            f"热度 {item.heat_score:.2f}、增长 {item.growth_score:.3f}、讨论 {item.discussion_score:.2f}"
        )
        if not why:
            why = "当前数据不足，建议先采样观察。"
        how = item.strategy_type or "先做小预算素材测试，验证 CTR 与 CVR。"
        budget = (
            f"测试 ${item.budget_test:.0f}，日预算 ${item.budget_daily:.0f}，起量 ${item.budget_scale:.0f}"
        )
        risk = (
            "竞争偏高，注意素材同质化和 CPM 上涨。"
            if item.competition_score >= 60
            else "供应链和履约节奏是主要风险。"
        )
        out.append(
            {
                "product_id": item.id,
                "name_cn": item.name_cn,
                "name_en": item.name_en,
                "region": item.market,
                "score": round(float(item.total_score), 2),
                "conclusion": conclusion,
                "why": why,
                "how": how,
                "budget": budget,
                "risk": risk,
            }
        )
    return {"region": region, "count": len(out), "items": out}


def get_system_status_payload(db: Session) -> dict[str, Any]:
    product_count = db.scalar(select(func.count(Product.id))) or 0
    category_count = db.scalar(select(func.count(Category.id))) or 0
    ads_count = db.scalar(select(func.count(Ad.id))) or 0
    metric_count = db.scalar(select(func.count(DailyMetric.id))) or 0
    latest_metric = db.scalar(select(func.max(DailyMetric.date)))
    return {
        "database": "ok" if product_count > 0 else "empty",
        "products": int(product_count),
        "categories": int(category_count),
        "ads": int(ads_count),
        "daily_metrics": int(metric_count),
        "latest_metric_date": latest_metric.isoformat() if latest_metric else None,
    }


def get_workbench_payload(db: Session, *, region: str) -> dict[str, Any]:
    market = get_market_payload(db, region=region)
    categories = get_categories_payload(db, region=region)
    products = list_products_payload(db, region=region, min_score=60)
    decisions = get_decisions_payload(db, region=region, top_n=8)
    return {
        "region": region,
        "market": market,
        "top_categories": categories["items"][:8],
        "top_products": products["items"][:8],
        "decisions": decisions["items"],
    }


def list_workflow_tasks_payload(db: Session, *, region: str) -> dict[str, Any]:
    rows = db.execute(
        select(
            WorkflowTask.id,
            WorkflowTask.product_id,
            WorkflowTask.market,
            WorkflowTask.status,
            WorkflowTask.priority,
            WorkflowTask.owner,
            WorkflowTask.note,
            WorkflowTask.next_action,
            WorkflowTask.updated_at,
            Product.name_cn,
            Product.total_score,
            Product.budget_daily,
            Product.recommendation,
        )
        .join(Product, Product.id == WorkflowTask.product_id)
        .where(WorkflowTask.market == region)
        .order_by(WorkflowTask.status, WorkflowTask.priority, desc(Product.total_score))
    ).all()
    items: list[dict[str, Any]] = []
    for row in rows:
        items.append(
            {
                "id": int(row.id),
                "product_id": int(row.product_id),
                "product_name": str(row.name_cn),
                "market": str(row.market),
                "status": str(row.status),
                "priority": int(row.priority),
                "owner": str(row.owner),
                "note": str(row.note or ""),
                "next_action": str(row.next_action or ""),
                "score": round(float(row.total_score or 0), 2),
                "budget_daily": round(float(row.budget_daily or 0), 2),
                "recommendation": str(row.recommendation or ""),
                "updated_at": row.updated_at.isoformat() if row.updated_at else None,
            }
        )
    return {"region": region, "count": len(items), "items": items}


def upsert_workflow_task_payload(
    db: Session,
    *,
    product_id: int,
    region: str,
    status: str,
    priority: int = 3,
    owner: str = "self",
    note: str = "",
    next_action: str = "",
) -> dict[str, Any]:
    product = db.get(Product, product_id)
    if product is None:
        raise ValueError("Product not found")

    existing = db.scalar(
        select(WorkflowTask).where(
            WorkflowTask.product_id == product_id,
            WorkflowTask.market == region,
        )
    )
    previous_status = existing.status if existing is not None else ""
    if existing is None:
        existing = WorkflowTask(
            product_id=product_id,
            market=region,
            status=status,
            priority=priority,
            owner=owner,
            note=note,
            next_action=next_action,
        )
        db.add(existing)
    else:
        existing.status = status
        existing.priority = priority
        existing.owner = owner
        existing.note = note
        existing.next_action = next_action

    history = WorkflowHistory(
        task=existing,
        market=region,
        action="create" if previous_status == "" else "update",
        from_status=previous_status,
        to_status=status,
        note=note,
    )
    db.add(history)

    db.commit()
    db.refresh(existing)
    return {
        "id": int(existing.id),
        "product_id": int(existing.product_id),
        "market": str(existing.market),
        "status": str(existing.status),
        "priority": int(existing.priority),
        "owner": str(existing.owner),
        "note": str(existing.note or ""),
        "next_action": str(existing.next_action or ""),
        "updated_at": existing.updated_at.isoformat() if existing.updated_at else None,
    }


def delete_workflow_task_payload(db: Session, *, task_id: int) -> dict[str, Any]:
    item = db.get(WorkflowTask, task_id)
    if item is None:
        raise ValueError("Workflow task not found")
    db.query(WorkflowHistory).filter(WorkflowHistory.task_id == task_id).delete(
        synchronize_session=False
    )
    db.delete(item)
    db.commit()
    return {"deleted": True, "task_id": task_id}


def list_workflow_history_payload(db: Session, *, region: str, limit: int = 100) -> dict[str, Any]:
    rows = db.execute(
        select(
            WorkflowHistory.id,
            WorkflowHistory.task_id,
            WorkflowHistory.market,
            WorkflowHistory.action,
            WorkflowHistory.from_status,
            WorkflowHistory.to_status,
            WorkflowHistory.note,
            WorkflowHistory.created_at,
            Product.name_cn,
        )
        .join(WorkflowTask, WorkflowTask.id == WorkflowHistory.task_id)
        .join(Product, Product.id == WorkflowTask.product_id)
        .where(WorkflowHistory.market == region)
        .order_by(desc(WorkflowHistory.created_at))
        .limit(limit)
    ).all()
    items: list[dict[str, Any]] = []
    for row in rows:
        items.append(
            {
                "id": int(row.id),
                "task_id": int(row.task_id),
                "market": str(row.market),
                "product_name": str(row.name_cn),
                "action": str(row.action),
                "from_status": str(row.from_status or ""),
                "to_status": str(row.to_status or ""),
                "note": str(row.note or ""),
                "created_at": row.created_at.isoformat() if row.created_at else None,
            }
        )
    return {"region": region, "count": len(items), "items": items}


def list_bookmarks_payload(db: Session, *, region: str) -> dict[str, Any]:
    rows = db.execute(
        select(
            Bookmark.id,
            Bookmark.market,
            Bookmark.entity_type,
            Bookmark.product_id,
            Bookmark.category_name,
            Bookmark.title,
            Bookmark.note,
            Bookmark.updated_at,
            Product.name_cn,
        )
        .outerjoin(Product, Product.id == Bookmark.product_id)
        .where(Bookmark.market == region)
        .order_by(desc(Bookmark.updated_at))
    ).all()
    items: list[dict[str, Any]] = []
    for row in rows:
        title = str(row.title or "")
        if not title:
            title = str(row.name_cn or row.category_name or "")
        items.append(
            {
                "id": int(row.id),
                "market": str(row.market),
                "entity_type": str(row.entity_type),
                "product_id": int(row.product_id) if row.product_id is not None else None,
                "category_name": str(row.category_name or ""),
                "title": title,
                "note": str(row.note or ""),
                "updated_at": row.updated_at.isoformat() if row.updated_at else None,
            }
        )
    return {"region": region, "count": len(items), "items": items}


def upsert_bookmark_payload(
    db: Session,
    *,
    region: str,
    entity_type: str,
    product_id: int | None = None,
    category_name: str = "",
    title: str = "",
    note: str = "",
) -> dict[str, Any]:
    if entity_type not in {"product", "category"}:
        raise ValueError("entity_type must be product or category")
    if entity_type == "product" and (product_id is None or product_id <= 0):
        raise ValueError("product_id is required for product bookmark")
    if entity_type == "category" and not category_name:
        raise ValueError("category_name is required for category bookmark")

    existing = db.scalar(
        select(Bookmark).where(
            Bookmark.market == region,
            Bookmark.entity_type == entity_type,
            Bookmark.product_id == (product_id if entity_type == "product" else None),
            Bookmark.category_name == (category_name if entity_type == "category" else ""),
        )
    )

    if existing is None:
        existing = Bookmark(
            market=region,
            entity_type=entity_type,
            product_id=product_id if entity_type == "product" else None,
            category_name=category_name if entity_type == "category" else "",
            title=title,
            note=note,
        )
        db.add(existing)
    else:
        existing.title = title
        existing.note = note

    db.commit()
    db.refresh(existing)
    return {
        "id": int(existing.id),
        "market": str(existing.market),
        "entity_type": str(existing.entity_type),
        "product_id": int(existing.product_id) if existing.product_id is not None else None,
        "category_name": str(existing.category_name or ""),
        "title": str(existing.title or ""),
        "note": str(existing.note or ""),
        "updated_at": existing.updated_at.isoformat() if existing.updated_at else None,
    }


def delete_bookmark_payload(db: Session, *, bookmark_id: int) -> dict[str, Any]:
    item = db.get(Bookmark, bookmark_id)
    if item is None:
        raise ValueError("Bookmark not found")
    db.delete(item)
    db.commit()
    return {"deleted": True, "bookmark_id": bookmark_id}


def get_daily_report_payload(db: Session, *, region: str) -> dict[str, Any]:
    market = get_market_payload(db, region=region)
    top_products = list_products_payload(db, region=region, min_score=65)["items"][:5]
    decisions = get_decisions_payload(db, region=region, top_n=5)["items"]
    workflow = list_workflow_tasks_payload(db, region=region)["items"]
    workflow_summary = {
        "待测试": len([x for x in workflow if x["status"] == "待测试"]),
        "测试中": len([x for x in workflow if x["status"] == "测试中"]),
        "复盘中": len([x for x in workflow if x["status"] == "复盘中"]),
        "停投": len([x for x in workflow if x["status"] == "停投"]),
    }
    risk_items = [
        x
        for x in decisions
        if "风险" in x["risk"] or "竞争" in x["risk"] or "CPM" in x["risk"]
    ][:3]
    budget_total = sum(float(item.get("budget_daily", 0)) for item in top_products)
    return {
        "region": region,
        "date": date.today().isoformat(),
        "kpis": market["kpis"],
        "top_products": top_products,
        "decisions": decisions,
        "workflow_summary": workflow_summary,
        "risk_alerts": risk_items,
        "budget_suggestion": {
            "total_daily_budget": round(budget_total, 2),
            "core_test_budget": round(budget_total * 0.6, 2),
            "explore_budget": round(budget_total * 0.25, 2),
            "reserve_budget": round(budget_total * 0.15, 2),
        },
    }


def get_budget_simulator_payload(
    *,
    platform: str,
    budget: float,
    cpm: float,
    ctr: float,
    cvr: float,
    aov: float,
) -> dict[str, Any]:
    # impressions = budget / CPM * 1000
    impressions = (budget / max(cpm, 0.01)) * 1000.0
    clicks = impressions * max(ctr, 0.0)
    orders = clicks * max(cvr, 0.0)
    revenue = orders * max(aov, 0.0)
    roas = revenue / max(budget, 0.01)
    cpa = budget / max(orders, 0.01)
    return {
        "platform": platform,
        "inputs": {
            "budget": round(budget, 2),
            "cpm": round(cpm, 2),
            "ctr": round(ctr, 4),
            "cvr": round(cvr, 4),
            "aov": round(aov, 2),
        },
        "outputs": {
            "impressions": round(impressions, 0),
            "clicks": round(clicks, 0),
            "orders": round(orders, 2),
            "revenue": round(revenue, 2),
            "roas": round(roas, 2),
            "cpa": round(cpa, 2),
        },
    }


def get_multi_platform_budget_simulator_payload(
    *,
    total_budget: float,
    cpm_tiktok: float,
    cpm_meta: float,
    cpm_google: float,
    ctr_tiktok: float,
    ctr_meta: float,
    ctr_google: float,
    cvr_tiktok: float,
    cvr_meta: float,
    cvr_google: float,
    aov_tiktok: float,
    aov_meta: float,
    aov_google: float,
) -> dict[str, Any]:
    split = {
        "TikTok": total_budget * 0.45,
        "Meta": total_budget * 0.35,
        "Google": total_budget * 0.20,
    }
    tiktok = get_budget_simulator_payload(
        platform="TikTok",
        budget=split["TikTok"],
        cpm=cpm_tiktok,
        ctr=ctr_tiktok,
        cvr=cvr_tiktok,
        aov=aov_tiktok,
    )
    meta = get_budget_simulator_payload(
        platform="Meta",
        budget=split["Meta"],
        cpm=cpm_meta,
        ctr=ctr_meta,
        cvr=cvr_meta,
        aov=aov_meta,
    )
    google = get_budget_simulator_payload(
        platform="Google",
        budget=split["Google"],
        cpm=cpm_google,
        ctr=ctr_google,
        cvr=cvr_google,
        aov=aov_google,
    )

    revenue = (
        float(tiktok["outputs"]["revenue"])
        + float(meta["outputs"]["revenue"])
        + float(google["outputs"]["revenue"])
    )
    orders = (
        float(tiktok["outputs"]["orders"])
        + float(meta["outputs"]["orders"])
        + float(google["outputs"]["orders"])
    )
    roas = revenue / max(total_budget, 0.01)
    blended_cpa = total_budget / max(orders, 0.01)

    return {
        "total_budget": round(total_budget, 2),
        "channels": [tiktok, meta, google],
        "summary": {
            "revenue": round(revenue, 2),
            "orders": round(orders, 2),
            "blended_roas": round(roas, 2),
            "blended_cpa": round(blended_cpa, 2),
        },
    }


def get_opportunity_brief_payload(
    db: Session,
    *,
    region: str,
    budget_limit: float | None = None,
    top_n: int = 8,
) -> dict[str, Any]:
    safe_top_n = max(3, min(int(top_n), 20))
    products = db.scalars(
        select(Product)
        .where(Product.market == region)
        .order_by(desc(Product.total_score), desc(Product.growth_score))
        .limit(safe_top_n * 3)
    ).all()
    top_products = products[:safe_top_n]
    if budget_limit is not None and float(budget_limit) > 0:
        top_products = [p for p in top_products if float(p.budget_daily) <= float(budget_limit)]

    quick_wins = [
        p
        for p in top_products
        if p.recommendation in {"强烈推荐", "可以测试"} and float(p.competition_score) <= 58
    ][:5]
    risk_alerts = [
        p
        for p in top_products
        if float(p.competition_score) >= 70 or float(p.growth_score) <= 0.08
    ][:5]

    category_rows = db.execute(
        select(
            Category.name.label("name"),
            func.avg(Product.total_score).label("avg_score"),
            func.avg(Product.growth_score).label("avg_growth"),
            func.count(Product.id).label("product_count"),
        )
        .join(Product, Product.category_id == Category.id)
        .where(Category.market == region)
        .group_by(Category.name)
        .order_by(desc("avg_growth"), desc("avg_score"))
        .limit(6)
    ).all()

    total_daily_budget = sum(float(p.budget_daily or 0) for p in top_products)
    top1_budget = float(top_products[0].budget_daily) if top_products else 0.0
    top3_budget = sum(float(p.budget_daily or 0) for p in top_products[:3])
    top1_ratio = top1_budget / max(total_daily_budget, 0.01)
    top3_ratio = top3_budget / max(total_daily_budget, 0.01)
    budget_health = (
        "健康"
        if top1_ratio <= 0.45 and top3_ratio <= 0.78
        else "偏集中"
        if top1_ratio <= 0.55
        else "过于集中"
    )

    return {
        "region": region,
        "top_n": safe_top_n,
        "count": len(top_products),
        "applied_budget_limit": round(float(budget_limit), 2)
        if budget_limit is not None and float(budget_limit) > 0
        else None,
        "opportunities": [
            {
                "id": int(p.id),
                "name_cn": p.name_cn,
                "name_en": p.name_en,
                "score": round(float(p.total_score), 2),
                "growth_score": round(float(p.growth_score), 3),
                "competition_score": round(float(p.competition_score), 2),
                "budget_daily": round(float(p.budget_daily), 2),
                "recommendation": p.recommendation,
            }
            for p in top_products
        ],
        "quick_wins": [
            {
                "id": int(p.id),
                "name_cn": p.name_cn,
                "score": round(float(p.total_score), 2),
                "why": f"竞争 {float(p.competition_score):.1f} 较低，增长 {float(p.growth_score):.3f} 可快速验证。",
            }
            for p in quick_wins
        ],
        "risk_alerts": [
            {
                "id": int(p.id),
                "name_cn": p.name_cn,
                "score": round(float(p.total_score), 2),
                "risk": (
                    f"竞争 {float(p.competition_score):.1f} 偏高，建议先控预算。"
                    if float(p.competition_score) >= 70
                    else f"增长 {float(p.growth_score):.3f} 偏弱，建议缩小测试窗口。"
                ),
            }
            for p in risk_alerts
        ],
        "category_momentum": [
            {
                "category": str(row.name),
                "avg_score": round(float(row.avg_score or 0), 2),
                "avg_growth": round(float(row.avg_growth or 0), 3),
                "product_count": int(row.product_count or 0),
            }
            for row in category_rows
        ],
        "budget_guardrail": {
            "total_daily_budget": round(total_daily_budget, 2),
            "top1_budget_ratio": round(top1_ratio, 3),
            "top3_budget_ratio": round(top3_ratio, 3),
            "health": budget_health,
            "suggestion": (
                "预算分布均衡，可按日复盘后逐步提量。"
                if budget_health == "健康"
                else "预算过于集中，建议将 15%-25% 转移到第二梯队产品做分散测试。"
            ),
        },
    }


def get_products_compare_payload(
    db: Session,
    *,
    region: str,
    product_ids: list[int],
) -> dict[str, Any]:
    cleaned_ids: list[int] = []
    for pid in product_ids:
        if int(pid) > 0 and int(pid) not in cleaned_ids:
            cleaned_ids.append(int(pid))
    cleaned_ids = cleaned_ids[:6]
    if len(cleaned_ids) < 2:
        raise ValueError("At least 2 product_ids are required")

    products = db.scalars(
        select(Product)
        .where(Product.market == region, Product.id.in_(cleaned_ids))
        .order_by(desc(Product.total_score), desc(Product.growth_score))
    ).all()
    if len(products) < 2:
        raise ValueError("Not enough products found for compare")

    items: list[dict[str, Any]] = []
    for product in products:
        efficiency = float(product.estimated_daily_revenue) / max(float(product.budget_daily), 1.0)
        risk_level = (
            "高"
            if float(product.competition_score) >= 70 or float(product.growth_score) <= 0.08
            else "中"
            if float(product.competition_score) >= 55
            else "低"
        )
        newbie_fit = bool(float(product.budget_daily) <= 50 and float(product.competition_score) <= 58)
        items.append(
            {
                "id": int(product.id),
                "name_cn": product.name_cn,
                "name_en": product.name_en,
                "score": round(float(product.total_score), 2),
                "growth_score": round(float(product.growth_score), 3),
                "heat_score": round(float(product.heat_score), 2),
                "discussion_score": round(float(product.discussion_score), 2),
                "competition_score": round(float(product.competition_score), 2),
                "budget_daily": round(float(product.budget_daily), 2),
                "estimated_daily_revenue": round(float(product.estimated_daily_revenue), 2),
                "efficiency": round(efficiency, 2),
                "recommendation": product.recommendation,
                "risk_level": risk_level,
                "newbie_fit": newbie_fit,
                "strategy_type": product.strategy_type,
            }
        )

    winner = max(
        items,
        key=lambda item: (
            float(item["score"]),
            float(item["growth_score"]),
            -float(item["competition_score"]),
            float(item["efficiency"]),
        ),
    )
    total_budget = sum(float(item["budget_daily"]) for item in items)
    total_revenue = sum(float(item["estimated_daily_revenue"]) for item in items)
    avg_efficiency = total_revenue / max(total_budget, 1.0)

    return {
        "region": region,
        "count": len(items),
        "items": items,
        "winner": {
            "id": int(winner["id"]),
            "name_cn": str(winner["name_cn"]),
            "score": float(winner["score"]),
            "why": (
                f"综合分 {float(winner['score']):.1f}，增长 {float(winner['growth_score']):.3f}，"
                f"效率 {float(winner['efficiency']):.2f}，综合胜出。"
            ),
        },
        "summary": {
            "total_budget_daily": round(total_budget, 2),
            "total_estimated_daily_revenue": round(total_revenue, 2),
            "avg_efficiency": round(avg_efficiency, 2),
        },
    }
