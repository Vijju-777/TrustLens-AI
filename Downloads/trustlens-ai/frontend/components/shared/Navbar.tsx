"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, MessageSquareText, Link2, QrCode, AlertTriangle, Bot } from "lucide-react";
import clsx from "clsx";

const LINKS = [
  { href: "/analyzer", label: "Message", icon: MessageSquareText },
  { href: "/analyzer#url", label: "URL", icon: Link2 },
  { href: "/qr-scan", label: "QR Code", icon: QrCode },
  { href: "/arrest-scam", label: "Arrest Scam", icon: AlertTriangle },
  { href: "/chatbot", label: "Assistant", icon: Bot },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="glass sticky top-0 z-50 mx-auto mt-4 flex w-[95%] max-w-6xl items-center justify-between rounded-full px-6 py-3">
      <Link href="/" className="flex items-center gap-2 font-bold text-brand-700 dark:text-brand-300">
        <ShieldCheck size={22} />
        <span className="hidden sm:inline">TrustLens AI</span>
      </Link>
      <div className="flex items-center gap-1 overflow-x-auto text-sm">
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 font-medium transition",
              pathname === link.href.split("#")[0]
                ? "bg-brand-500 text-white"
                : "text-slate-600 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-white/10"
            )}
          >
            <link.icon size={15} />
            <span className="hidden md:inline">{link.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
