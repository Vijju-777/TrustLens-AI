"""
Normalizes AI + heuristic output into the consistent document shape
that gets saved to MongoDB and returned to the frontend.
Keeping this in one place means every router persists data identically.
"""
from datetime import datetime, timezone
from app.models.schemas import AIResult
from app.db import get_db


async def persist_analysis(
    analysis_type: str,
    session_id: str,
    input_summary: dict,
    ai_result: AIResult,
    heuristics: dict | None,
    gemini_meta: dict,
) -> None:
    """Fire-and-forget style save to MongoDB. Failures are logged, never
    block the user from seeing their result — persistence is best-effort."""
    try:
        db = get_db()
        await db["analyses"].insert_one(
            {
                "session_id": session_id,
                "type": analysis_type,
                "input_summary": input_summary,
                "heuristics": heuristics or {},
                "ai_result": ai_result.model_dump(),
                "gemini_meta": gemini_meta,
                "created_at": datetime.now(timezone.utc),
            }
        )
    except Exception as exc:
        # Intentionally swallow — DB is for history/audit, not critical path.
        print(f"[scoring_engine] Warning: failed to persist analysis: {exc}")
