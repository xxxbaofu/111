"""Query helpers for region/category/product API payloads."""

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.models.entities import Ad, Category, DailyMetric, HeadLeader, Product
from app.services.scoring import calc_total_score


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
