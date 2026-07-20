# TrustLens AI
### *Analyze Before You Trust*
**Steps 1–5: Foundation Documents**

---

## STEP 1 — Software Requirement Specification (SRS)

### 1.1 Introduction

**1.1.1 Purpose**
This document specifies the functional and non-functional requirements for **TrustLens AI**, an AI-powered cyber safety platform that allows citizens to verify suspicious digital content (messages, URLs, QR codes, screenshots) before trusting or acting on them.

**1.1.2 Scope**
TrustLens AI will:
- Accept text (WhatsApp/SMS/Email content), URLs, QR code images, and screenshots as input.
- Use Google Gemini API to analyze content for fraud, phishing, scam, and digital-arrest-scam patterns.
- Use OCR (Tesseract) to extract text from uploaded screenshots.
- Use pyzbar + OpenCV to decode QR codes and analyze the destination URL.
- Return a structured output: Risk Score, Trust Score, Threat Level, AI Explanation, Recommended Action.
- Provide a chatbot assistant for general cyber safety Q&A.

Out of scope (explicitly excluded per project rules): user authentication/login, payments, blockchain, and unrelated dashboards.

**1.1.3 Intended Audience**
Hackathon judges, development team (you + Claude as senior engineer), and potential future adopters (police/cyber-crime departments, banks).

**1.1.4 Definitions**
| Term | Meaning |
|---|---|
| Risk Score | Numeric 0–100 score representing likelihood content is malicious |
| Trust Score | Inverse of risk score, communicated to build user confidence |
| Threat Level | Categorical label: Safe / Suspicious / Scam / Dangerous |
| OCR | Optical Character Recognition |
| Typosquatting | Domain names deliberately misspelled to imitate legitimate brands |

### 1.2 Overall Description

**1.2.1 Product Perspective**
TrustLens AI is a standalone full-stack web application. It is not part of an existing product line. It consists of a Next.js frontend and a FastAPI backend, connected via REST APIs, backed by MongoDB Atlas, with Gemini as the reasoning engine.

**1.2.2 Product Functions (Summary)**
1. AI Scam Message Analyzer
2. Website Trust Analyzer
3. QR Code Safety Scanner
4. Digital Arrest Scam Detector
5. AI Cyber Safety Assistant (chatbot)

**1.2.3 User Classes and Characteristics**
| User Class | Technical Skill | Primary Need |
|---|---|---|
| General Public / Senior Citizens | Low | Simple, clear "is this safe?" answer |
| Students | Medium | Learning + verification |
| Banks / Police / Cyber Cells | Medium–High | Fast triage, explainability, evidence trail |

**1.2.4 Operating Environment**
- Frontend: Vercel (Edge/Node runtime), modern browsers, mobile-responsive.
- Backend: Render (Python 3.11+ container).
- Database: MongoDB Atlas (cloud-hosted, no local DB dependency).
- External API: Google Gemini API (network dependency, requires API key + quota).

**1.2.5 Design and Implementation Constraints**
- Must be demo-ready within 2 days.
- No fake/mock ML models — all AI reasoning routed through Gemini.
- No login/auth system.
- Must work reliably offline-of-network-issues with graceful error states (Gemini/API failure must not crash UI).

**1.2.6 Assumptions and Dependencies**
- A valid Gemini API key with sufficient quota is available.
- MongoDB Atlas free-tier cluster is available.
- Uploaded screenshots are reasonably legible for OCR (not requiring advanced image restoration).

### 1.3 Functional Requirements

