import { AnalysisResponse, ChatMessage } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// Anonymous session id (no login system) — generated once per browser.
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("trustlens_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("trustlens_session_id", id);
  }
  return id;
}

async function handleResponse(res: Response) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || "Something went wrong. Please try again.");
  }
  return res.json();
}

export async function analyzeMessage(text: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, session_id: getSessionId() }),
  });
  return handleResponse(res);
}

export async function analyzeUrl(url: string): Promise<AnalysisResponse> {
  const res = await fetch(`${API_BASE_URL}/api/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, session_id: getSessionId() }),
  });
  return handleResponse(res);
}

export async function scanQr(file: File): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("session_id", getSessionId());
  const res = await fetch(`${API_BASE_URL}/api/qr`, {
    method: "POST",
    body: form,
  });
  return handleResponse(res);
}

export async function detectArrestScam(file: File): Promise<AnalysisResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("session_id", getSessionId());
  const res = await fetch(`${API_BASE_URL}/api/arrest-scam`, {
    method: "POST",
    body: form,
  });
  return handleResponse(res);
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[]
): Promise<{ reply: string }> {
  const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, session_id: getSessionId() }),
  });
  return handleResponse(res);
}
