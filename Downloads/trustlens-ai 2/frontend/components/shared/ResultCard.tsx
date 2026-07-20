"use client";

import { motion } from "framer-motion";
import { AIResult } from "@/lib/types";
import ThreatBadge from "./ThreatBadge";
import ScoreGauge from "./ScoreGauge";
import { Flag, Lightbulb } from "lucide-react";

const THREAT_STROKE: Record<string, string> = {
  Safe: "stroke-safe",
  Suspicious: "stroke-suspicious",
  Scam: "stroke-scam",
  Dangerous: "stroke-dangerous",
};

export default function ResultCard({ result }: { result: AIResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card w-full"
    >
      <div className="flex flex-col items-center gap-4 border-b border-white/30 dark:border-white/10 pb-6 sm:flex-row sm:justify-between">
        <ThreatBadge level={result.threat_level} />
        <div className="flex gap-6">
          <ScoreGauge
            score={result.risk_score}
            label="Risk Score"
            colorClass={THREAT_STROKE[result.threat_level]}
          />
          <ScoreGauge
            score={result.trust_score}
            label="Trust Score"
            colorClass="stroke-brand-400"
          />
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            AI Explanation
          </h3>
          <p className="text-slate-700 dark:text-slate-200">{result.explanation}</p>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-brand-50 dark:bg-brand-900/30 p-4">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-brand-600 dark:text-brand-300" />
          <p className="text-sm font-medium text-brand-800 dark:text-brand-200">
            {result.recommendation}
          </p>
        </div>

        {result.flags.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Red Flags Detected
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.flags.map((flag, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/10 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300"
                >
                  <Flag size={12} />
                  {flag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
