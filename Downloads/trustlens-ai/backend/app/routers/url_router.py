"""
Feature 2: Website Trust Analyzer
Accepts a URL, computes deterministic heuristics, then asks Gemini
to reason over both the URL and the heuristic signals.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import URLRequest, AnalysisResponse
from app.services import gemini_service, scoring_engine, url_heuristics

router = APIRouter(prefix="/api/url", tags=["Website Trust Analyzer"])


@router.post("", response_model=AnalysisResponse)
async def analyze_url(payload: URLRequest):
    heuristics = url_heuristics.analyze_url(payload.url)

    prompt = f"""Analyze the following URL for phishing / scam / brand-impersonation risk.

URL: {payload.url}

Deterministic signals already computed for you (use them as evidence, don't ignore them):
- HTTPS present: {heuristics['https_present']}
- Registered domain: {heuristics['domain']}
- Possible typosquat of brand: {heuristics['typosquat_suspected_brand']}
  (edit distance: {heuristics['typosquat_edit_distance']})
- Suspicious characters/number patterns in domain: {heuristics['suspicious_characters_in_domain']}
- Excessive/unusual subdomain nesting: {heuristics['excessive_subdomains']}

Respond with the required JSON schema."""

    try:
        ai_result, gemini_meta = gemini_service.analyze(prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    input_summary = {"url": payload.url}

    await scoring_engine.persist_analysis(
        analysis_type="url",
        session_id=payload.session_id,
        input_summary=input_summary,
        ai_result=ai_result,
        heuristics=heuristics,
        gemini_meta=gemini_meta,
    )

    return AnalysisResponse(
        type="url",
        input_summary=input_summary,
        ai_result=ai_result,
        session_id=payload.session_id,
    )
