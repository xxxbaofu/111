"""FastAPI entrypoint for Cross-border Data OS backend."""

from __future__ import annotations

from fastapi import FastAPI

from app.api.routes import router as api_router
from app.config import get_settings
from app.db import Base, engine


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title=settings.app_name, version="0.1.0")
    Base.metadata.create_all(bind=engine)
    app.include_router(api_router)
    return app


app = create_app()


