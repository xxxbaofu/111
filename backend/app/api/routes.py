"""HTTP routes for the cross-border data operating system backend."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.services.ai_explain import build_ai_explanation
from app.services.queries import (
    get_ads_by_product,
    get_categories_payload,
    get_decisions_payload,
    get_growth_payload,
    get_leaders_payload,
    get_market_payload,
    get_product_payload,
    get_regions_overview_payload,
    get_system_status_payload,
    get_workbench_payload,
    list_products_payload,
    list_workflow_tasks_payload,
    upsert_workflow_task_payload,
    delete_workflow_task_payload,
)
from app.tasks.seed import seed_sample_data


router = APIRouter(prefix="/api", tags=["api"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/market")
def market(region: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    return get_market_payload(db, region=region)


@router.get("/markets/overview")
def markets_overview(db: Session = Depends(get_db)) -> dict[str, Any]:
    return get_regions_overview_payload(db)


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


@router.get("/categories")
def categories(
    region: str,
    keyword: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    return get_categories_payload(
        db,
        region=region,
        keyword=keyword,
        min_price=min_price,
        max_price=max_price,
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


@router.get("/decisions")
def decisions(
    region: str,
    top_n: int = 10,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    return get_decisions_payload(db, region=region, top_n=top_n)


@router.get("/system/status")
def system_status(db: Session = Depends(get_db)) -> dict[str, Any]:
    return get_system_status_payload(db)


@router.get("/workbench")
def workbench(region: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    return get_workbench_payload(db, region=region)


@router.get("/workflow/tasks")
def workflow_tasks(region: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    return list_workflow_tasks_payload(db, region=region)


@router.post("/workflow/task")
def upsert_workflow_task(payload: dict[str, Any], db: Session = Depends(get_db)) -> dict[str, Any]:
    product_id = int(payload.get("product_id", 0))
    region = str(payload.get("region", "")).strip()
    if product_id <= 0 or not region:
        raise HTTPException(status_code=400, detail="product_id and region are required")
    status = str(payload.get("status", "待测试"))
    priority = int(payload.get("priority", 3))
    owner = str(payload.get("owner", "self"))
    note = str(payload.get("note", ""))
    next_action = str(payload.get("next_action", ""))
    try:
        item = upsert_workflow_task_payload(
            db,
            product_id=product_id,
            region=region,
            status=status,
            priority=priority,
            owner=owner,
            note=note,
            next_action=next_action,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "ok", "item": item}


@router.post("/workflow/task/quick-add")
def quick_add_workflow_task(payload: dict[str, Any], db: Session = Depends(get_db)) -> dict[str, Any]:
    product_id = int(payload.get("product_id", 0))
    region = str(payload.get("region", "")).strip()
    if product_id <= 0 or not region:
        raise HTTPException(status_code=400, detail="product_id and region are required")
    try:
        item = upsert_workflow_task_payload(
            db,
            product_id=product_id,
            region=region,
            status=str(payload.get("status", "待测试")),
            priority=int(payload.get("priority", 2)),
            owner=str(payload.get("owner", "self")),
            note=str(payload.get("note", "来自产品池快捷加入")),
            next_action=str(payload.get("next_action", "先做 3 套素材测试 CTR")),
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"status": "ok", "item": item}


@router.delete("/workflow/task/{task_id}")
def delete_workflow_task(task_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    try:
        return delete_workflow_task_payload(db, task_id=task_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/ai/explain")
def ai_explain(payload: dict[str, Any]) -> dict[str, Any]:
    return build_ai_explanation(payload)


@router.post("/seed")
def seed() -> dict[str, Any]:
    inserted = seed_sample_data()
    return {"status": "ok", "inserted": inserted}