| ID | Requirement |
|---|---|
| FR-1 | System shall accept pasted text (message/email content) and classify it as Safe/Suspicious/Scam |
| FR-2 | System shall accept a URL and return a Trust Score with reasoning (HTTPS check, domain age heuristics, typosquatting pattern, brand impersonation) |
| FR-3 | System shall accept an uploaded QR code image, decode it, extract the destination URL, and run it through the Website Trust Analyzer |
| FR-4 | System shall accept an uploaded screenshot, run OCR to extract text, then run the extracted text through Gemini to detect digital arrest scam patterns (police/government impersonation, fear tactics, urgency, money demands) |
| FR-5 | System shall provide a chatbot interface for general cyber-safety questions (UPI safety, OTP safety, phishing awareness) |
| FR-6 | Every analysis result shall include: Risk Score (0–100), Threat Level (categorical), AI Explanation (plain-language), Recommended Action |
| FR-7 | System shall store each analysis request/response in MongoDB for history/audit (no login required — session-based or anonymous ID) |
| FR-8 | System shall degrade gracefully and show a user-friendly error if Gemini API, OCR, or QR decode fails |

### 1.4 Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Analysis response should return within 5–8 seconds for text/URL, within 10–12 seconds for image/OCR flows |
| Usability | UI must be understandable by a senior citizen with minimal cyber literacy |
| Reliability | Backend must handle malformed input (broken URLs, corrupt images) without crashing |
| Security | No storage of PII beyond what's needed for the demo; sanitize all inputs; rate-limit API abuse |
| Portability | Fully responsive — mobile, tablet, desktop |
| Maintainability | Modular API design (one route per feature), reusable frontend components |
| Scalability | Stateless backend (can scale horizontally on Render) |

### 1.5 External Interface Requirements
- **Gemini API** — text generation/reasoning endpoint, called server-side only (key never exposed to frontend).
- **MongoDB Atlas** — document storage via `motor` (async) or `pymongo`.
- **Tesseract OCR** — invoked via `pytesseract` binary/library, server-side.
- **pyzbar/OpenCV** — server-side QR decode from uploaded image bytes.

---

## STEP 2 — Product Requirement Document (PRD)

### 2.1 Vision Statement
Give every Indian citizen — regardless of technical literacy — a single, trustworthy place to paste, upload, or scan anything suspicious and get an instant, explainable safety verdict.

### 2.2 Problem We're Solving
Fraud is fragmented: phishing tools check messages, URL scanners check links, QR scanners check codes, and none of them explain *why* something is dangerous in language a non-technical person understands. Digital arrest scams (a fast-growing India-specific fraud pattern) have no dedicated detection tool at all. TrustLens AI unifies all of this into one AI-driven triage layer.

### 2.3 Goals
| Goal | Success Metric (for demo) |
|---|---|
| Unified input handling | One upload/paste box detects input type automatically |
| Accurate scam detection | Correctly flags at least 8/10 curated demo scam samples |
| Explainability | Every verdict includes a human-readable reason, not just a score |
| Speed | End-to-end response under ~10s for image-based flows |
| Polish | Judges perceive it as a "real product," not a prototype |

### 2.4 Non-Goals
- Not a replacement for law-enforcement-grade forensics.
- Not attempting real-time SMS/WhatsApp interception (manual paste/upload only).
- No user accounts, no persistent personalized history beyond session.

### 2.5 User Stories

| # | As a... | I want to... | So that... |
|---|---|---|---|
| 1 | Senior citizen | Paste a suspicious WhatsApp message | I know if I should reply or block |
| 2 | Student | Check a link before clicking | I don't get phished |
| 3 | General user | Scan a QR code from a poster/payment | I don't send money to a scammer |
| 4 | Anyone receiving a "digital arrest" call | Upload the screenshot of the chat/call notice | I understand it's fake and stay calm |
| 5 | Any user | Ask "Is UPI PIN sharing safe?" | I learn cyber hygiene basics |
| 6 | Police/Cyber cell (future) | Get a fast triage tool | They can prioritize real complaints |

### 2.6 Feature Prioritization (MoSCoW)

**Must Have**
- Scam Message Analyzer
- Website Trust Analyzer
- QR Code Scanner
- Digital Arrest Scam Detector
- Unified Risk/Trust Score output UI

**Should Have**
- Cyber Safety Chatbot
- Analysis history (session-based)
- Dark mode

**Could Have**
- Shareable "verdict card" (image export) for reporting
- Multi-language explanation (English/Hindi)

