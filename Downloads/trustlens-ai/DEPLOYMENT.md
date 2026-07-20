# TrustLens AI — Deployment Guide

This guide takes you from local code → a live, public URL, using entirely
free tiers: **GitHub** (source control) → **Render** (backend) → **Vercel**
(frontend) → **MongoDB Atlas** (database, already set up in local setup).

Total time: ~20–30 minutes.

---

## Overview

```
GitHub repo
   │
   ├── backend/   ──► Render (Docker Web Service)  ──► https://trustlens-ai-backend.onrender.com
   │
   └── frontend/  ──► Vercel                        ──► https://trustlens-ai.vercel.app
                                                             │
                                                             ▼
                                          calls NEXT_PUBLIC_API_BASE_URL (Render URL)
```

---

## Step 1 — Push the code to GitHub

```bash
cd trustlens-ai
git init
git add .
git commit -m "TrustLens AI - initial commit"
```

1. Go to https://github.com/new, create a new repository (e.g. `trustlens-ai`). Do **not** initialize with a README (you already have one).
2. Connect and push:
```bash
git remote add origin https://github.com/<your-username>/trustlens-ai.git
git branch -M main
git push -u origin main
```

Your `.gitignore` already excludes `node_modules/`, `venv/`, `.env`, and `.env.local` — secrets will never be pushed.

---

## Step 2 — Deploy the Backend to Render

1. Go to https://render.com and sign in with GitHub.
2. Click **New +** → **Blueprint**.
3. Select your `trustlens-ai` repo. Render will auto-detect `render.yaml` at the repo root and propose a service called `trustlens-ai-backend`.
4. Click **Apply**. Render will build the Docker image from `backend/Dockerfile` (this installs Tesseract OCR, zbar, and all Python dependencies inside the container automatically — no manual system setup needed on Render).
5. Once the blueprint is created, open the service → **Environment** tab and set:
   | Key | Value |
   |---|---|
   | `GEMINI_API_KEY` | your Gemini API key |
   | `MONGODB_URI` | your MongoDB Atlas connection string |
   | `ALLOWED_ORIGINS` | leave as-is for now — you'll update it in Step 4 |
6. Click **Save Changes** — Render redeploys automatically.
7. Wait for the deploy to finish (~3-5 min for first build). Once live, note your backend URL, e.g.:
   `https://trustlens-ai-backend.onrender.com`
8. Verify it works: open `https://trustlens-ai-backend.onrender.com/api/health` in your browser. You should see `"status": "ok"`.

> **Note:** Render's free tier spins down after 15 minutes of inactivity and takes ~30-60 seconds to wake up on the next request. For a live hackathon demo, open the health-check URL a minute before you present to "wake it up."

---

## Step 3 — Deploy the Frontend to Vercel

1. Go to https://vercel.com and sign in with GitHub.
2. Click **Add New** → **Project**, select your `trustlens-ai` repo.
3. Vercel will ask for the **Root Directory** — set it to `frontend`.
4. Framework Preset should auto-detect as **Next.js** (from `vercel.json`).
5. Under **Environment Variables**, add:
   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://trustlens-ai-backend.onrender.com` (your Render URL from Step 2) |
6. Click **Deploy**. Wait ~1-2 minutes.
7. Once live, note your frontend URL, e.g.:
   `https://trustlens-ai.vercel.app`

---

## Step 4 — Connect them together (CORS)

Your backend needs to know it's allowed to accept requests from your live frontend domain.

1. Go back to **Render** → your backend service → **Environment**.
2. Update `ALLOWED_ORIGINS` to your real Vercel URL:
   ```
   ALLOWED_ORIGINS=https://trustlens-ai.vercel.app
   ```
   (If you also want your local dev frontend to keep working against the deployed backend, use a comma-separated list: `https://trustlens-ai.vercel.app,http://localhost:3000`)
3. Save — Render redeploys automatically (~1-2 min).

---

## Step 5 — Test the live app end-to-end

Open your Vercel URL and test all 5 features:
- Message Analyzer (`/analyzer`)
- URL Analyzer (`/analyzer` → URL tab)
- QR Scanner (`/qr-scan`)
- Digital Arrest Scam Detector (`/arrest-scam`)
- Cyber Safety Assistant (`/chatbot`)

If a request fails, open your browser DevTools → Network tab and check:
- **CORS error** → `ALLOWED_ORIGINS` on Render doesn't match your Vercel URL exactly (must include `https://`, no trailing slash).
- **502 from backend** → check Render logs (Dashboard → your service → Logs) for a Gemini or Mongo error.
- **Request hangs ~30-60s then works** → this is Render free-tier cold start; normal on first request after inactivity.

---

## Step 6 — (Optional) Custom domain

Both Vercel and Render support free custom domains:
- Vercel: Project → Settings → Domains → add your domain, update DNS as instructed.
- Render: Service → Settings → Custom Domains.

If you add a custom domain for the frontend, remember to update `ALLOWED_ORIGINS` on Render to match it.

---

## Redeploying after code changes

Both Render and Vercel auto-deploy on every `git push` to `main`:

```bash
git add .
git commit -m "Update feature X"
git push
```

Render rebuilds the Docker image; Vercel rebuilds the Next.js app. No manual redeploy steps needed.

---

## Cost Summary

| Service | Tier used | Cost |
|---|---|---|
| GitHub | Free | $0 |
| Render (backend) | Free Web Service | $0 (cold starts after 15 min idle) |
| Vercel (frontend) | Hobby | $0 |
| MongoDB Atlas | M0 free cluster | $0 |
| Gemini API | Free tier quota | $0 (rate-limited — fine for a demo) |

Everything needed for the hackathon demo runs at zero cost.
