"""
Pydantic request/response models shared across all routers.
Keeping these centralized guarantees every endpoint returns
the exact same result shape the frontend expects.
"""
from pydantic import BaseModel, Field
from typing import Literal

ThreatLevel = Literal["Safe", "Suspicious", "Scam", "Dangerous"]


class AIResult(BaseModel):
    risk_score: int = Field(..., ge=0, le=100)
    trust_score: int = Field(..., ge=0, le=100)
    threat_level: ThreatLevel
    explanation: str
    recommendation: str
    flags: list[str] = []


class AnalysisResponse(BaseModel):
    type: str
    input_summary: dict
    ai_result: AIResult
    session_id: str


class MessageRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=8000)
    session_id: str = "anonymous"


class URLRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2048)
    session_id: str = "anonymous"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str = "anonymous"
    history: list[dict] = []


class ChatResponse(BaseModel):
    reply: str
    session_id: str
