"""
Feature 5: AI Cyber Safety Assistant
A free-form Q&A chatbot for general cyber-safety education
(UPI safety, OTP safety, phishing awareness, etc.)
"""
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services import gemini_service
from app.db import get_db

router = APIRouter(prefix="/api/chatbot", tags=["Cyber Safety Assistant"])


@router.post("", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    try:
        reply = gemini_service.chat_reply(payload.message, payload.history)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    try:
        db = get_db()
        now = datetime.now(timezone.utc)
        await db["chat_sessions"].update_one(
            {"session_id": payload.session_id},
            {
                "$push": {
                    "messages": {
                        "$each": [
                            {"role": "user", "content": payload.message, "timestamp": now},
                            {"role": "assistant", "content": reply, "timestamp": now},
                        ]
                    }
                },
                "$set": {"updated_at": now},
                "$setOnInsert": {"created_at": now},
            },
            upsert=True,
        )
    except Exception as exc:
        print(f"[chatbot_router] Warning: failed to persist chat: {exc}")

    return ChatResponse(reply=reply, session_id=payload.session_id)
