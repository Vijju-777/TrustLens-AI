"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  MessageSquareText,
  Link2,
  QrCode,
  AlertTriangle,
  Bot,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  {
    href: "/analyzer",
    icon: MessageSquareText,
    title: "Scam Message Analyzer",
    desc: "Paste any WhatsApp, SMS, or Email text and get an instant fraud verdict.",
  },
  {
    href: "/analyzer#url",
    icon: Link2,
    title: "Website Trust Analyzer",
    desc: "Check any link for phishing, typosquatting, and brand impersonation.",
  },
  {
    href: "/qr-scan",
    icon: QrCode,
    title: "QR Code Safety Scanner",
    desc: "Upload a QR code and we'll decode and verify the destination for you.",
  },
  {
    href: "/arrest-scam",
    icon: AlertTriangle,
    title: "Digital Arrest Scam Detector",
    desc: "Upload a screenshot to detect police/government impersonation scams.",
  },
  {
    href: "/chatbot",
    icon: Bot,
    title: "Cyber Safety Assistant",
    desc: "Ask anything about UPI safety, OTP safety, and phishing awareness.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-20">
      <section className="flex flex-col items-center gap-6 pt-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-brand-700 dark:text-brand-300"
        >
          <ShieldCheck size={16} />
          AI for Digital Public Safety
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl"
        >
          Trust<span className="text-brand-500">Lens</span> AI
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-xl text-lg text-slate-600 dark:text-slate-300"
        >
          Analyze Before You Trust. Paste a message, check a link, scan a QR
          code, or upload a screenshot — TrustLens AI tells you instantly if
          it&apos;s safe.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link href="/analyzer" className="btn-primary">
            Start Analyzing <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      <section className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={f.href}
              className="glass-card group flex h-full flex-col gap-4 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="w-fit rounded-xl bg-brand-100 dark:bg-brand-900/40 p-3 text-brand-600 dark:text-brand-300">
                <f.icon size={22} />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
              <span className="mt-auto flex items-center gap-1 text-sm font-medium text-brand-600 dark:text-brand-300">
                Try it <ArrowRight size={14} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
