"use client";

import { motion } from "framer-motion";

interface Props {
  score: number; // 0-100
  label: string;
  colorClass: string; // tailwind stroke color e.g. "stroke-scam"
}

export default function ScoreGauge({ score, label, colorClass }: Props) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            className="stroke-slate-200 dark:stroke-white/10"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            className={colorClass}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}
