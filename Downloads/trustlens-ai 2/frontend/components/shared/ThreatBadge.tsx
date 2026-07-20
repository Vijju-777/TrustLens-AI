import { ThreatLevel } from "@/lib/types";
import { ShieldCheck, ShieldAlert, ShieldX, ShieldOff } from "lucide-react";
import clsx from "clsx";

const CONFIG: Record<
  ThreatLevel,
  { color: string; bg: string; icon: React.ElementType; label: string }
> = {
  Safe: {
    color: "text-safe",
    bg: "bg-safe/10 border-safe/30",
    icon: ShieldCheck,
    label: "Safe",
  },
  Suspicious: {
    color: "text-suspicious",
    bg: "bg-suspicious/10 border-suspicious/30",
    icon: ShieldAlert,
    label: "Suspicious",
  },
  Scam: {
    color: "text-scam",
    bg: "bg-scam/10 border-scam/30",
    icon: ShieldX,
    label: "Scam",
  },
  Dangerous: {
    color: "text-dangerous",
    bg: "bg-dangerous/10 border-dangerous/30",
    icon: ShieldOff,
    label: "Dangerous",
  },
};

export default function ThreatBadge({ level }: { level: ThreatLevel }) {
  const cfg = CONFIG[level];
  const Icon = cfg.icon;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold",
        cfg.color,
        cfg.bg
      )}
    >
      <Icon size={16} />
      {cfg.label}
    </span>
  );
}
