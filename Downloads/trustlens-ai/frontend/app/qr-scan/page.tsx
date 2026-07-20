"use client";

import { useState } from "react";
import { Loader2, QrCode } from "lucide-react";
import { scanQr } from "@/lib/api";
import { AIResult } from "@/lib/types";
import UploadBox from "@/components/shared/UploadBox";
import ResultCard from "@/components/shared/ResultCard";

export default function QrScanPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);

  const handleScan = async () => {
    if (!file) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await scanQr(file);
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
        <h1 className="text-3xl font-bold">QR Code Safety Scanner</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Upload a QR code image — we&apos;ll decode it and check where it leads.
        </p>
      </div>

      <div className="glass-card">
        <UploadBox onFileSelected={setFile} hint="PNG or JPG QR code image, up to 8MB" />
        <button
          onClick={handleScan}
          disabled={!file || loading}
          className="btn-primary mt-4 w-full"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={18} /> Scanning...
            </>
          ) : (
            <>
              <QrCode size={18} /> Scan QR Code
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
