"""
Feature 1: AI Scam Message Analyzer
Accepts pasted WhatsApp/SMS/Email text and returns a scam verdict.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import MessageRequest, AnalysisResponse
from app.services import gemini_service, scoring_engine

router = APIRouter(prefix="/api/message", tags=["Message Analyzer"])


@router.post("", response_model=AnalysisResponse)
async def analyze_message(payload: MessageRequest):
    prompt = f"""Analyze the following message (could be WhatsApp, SMS, or Email content)
for signs of fraud, phishing, or scam activity. Look for: urgency/fear tactics, requests
for money/OTP/PIN/bank details, impersonation of banks/government/delivery services,
suspicious links, prize/lottery claims, or romance/investment scam patterns.

MESSAGE:
\"\"\"
{payload.text}
\"\"\"

Respond with the required JSON schema."""

    try:
        ai_result, gemini_meta = gemini_service.analyze(prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    input_summary = {"raw_text": payload.text[:500]}

    await scoring_engine.persist_analysis(
        analysis_type="message",
        session_id=payload.session_id,
        input_summary=input_summary,
        ai_result=ai_result,
        heuristics=None,
        gemini_meta=gemini_meta,
    )

    return AnalysisResponse(
        type="message",
        input_summary=input_summary,
        ai_result=ai_result,
        session_id=payload.session_id,
    )