**Won't Have (this build)**
- Login/auth, payments, blockchain, browser extension

### 2.7 Success Criteria for Hackathon Demo
1. Live end-to-end demo of all 5 features with real Gemini responses (no hardcoded fake output).
2. Clean, Apple-inspired glassmorphism UI, fully responsive.
3. At least one clearly-staged "digital arrest scam" screenshot demo that produces a confident, explainable verdict.
4. README + PPT + Demo script ready before submission deadline.

### 2.8 Risks & Mitigations
| Risk | Mitigation |
|---|---|
| Gemini API rate limits during live demo | Cache/pre-warm a few demo requests; add retry+backoff |
| OCR misreads low-quality screenshots | Curate high-quality demo screenshots; show pre-processing (grayscale/threshold) |
| Judges question "is this real AI or rules-based" | Clearly show Gemini prompt/response in a "How it works" panel |
| Time overrun in 2-day window | Strict step-by-step plan (this document series), no scope creep |

---

## STEP 3 — System Architecture

### 3.1 High-Level Architecture (conceptual)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│   Next.js + React + TypeScript + Tailwind + Shadcn + Framer   │
│   Pages: Home | Analyzer | URL Check | QR Scan | Arrest      │
│   Scam Detector | Chatbot                                     │
└───────────────────────────┬────────────────────────────────────┘
                             │ HTTPS (REST, JSON / multipart)
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI, Python)                 │
│  ┌───────────────┐ ┌────────────────┐ ┌────────────────────┐ │
│  │ /api/message   │ │ /api/url        │ │ /api/qr             │ │
│  │  analyzer      │ │  trust-check    │ │  scanner             │ │
│  └───────┬────────┘ └────────┬────────┘ └──────────┬──────────┘ │
│          │                   │                      │            │
│  ┌───────▼──────────┐ ┌──────▼────────┐  ┌──────────▼────────┐  │
│  │ /api/arrest-scam  │ │ /api/chatbot   │  │ Core Services:     │  │
│  │  detector (OCR)   │ │                │  │ - gemini_service   │  │
│  └───────┬────────────┘ └───────┬───────┘  │ - ocr_service       │  │
│          │                      │           │ - qr_service        │  │
│          └──────────┬───────────┘           │ - url_heuristics    │  │
│                      ▼                       │ - scoring_engine    │  │
│              gemini_service.py ───────────►  Google Gemini API    │  │
│                      │                                             │
│                      ▼                                             │
│              MongoDB Atlas (motor async driver)                    │
│              Collections: analyses, chat_sessions                  │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Component Responsibilities

**Frontend (Next.js)**
- Renders unified input UI (auto-detects: text vs URL vs image vs QR).
- Calls backend REST endpoints.
- Renders result cards (Risk Score gauge, Threat Level badge, Explanation, Recommendations) with Framer Motion transitions.
- Handles loading/error states gracefully.

**Backend (FastAPI)**
- Exposes modular REST routes, one per feature (SOLID — single responsibility per router).
- `gemini_service.py` — single centralized wrapper for all Gemini calls (prompt templates, response parsing, retry logic).
- `ocr_service.py` — wraps Tesseract, handles image pre-processing (grayscale, threshold, denoise).
- `qr_service.py` — wraps pyzbar/OpenCV decode logic.
- `url_heuristics.py` — deterministic pre-checks (HTTPS presence, domain length/entropy, known-brand Levenshtein distance) that get passed to Gemini as *additional context*, not replacing AI judgment.
- `scoring_engine.py` — normalizes Gemini's output + heuristic signals into a consistent Risk/Trust Score schema.
- `db.py` — MongoDB connection singleton.

**Database (MongoDB Atlas)**
- Stores each analysis (input type, input snapshot, result, timestamp) for audit/history — anonymous session ID, no login.

**External AI (Gemini API)**
- Sole reasoning engine. All "is this a scam" judgment calls are delegated to Gemini with structured prompts requesting structured JSON responses.

