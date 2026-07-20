"""
Feature 4: Digital Arrest Scam Detector
Accepts a screenshot, OCRs it, then asks Gemini to specifically look
for digital-arrest-scam patterns (police/govt impersonation, fear,
urgency, money demands) — this is India's fastest-growing scam type.
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.models.schemas import AnalysisResponse
from app.services import gemini_service, scoring_engine, ocr_service

router = APIRouter(prefix="/api/arrest-scam", tags=["Digital Arrest Scam Detector"])

MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024  # 8 MB


@router.post("", response_model=AnalysisResponse)
async def detect_arrest_scam(
    file: UploadFile = File(...), session_id: str = Form("anonymous")
):
    if file.content_type not in ("image/png", "image/jpeg", "image/jpg", "image/webp"):
        raise HTTPException(status_code=400, detail="Please upload a PNG, JPG, or WEBP image")

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="Image too large (max 8MB)")

    try:
        extracted_text = ocr_service.extract_text(image_bytes)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    if not extracted_text:
        raise HTTPException(
            status_code=422,
            detail="No readable text could be extracted from this image. Try a clearer screenshot.",
        )

    prompt = f"""The following text was OCR-extracted from a screenshot the user received
(chat message, call notice, or video call screen). Analyze it SPECIFICALLY for signs of a
"digital arrest" scam or law-enforcement/government impersonation extortion scam — a scam
pattern common in India where fraudsters impersonate police, CBI, customs, or income tax
officials, claim the victim is under investigation or "digital arrest", and demand money
or personal/banking details out of fear.

Look for: impersonation of police/CBI/customs/income-tax/RBI, claims of a pending arrest
warrant or FIR, threats of legal action, demands to stay on video call and not tell anyone,
demands for money transfer/OTP/bank details to "verify" or "clear" the case, extreme urgency
and isolation pressure ("do not disconnect", "do not tell family").

EXTRACTED TEXT:
\"\"\"
{extracted_text}
\"\"\"

If these patterns are present, the threat_level MUST be "Scam" or "Dangerous" and the
explanation should clearly state that real police/government agencies NEVER conduct arrests
or investigations over video call or demand money transfers. Respond with the required JSON
schema."""

    try:
        ai_result, gemini_meta = gemini_service.analyze(prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    input_summary = {"raw_text": extracted_text[:1000]}

    await scoring_engine.persist_analysis(
        analysis_type="arrest_scam",
        session_id=session_id,
        input_summary=input_summary,
        ai_result=ai_result,
        heuristics=None,
        gemini_meta=gemini_meta,
    )

    return AnalysisResponse(
        type="arrest_scam",
        input_summary=input_summary,
        ai_result=ai_result,
        session_id=session_id,
    )
