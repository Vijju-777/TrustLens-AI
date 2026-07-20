"""
Feature 3: QR Code Safety Scanner
Accepts an uploaded QR image, decodes it, then reuses the same
URL-analysis pipeline as the Website Trust Analyzer on the decoded payload.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import AnalysisResponse
from app.services import gemini_service, scoring_engine, url_heuristics, qr_service

router = APIRouter(prefix="/api/qr", tags=["QR Code Scanner"])

MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB


@router.post("", response_model=AnalysisResponse)
async def scan_qr(file: UploadFile = File(...), session_id: str = Form("anonymous")):
    if file.content_type not in ("image/png", "image/jpeg", "image/jpg", "image/webp"):
        raise HTTPException(status_code=400, detail="Please upload a PNG, JPG, or WEBP image")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 8MB)")

    try:
        payload = qr_service.decode_qr(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if payload is None:
        raise HTTPException(
            status_code=422,
            detail="No QR code could be detected in this image. Try a clearer photo.",
        )

    # Reuse the URL heuristics pipeline if the payload looks like a URL;
    # otherwise let Gemini reason over the raw payload directly.
    is_url_like = payload.strip().lower().startswith(("http://", "https://"))
    heuristics = url_heuristics.analyze_url(payload) if is_url_like else None

    heuristics_block = ""
    if heuristics:
        heuristics_block = f"""
Deterministic signals:
- HTTPS present: {heuristics['https_present']}
- Registered domain: {heuristics['domain']}
- Possible typosquat of brand: {heuristics['typosquat_suspected_brand']}
- Suspicious characters in domain: {heuristics['suspicious_characters_in_domain']}
"""

    prompt = f"""A QR code was scanned and decoded to the following payload. Analyze it for
safety risk. QR codes are commonly used in payment scams (fake UPI QR codes) and phishing.

DECODED PAYLOAD: {payload}
{heuristics_block}
If this looks like a UPI payment string, evaluate whether it looks like a legitimate
merchant payment or a scam. If it's a URL, evaluate phishing risk. If it's plain text,
evaluate for any suspicious instructions.

Respond with the required JSON schema."""

    try:
        ai_result, gemini_meta = gemini_service.analyze(prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    input_summary = {"decoded_payload": payload}

    await scoring_engine.persist_analysis(
        analysis_type="qr",
        session_id=session_id,
        input_summary=input_summary,
        ai_result=ai_result,
        heuristics=heuristics,
        gemini_meta=gemini_meta,
    )

    return AnalysisResponse(
        type="qr",
        input_summary=input_summary,
        ai_result=ai_result,
        session_id=session_id,
    )
