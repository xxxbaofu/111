"""SQLAlchemy entities for cross-border data operating system."""

from __future__ import annotations

from datetime import date, datetime, timezone
from enum import Enum

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class RegionCode(str, Enum):
    US = "US"
    UK = "UK"
    EU = "EU"
    SEA = "SEA"
    JP = "JP"
    KR = "KR"
    XHS = "XHS"


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    market: Mapped[str] = mapped_column(String(20), index=True)
    heat_score: Mapped[float] = mapped_column(Float, default=0)
    growth_score: Mapped[float] = mapped_column(Float, default=0)
    avg_price: Mapped[float] = mapped_column(Float, default=0)
    product_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    products: Mapped[list["Product"]] = relationship(back_populates="category")

    __table_args__ = (UniqueConstraint("name", "market", name="uq_category_name_market"),)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name_en: Mapped[str] = mapped_column(String(200), index=True)
    name_cn: Mapped[str] = mapped_column(String(200), index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), index=True)
    market: Mapped[str] = mapped_column(String(20), index=True)
    price_avg: Mapped[float] = mapped_column(Float, default=0)
    price_min: Mapped[float] = mapped_column(Float, default=0)
    price_max: Mapped[float] = mapped_column(Float, default=0)
    heat_score: Mapped[float] = mapped_column(Float, default=0)
    growth_score: Mapped[float] = mapped_column(Float, default=0)
    discussion_score: Mapped[float] = mapped_column(Float, default=0)
    competition_score: Mapped[float] = mapped_column(Float, default=0)
    total_score: Mapped[float] = mapped_column(Float, default=0)
    recommendation: Mapped[str] = mapped_column(String(40), default="观望")
    strategy_type: Mapped[str] = mapped_column(String(100), default="")
    budget_daily: Mapped[float] = mapped_column(Float, default=0)
    budget_test: Mapped[float] = mapped_column(Float, default=0)
    budget_scale: Mapped[float] = mapped_column(Float, default=0)
    estimated_daily_revenue: Mapped[float] = mapped_column(Float, default=0)
    ai_conclusion: Mapped[str] = mapped_column(Text, default="")
    ai_reason: Mapped[str] = mapped_column(Text, default="")
    ai_playbook: Mapped[str] = mapped_column(Text, default="")
    ai_budget_hint: Mapped[str] = mapped_column(Text, default="")
    ai_risk: Mapped[str] = mapped_column(Text, default="")
    data_level: Mapped[str] = mapped_column(String(20), default="L1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    category: Mapped["Category"] = relationship(back_populates="products")
    metrics: Mapped[list["DailyMetric"]] = relationship(back_populates="product")
    ads: Mapped[list["Ad"]] = relationship(back_populates="product")
    workflow_tasks: Mapped[list["WorkflowTask"]] = relationship(back_populates="product")

    __table_args__ = (UniqueConstraint("name_en", "market", name="uq_product_name_market"),)


class DailyMetric(Base):
    __tablename__ = "daily_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    heat: Mapped[float] = mapped_column(Float, default=0)
    discussion: Mapped[float] = mapped_column(Float, default=0)
    ads_count: Mapped[int] = mapped_column(Integer, default=0)
    mention_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    product: Mapped["Product"] = relationship(back_populates="metrics")

    __table_args__ = (UniqueConstraint("product_id", "date", name="uq_metric_product_date"),)


class Ad(Base):
    __tablename__ = "ads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    platform: Mapped[str] = mapped_column(String(20), index=True)
    creative_type: Mapped[str] = mapped_column(String(80), default="")
    appear_count: Mapped[int] = mapped_column(Integer, default=0)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    market: Mapped[str] = mapped_column(String(20), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

    product: Mapped["Product"] = relationship(back_populates="ads")


class HeadLeader(Base):
    __tablename__ = "leaders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    type: Mapped[str] = mapped_column(String(20), index=True)  # product/shop/creator
    name: Mapped[str] = mapped_column(String(200), index=True)
    market: Mapped[str] = mapped_column(String(20), index=True)
    score: Mapped[float] = mapped_column(Float, default=0)
    growth: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)


class WorkflowTask(Base):
    __tablename__ = "workflow_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), index=True)
    market: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(20), index=True, default="待测试")
    priority: Mapped[int] = mapped_column(Integer, default=3)
    owner: Mapped[str] = mapped_column(String(80), default="self")
    note: Mapped[str] = mapped_column(Text, default="")
    next_action: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utc_now,
        onupdate=utc_now,
    )

    product: Mapped["Product"] = relationship(back_populates="workflow_tasks")

    __table_args__ = (UniqueConstraint("product_id", "market", name="uq_workflow_product_market"),)
