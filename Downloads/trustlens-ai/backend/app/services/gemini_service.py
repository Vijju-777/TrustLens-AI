"""
Single centralized wrapper around the Google Gemini API.
Every feature (message analyzer, URL checker, QR checker, arrest-scam
detector, chatbot) calls through this one module so that:
  - the API key is touched in exactly one place
  - prompt templates are easy to tune
  - JSON parsing / error handling is consistent everywhere
"""
import json
import re
import time
from google import genai
from google.genai import types
from app.config import settings
from app.models.schemas import AIResult

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=settings.GEMINI_API_KEY)
    return _client


SYSTEM_INSTRUCTION = """You are TrustLens AI, a cyber-safety analysis engine used by an
Indian digital-fraud-prevention platform. You analyze suspicious digital content
(messages, URLs, screenshots) and output a STRICT JSON verdict.

Always respond with ONLY a valid JSON object, no markdown fences, no preamble, matching
exactly this schema:
{
  "risk_score": <integer 0-100, 0=completely safe, 100=extremely dangerous>,
  "trust_score": <integer 0-100, inverse of risk_score>,
  "threat_level": <one of "Safe", "Suspicious", "Scam", "Dangerous">,
  "explanation": <2-4 sentences in simple plain English, understandable by a senior
                   citizen with no technical background>,
  "recommendation": <one clear, specific, actionable next step for the user>,
  "flags": [<short strings naming specific red flags found, e.g. "urgency pressure",
             "impersonates police", "typosquatted domain", "requests OTP">]
}

Be decisive. Do not hedge. If something shows classic fraud patterns, say so clearly.
Threat level guide:
  Safe        -> risk_score 0-20
  Suspicious  -> risk_score 21-55
  Scam        -> risk_score 56-85
  Dangerous   -> risk_score 86-100 (used for active digital-arrest / extortion scams)
"""


def _extract_json(raw_text: str) -> dict:
    """Gemini occasionally wraps JSON in markdown fences despite instructions;
    this strips those defensively before parsing."""
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(json)?", "", cleaned).strip()
    cleaned = re.sub(r"```$", "", cleaned).strip()
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)
    return json.loads(cleaned)


def analyze(prompt: str) -> tuple[AIResult, dict]:
    """
    Sends a structured analysis prompt to Gemini and returns a validated
    AIResult plus metadata (model name, latency).
    Raises RuntimeError on failure so routers can return a clean 502 to the UI.
    """
    client = _get_client()
    start = time.time()
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_INSTRUCTION,
                temperature=0.2,
                response_mime_type="application/json",
            ),
        )
        latency_ms = int((time.time() - start) * 1000)
        data = _extract_json(response.text)
        result = AIResult(
            risk_score=int(data["risk_score"]),
            trust_score=int(data.get("trust_score", 100 - int(data["risk_score"]))),
            threat_level=data["threat_level"],
            explanation=data["explanation"],
            recommendation=data["recommendation"],
            flags=data.get("flags", []),
        )
        return result, {"model": settings.GEMINI_MODEL, "latency_ms": latency_ms}
    except Exception as exc:
        raise RuntimeError(f"Gemini analysis failed: {exc}") from exc


def chat_reply(message: str, history: list[dict]) -> str:
    """Free-form cyber-safety Q&A chatbot (not the strict-JSON analyzer)."""
    client = _get_client()
    chat_system = """You are the TrustLens AI Cyber Safety Assistant. Answer questions
about online fraud, phishing, UPI safety, OTP safety, digital arrest scams and general
cyber hygiene for an Indian audience. Keep answers short (3-6 sentences), clear, and
practical. Do not use markdown headers. Never ask the user for OTPs, passwords, or PINs."""

    contents = []
    for turn in history[-8:]:
        role = "user" if turn.get("role") == "user" else "model"
        contents.append(
            types.Content(role=role, parts=[types.Part(text=turn.get("content", ""))])
        )
    contents.append(types.Content(role="user", parts=[types.Part(text=message)]))

    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=chat_system,
                temperature=0.4,
            ),
        )
        return response.text.strip()
    except Exception as exc:
        raise RuntimeError(f"Gemini chat failed: {exc}") from exc
