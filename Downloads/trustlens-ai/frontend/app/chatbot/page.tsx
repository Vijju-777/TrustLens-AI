"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { sendChatMessage } from "@/lib/api";
import { ChatMessage } from "@/lib/types";

const SUGGESTIONS = [
  "Is it safe to share my OTP with a bank employee?",
  "How do I know if a UPI payment request is fake?",
  "What is a digital arrest scam?",
  "How can I identify a phishing email?",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your TrustLens Cyber Safety Assistant. Ask me anything about scams, phishing, UPI safety, or OTP safety.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (message: string) => {
    if (!message.trim() || loading) return;
    const newMessages: ChatMessage[] = [...messages, { role: "user", content: message }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const res = await sendChatMessage(message, newMessages);
      setMessages([...newMessages, { role: "assistant", content: res.reply }]);
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I couldn't process that right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Cyber Safety Assistant</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Your AI guide to staying safe online.
        </p>
      </div>

      <div className="glass-card flex h-[60vh] flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2 ${
                m.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  m.role === "user"
                    ? "bg-brand-500 text-white"
                    : "bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300"
                }`}
              >
                {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-brand-500 text-white"
                    : "bg-white/70 dark:bg-white/10 text-slate-700 dark:text-slate-200"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="animate-spin" size={16} /> Thinking...
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {messages.length === 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-brand-200 dark:border-white/20 px-3 py-1.5 text-xs text-brand-700 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-white/10"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 border-t border-white/30 dark:border-white/10 pt-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask a cyber safety question..."
            className="flex-1 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2.5 text-sm focus:border-brand-400 focus:outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={loading || !input.trim()}
            className="btn-primary !px-4 !py-2.5"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
