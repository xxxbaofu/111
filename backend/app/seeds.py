"""Seed script for demo data in PostgreSQL."""

from __future__ import annotations

from datetime import date, datetime, timedelta
from random import Random

from app.db import SessionLocal
from app.models.entities import (
    Ad,
    Bookmark,
    Category,
    DailyMetric,
    HeadLeader,
    Product,
    RegionCode,
    WorkflowHistory,
    WorkflowTask,
)
from app.services.scoring import calc_total_score


def _region_seed(region: RegionCode) -> int:
    return sum(ord(ch) for ch in region.value)


def seed_demo() -> None:
    db = SessionLocal()
    try:
        # idempotent seed
        if db.query(Product).count() > 0:
            return

        now = datetime.utcnow()
        categories: list[Category] = []
        for region in RegionCode:
            for cname in ("宠物纪念", "婴儿护理", "家居健康", "情绪礼品"):
                c = Category(
                    name=cname,
                    market=region.value,
                    heat_score=0,
                    growth_score=0,
                    avg_price=0,
                    product_count=0,
                )
                db.add(c)
                categories.append(c)
        db.flush()

        for region in RegionCode:
            rng = Random(_region_seed(region))
            region_categories = [c for c in categories if c.market == region.value]
            for idx in range(12):
                category = region_categories[idx % len(region_categories)]
                price_avg = round(rng.uniform(18, 140), 2)
                price_min = round(price_avg * rng.uniform(0.6, 0.9), 2)
                price_max = round(price_avg * rng.uniform(1.1, 1.7), 2)
                heat_raw = rng.randint(35_000, 950_000)
                growth_raw = rng.uniform(-0.1, 1.2)
                discussion_raw = rng.randint(300, 9_000)
                competition_raw = rng.randint(20, 95)
                ads_growth_raw = rng.uniform(-0.1, 1.0)
                total_score = calc_total_score(
                    heat=float(heat_raw),
                    growth=float(growth_raw),
                    discussion=float(discussion_raw),
                    competition=float(competition_raw),
                    ads_growth=float(ads_growth_raw),
                )

                product = Product(
                    name_en=f"Product {region.value}-{idx+1}",
                    name_cn=f"{category.name}候选{idx+1}",
                    category_id=category.id,
                    market=region.value,
                    price_avg=price_avg,
                    price_min=price_min,
                    price_max=price_max,
                    heat_score=round(heat_raw / 100_000.0, 2),
                    growth_score=round(growth_raw, 3),
                    discussion_score=round(discussion_raw / 1000.0, 2),
                    competition_score=float(competition_raw),
                    total_score=total_score,
                    recommendation=(
                        "强烈推荐"
                        if total_score >= 82
                        else "可以测试"
                        if total_score >= 68
                        else "观望"
                    ),
                    strategy_type=(
                        "情绪内容转化" if "纪念" in category.name else "短视频爆款打法"
                    ),
                    budget_daily=round(rng.uniform(20, 80), 2),
                    budget_test=round(rng.uniform(40, 180), 2),
                    budget_scale=round(rng.uniform(280, 1200), 2),
                    estimated_daily_revenue=round(rng.uniform(120, 4200), 2),
                    data_level="L1",
                )
                db.add(product)
                db.flush()

                for d in range(14):
                    db.add(
                        DailyMetric(
                            product_id=product.id,
                            date=date.today() - timedelta(days=d),
                            heat=max(1, heat_raw + rng.randint(-20_000, 18_000)),
                            discussion=max(1, discussion_raw + rng.randint(-1000, 800)),
                            ads_count=max(0, int(rng.uniform(0, 20))),
                            mention_count=max(0, int(rng.uniform(5, 55))),
                        )
                    )

                for platform in ("TikTok", "Amazon", "Reddit", "X", "XHS"):
                    db.add(
                        Ad(
                            product_id=product.id,
                            platform=platform,
                            creative_type="UGC",
                            appear_count=rng.randint(1, 40),
                            last_seen=now - timedelta(hours=rng.randint(1, 120)),
                            market=region.value,
                        )
                    )

                db.add(
                    HeadLeader(
                        type="product",
                        name=product.name_cn,
                        market=region.value,
                        score=product.total_score,
                        growth=product.growth_score,
                    )
                )

                if idx < 4:
                    task = WorkflowTask(
                        product_id=product.id,
                        market=region.value,
                        status="待测试" if idx < 2 else "测试中",
                        priority=1 if idx == 0 else 2,
                        owner="self",
                        note="种子任务：优先验证 CTR 与 CVR。",
                        next_action="补充 3 套素材后开始小预算投放",
                    )
                    db.add(task)
                    db.flush()
                    db.add(
                        WorkflowHistory(
                            task_id=task.id,
                            market=region.value,
                            action="create",
                            from_status="",
                            to_status=task.status,
                            note=task.note,
                        )
                    )
                if idx < 2:
                    db.add(
                        Bookmark(
                            market=region.value,
                            entity_type="product",
                            product_id=product.id,
                            title=f"重点跟踪：{product.name_cn}",
                            note="关注广告素材衰减速度与评论区真实反馈。",
                        )
                    )

            for category in region_categories:
                products = (
                    db.query(Product)
                    .filter(Product.market == region.value, Product.category_id == category.id)
                    .all()
                )
                if not products:
                    continue
                category.product_count = len(products)
                category.avg_price = sum(p.price_avg for p in products) / len(products)
                category.heat_score = sum(p.heat_score for p in products) / len(products)
                category.growth_score = sum(p.growth_score for p in products) / len(products)

        db.commit()
    finally:
        db.close()