### 3.3 Data Flow (Example: Digital Arrest Scam Detector)
1. User uploads screenshot → frontend sends `multipart/form-data` to `POST /api/arrest-scam`.
2. Backend runs `ocr_service.extract_text(image)` → raw text.
3. Backend builds a structured prompt combining raw text + detection criteria (impersonation, urgency, fear, money demand) and calls `gemini_service.analyze()`.
4. Gemini returns structured JSON: `{threat_level, risk_score, explanation, recommendation, flags: [...]}`.
5. `scoring_engine` normalizes response → saved to MongoDB → returned to frontend.
6. Frontend renders the verdict card with animation.

### 3.4 Security Considerations
- Gemini API key stored server-side only (`.env`, never exposed to client).
- Input validation on all endpoints (file size/type limits for images, URL format checks).
- CORS restricted to the deployed frontend origin.
- Rate limiting on public endpoints to prevent abuse/quota exhaustion.
- No sensitive PII persisted beyond what's needed for demo history.

### 3.5 Deployment Architecture
- **Frontend** → Vercel (auto-deploy from GitHub main branch).
- **Backend** → Render (Docker or native Python web service, auto-deploy from GitHub).
- **Database** → MongoDB Atlas (free-tier cluster, IP allowlist / 0.0.0.0 for demo simplicity, tightened before real production use).
- Environment variables (`GEMINI_API_KEY`, `MONGODB_URI`, `ALLOWED_ORIGINS`) managed via platform secrets, never committed to git.

---

## STEP 4 — Database Schema (MongoDB Atlas)

### 4.1 Design Notes
MongoDB is used because inputs/results are semi-structured and vary by feature type (message vs URL vs QR vs screenshot). A single flexible `analyses` collection with a `type` discriminator field avoids over-normalizing while keeping queries simple. No login system means we use a lightweight anonymous `session_id` (generated client-side, stored in browser storage) purely to group a user's own history in the UI — not for identity/auth.

### 4.2 Database Name
`trustlens_ai`

### 4.3 Collections

#### 4.3.1 `analyses`
Stores every analysis run across all four detection features.

```json
{
  "_id": "ObjectId",
  "session_id": "string (anonymous client-generated UUID)",
  "type": "string  // enum: 'message' | 'url' | 'qr' | 'arrest_scam'",
  "input_summary": {
    "raw_text": "string | null        // for message/arrest_scam (OCR output)",
    "url": "string | null              // for url/qr",
    "image_ref": "string | null        // optional: storage ref/filename, not stored long-term"
  },
  "heuristics": {
    "https_present": "boolean | null",
    "typosquat_score": "number | null",
    "domain_age_flag": "boolean | null"
  },
  "ai_result": {
    "risk_score": "number (0-100)",
    "trust_score": "number (0-100)",
    "threat_level": "string  // enum: 'Safe' | 'Suspicious' | 'Scam' | 'Dangerous'",
    "explanation": "string",
    "recommendation": "string",
    "flags": ["string"]
  },
  "gemini_meta": {
    "model": "string",
    "latency_ms": "number"
  },
  "created_at": "ISODate"
}
```

**Indexes**
- `{ session_id: 1, created_at: -1 }` — fast retrieval of a user's recent history.
- `{ type: 1 }` — filter by feature type.
- `{ "ai_result.threat_level": 1 }` — analytics/reporting.

#### 4.3.2 `chat_sessions`
Stores chatbot conversation turns (for the Cyber Safety Assistant).

