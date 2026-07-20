"""
MongoDB connection singleton using Motor (async driver).
Import `get_db()` anywhere you need database access.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        _client = AsyncIOMotorClient(settings.MONGODB_URI)
    return _client


def get_db():
    """Returns the trustlens_ai database handle."""
    return get_client()["trustlens_ai"]


async def ping_db() -> bool:
    try:
        await get_client().admin.command("ping")
        return True
    except Exception:
        return False
