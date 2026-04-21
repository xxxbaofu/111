"""Celery worker and scheduled jobs."""

from __future__ import annotations

from datetime import date, timedelta
from random import Random

from celery import Celery
from sqlalchemy import select

from app.config import get_settings
from app.db import SessionLocal
from app.models.entities import DailyMetric, Product
from app.services.scoring import calc_growth, calc_total_score


settings = get_settings()
celery_app = Celery(
    "cross-border-worker",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

# Scheduling strategy from requirement:
# - ingest hourly
# - compute growth daily
# - compute trend weekly
celery_app.conf.beat_schedule = {
    "ingest-hourly": {
        "task": "app.tasks.worker.ingest_hourly",
        "schedule": 3600.0,
    },
    "compute-growth-daily": {
        "task": "app.tasks.worker.compute_growth_daily",
        "schedule": 86400.0,
    },
    "compute-trend-weekly": {
        "task": "app.tasks.worker.compute_trend_weekly",
        "schedule": 604800.0,
    },
}


@celery_app.task(name="app.tasks.worker.ingest_hourly")
def ingest_hourly() -> str:
    """
    Placeholder for real collectors.
    For now, append one daily metric snapshot jitter for each product.
    """
    db = SessionLocal()
    try:
        today = date.today()
        products = db.scalars(select(Product)).all()
        rng = Random(123)
        inserted = 0
        for product in products:
            metric = DailyMetric(
                product_id=product.id,
                date=today,
                heat=max(1.0, product.heat_score * 1000 + rng.uniform(-300, 300)),
                discussion=max(1.0, product.discussion_score * 80 + rng.uniform(-40, 40)),
                ads_count=max(0, int((product.total_score / 100) * 20 + rng.uniform(-3, 3))),
                mention_count=max(0, int(product.discussion_score * 20 + rng.uniform(-10, 10))),
            )
            db.merge(metric)
            inserted += 1
        db.commit()
        return f"hourly metrics inserted/merged: {inserted}"
    finally:
        db.close()


@celery_app.task(name="app.tasks.worker.compute_growth_daily")
def compute_growth_daily() -> str:
    db = SessionLocal()
    try:
        products = db.scalars(select(Product)).all()
        updated = 0
        today = date.today()
        start_recent = today - timedelta(days=6)
        start_prev = today - timedelta(days=13)
        end_prev = today - timedelta(days=7)

        for product in products:
            metrics = db.scalars(
                select(DailyMetric)
                .where(
                    DailyMetric.product_id == product.id,
                    DailyMetric.date >= start_prev,
                    DailyMetric.date <= today,
                )
            ).all()
            recent = [m for m in metrics if start_recent <= m.date <= today]
            prev = [m for m in metrics if start_prev <= m.date <= end_prev]
            recent_heat = sum(m.heat for m in recent)
            prev_heat = sum(m.heat for m in prev)
            growth = calc_growth(recent_heat, prev_heat)

            discussion = sum(m.discussion for m in recent) / max(1, len(recent))
            ads_recent = sum(m.ads_count for m in recent)
            ads_prev = sum(m.ads_count for m in prev)
            ads_growth = calc_growth(float(ads_recent), float(ads_prev))

            product.growth_score = growth
            product.total_score = calc_total_score(
                heat=recent_heat / max(1, len(recent)),
                growth=growth,
                discussion=discussion,
                competition=product.competition_score,
                ads_growth=ads_growth,
            )
            product.recommendation = (
                "强烈推荐"
                if product.total_score >= 80
                else "可以测试"
                if product.total_score >= 65
                else "观望"
                if product.total_score >= 45
                else "不建议"
            )
            updated += 1

        db.commit()
        return f"daily growth updated: {updated}"
    finally:
        db.close()


@celery_app.task(name="app.tasks.worker.compute_trend_weekly")
def compute_trend_weekly() -> str:
    # Placeholder for weekly trend aggregation and alerts.
    return "weekly trend aggregation complete"

