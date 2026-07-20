"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, Link2, Loader2, Search } from "lucide-react";
import { analyzeMessage, analyzeUrl } from "@/lib/api";
import { AIResult } from "@/lib/types";
import ResultCard from "@/components/shared/ResultCard";

type Mode = "message" | "url";

export default function AnalyzerPage() {
  const [mode, setMode] = useState<Mode>("message");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res =
        mode === "message" ? await analyzeMessage(text) : await analyzeUrl(url);
      setResult(res.ai_result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = mode === "message" ? text.trim().length > 0 : url.trim().length > 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Message &amp; Website Analyzer</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Paste a suspicious message or link. Our AI checks it in seconds.
        </p>
      </div>

      <div className="glass mx-auto flex rounded-full p-1">
        <button
          onClick={() => setMode("message")}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
            mode === "message" ? "bg-brand-500 text-white" : "text-slate-600 dark:text-slate-300"
          }`}
        >
          <MessageSquareText size={16} /> Message
        </button>
        <button
          id="url"
          onClick={() => setMode("url")}
          className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
            mode === "url" ? "bg-brand-500 text-white" : "text-slate-600 dark:text-slate-300"
          }`}
        >
          <Link2 size={16} /> URL
        </button>
      </div>

      <div className="glass-card">
        {mode === "message" ? (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the WhatsApp, SMS, or Email message here..."
            rows={6}
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 text-sm focus:border-brand-400 focus:outline-none"
          />
        ) : (
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://suspicious-link.com"
            className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 p-4 text-sm focus:border-brand-400 focus:outline-none"
          />
        )}

        <button
          onClick={handleAnalyze}
          disabled={!canSubmit || loading}
          className="btn-primary mt-4 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Analyzing...
            </>
          ) : (
            <>
              <Search size={18} /> Analyze
            </>
          )}
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl bg-dangerous/10 p-4 text-center text-sm font-medium text-dangerous"
        >
          {error}
        </motion.p>
      )}

      {result && <ResultCard result={result} />}
    </div>
  );
}
