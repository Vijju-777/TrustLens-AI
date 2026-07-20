export type ThreatLevel = "Safe" | "Suspicious" | "Scam" | "Dangerous";

export interface AIResult {
  risk_score: number;
  trust_score: number;
  threat_level: ThreatLevel;
  explanation: string;
  recommendation: string;
  flags: string[];
}

export interface AnalysisResponse {
  type: string;
  input_summary: Record<string, string>;
  ai_result: AIResult;
  session_id: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
