"""
TrustLens AI — FastAPI entrypoint.
Registers all feature routers, configures CORS, and exposes a health check.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.db import ping_db
from app.routers import (
    message_router,
    url_router,
    qr_router,
    arrest_scam_router,
    chatbot_router,
)

app = FastAPI(
    title="TrustLens AI API",
    description="AI-powered cyber safety platform — analyze before you trust.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(message_router.router)
app.include_router(url_router.router)
app.include_router(qr_router.router)
app.include_router(arrest_scam_router.router)
app.include_router(chatbot_router.router)


@app.get("/")
async def root():
    return {"service": "TrustLens AI API", "status": "running"}


@app.get("/api/health")
async def health_check():
    missing_config = settings.validate()
    db_ok = await ping_db()
    return {
        "status": "ok" if not missing_config and db_ok else "degraded",
        "database_connected": db_ok,
        "missing_env_vars": missing_config,
    }
