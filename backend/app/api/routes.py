"""HTTP routes for the cross-border data operating system backend."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.ai_explain import build_ai_explanation
from app.services.queries import (
    get_ads_by_product,
    get_growth_payload,
    get_leaders_payload,
    get_market_payload,
    get_product_payload,
    list_products_payload,
)
from app.tasks.seed import seed_sample_data


router = APIRouter(prefix="/api", tags=["api"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/market")
def market(region: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    return get_market_payload(db, region=region)


@router.get("/products")
def products(
    region: str,
    category: str | None = None,
    min_score: float | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    return list_products_payload(
        db,
        region=region,
        category=category,
        min_score=min_score,
    )


@router.get("/product/{product_id}")
def product(product_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    payload = get_product_payload(db, product_id=product_id)
    if payload is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return payload


@router.get("/growth")
def growth(region: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    return get_growth_payload(db, region=region)


@router.get("/ads")
def ads(product_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    return get_ads_by_product(db, product_id=product_id)


@router.get("/leaders")
def leaders(region: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    return get_leaders_payload(db, region=region)


@router.post("/ai/explain")
def ai_explain(payload: dict[str, Any]) -> dict[str, Any]:
    return build_ai_explanation(payload)


@router.post("/seed")
def seed() -> dict[str, Any]:
    inserted = seed_sample_data()
    return {"status": "ok", "inserted": inserted}