```json
{
  "_id": "ObjectId",
  "session_id": "string",
  "messages": [
    {
      "role": "string  // 'user' | 'assistant'",
      "content": "string",
      "timestamp": "ISODate"
    }
  ],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

**Indexes**
- `{ session_id: 1 }` — unique per session.

### 4.4 Data Retention Note
Since there is no auth, `session_id` is a soft identifier only. For the hackathon demo, data can persist indefinitely; a production version would add TTL indexes (e.g., 30-day auto-expiry) for privacy — worth mentioning in the "Future Scope" document later.

---

## STEP 5 — Folder Structure

### 5.1 Guiding Principles
- **Separation of concerns**: frontend and backend are independent deployable units.
- **Feature-first backend routing**: one router file per core feature (SOLID — single responsibility).
- **Reusable frontend components**: shared UI primitives (score gauge, badge, upload box) live in `components/shared`.
- **Config/secrets isolated**: `.env` files never committed; `.env.example` provided for onboarding.

### 5.2 Root Structure

```
trustlens-ai/
├── frontend/                      # Next.js app (deployed to Vercel)
├── backend/                       # FastAPI app (deployed to Render)
├── docs/                          # SRS, PRD, architecture, PPT, demo script
├── .gitignore
└── README.md
```

### 5.3 Frontend Structure (Next.js + TS)

```
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Landing / Home
│   ├── analyzer/
│   │   └── page.tsx                 # Unified Message/URL analyzer
│   ├── qr-scan/
│   │   └── page.tsx
│   ├── arrest-scam/
│   │   └── page.tsx
│   ├── chatbot/
│   │   └── page.tsx
│   └── globals.css
├── components/
│   ├── shared/
│   │   ├── ScoreGauge.tsx
│   │   ├── ThreatBadge.tsx
│   │   ├── UploadBox.tsx
│   │   ├── ResultCard.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/                          # shadcn generated primitives (button, card, dialog...)
│   └── chatbot/
│       └── ChatWindow.tsx
├── lib/
│   ├── api.ts                       # centralized fetch wrapper to backend
│   ├── types.ts                     # shared TS interfaces (AnalysisResult, etc.)
│   └── utils.ts
├── public/
│   └── logo.svg
├── styles/
│   └── theme.css                    # glassmorphism tokens, blue/white palette
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```

### 5.4 Backend Structure (FastAPI + Python)

```
backend/
├── app/
│   ├── main.py                      # FastAPI app entrypoint, CORS, router registration
│   ├── config.py                    # env var loading (Gemini key, Mongo URI)
│   ├── db.py                        # MongoDB connection singleton (motor client)
│   ├── routers/
│   │   ├── message_router.py         # POST /api/message
│   │   ├── url_router.py             # POST /api/url
│   │   ├── qr_router.py              # POST /api/qr
│   │   ├── arrest_scam_router.py     # POST /api/arrest-scam
│   │   └── chatbot_router.py         # POST /api/chatbot
│   ├── services/
│   │   ├── gemini_service.py         # all Gemini API calls + prompt templates
│   │   ├── ocr_service.py            # Tesseract wrapper
│   │   ├── qr_service.py             # pyzbar/OpenCV wrapper
│   │   ├── url_heuristics.py         # deterministic URL checks
│   │   └── scoring_engine.py         # normalizes AI + heuristic output
│   ├── models/
│   │   ├── schemas.py                # Pydantic request/response models
│   │   └── db_models.py              # Mongo document shape helpers
│   └── utils/
│       ├── validators.py             # input validation helpers
│       └── logger.py
├── tests/
│   ├── test_message_router.py
│   ├── test_url_router.py
│   ├── test_qr_router.py
│   └── test_arrest_scam_router.py
├── requirements.txt
├── Dockerfile
└── .env.example
```

### 5.5 Docs Structure

```
docs/
├── SRS.md
├── PRD.md
├── architecture.md
├── db-schema.md
├── folder-structure.md
├── api-endpoints.md
├── wireframes/
├── TrustLens_AI_Demo_Script.md
├── TrustLens_AI_Future_Scope.md
└── TrustLens_AI_Presentation.pptx
```

---

## ✅ Steps 1–5 Complete

Covered: SRS → PRD → System Architecture → Database Schema → Folder Structure.

**Next up (Steps 6–10):** UI Wireframes, API Endpoint Design, Frontend build, Backend build, Gemini integration.

Say **"continue"** or **"next 5 steps"** and I'll proceed exactly the same way — one solid, complete block at a time.
