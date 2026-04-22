"""Query helpers for region/category/product API payloads."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.entities import Ad, Category, DailyMetric, HeadLeader, Product, WorkflowTask


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
    db.delete(item)
    db.commit()
    return {"deleted": True, "task_id": task_id}
