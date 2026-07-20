"use client";

import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { detectArrestScam } from "@/lib/api";
import { AIResult } from "@/lib/types";
import UploadBox from "@/components/shared/UploadBox";
import ResultCard from "@/components/shared/ResultCard";

export default function ArrestScamPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleDetect = async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await detectArrestScam(file);
      setResult(res.ai_result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Digital Arrest Scam Detector</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Upload a screenshot of the chat, call notice, or video call screen.
          We&apos;ll check for police/government impersonation scam patterns.
        </p>
      </div>

      <div className="glass-card border-l-4 border-l-suspicious">
        <p className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-suspicious" />
          Reminder: Real police and government agencies never conduct arrests or
          investigations over video call, and never demand money transfers to
          &quot;clear your name.&quot;
        </p>
      </div>

      <div className="glass-card">
        <UploadBox onFileSelected={setFile} hint="Screenshot image, up to 8MB" />
        <button
          onClick={handleDetect}
          disabled={!file || loading}
          className="btn-primary mt-4 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Analyzing screenshot...
            </>
          ) : (
            <>
              <AlertTriangle size={18} /> Detect Scam
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="rounded-xl bg-dangerous/10 p-4 text-center text-sm font-medium text-dangerous">
          {error}
        </p>
      )}

      {result && <ResultCard result={result} />}
    </div>
  );
}
