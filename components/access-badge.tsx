import { Coins, ShoppingBag, Crown, BookOpenCheck } from "lucide-react";
import type { ChapterAccess } from "@/lib/mockdata";

const CONFIG: Record<ChapterAccess, { label: string; icon: typeof Coins; className: string }> = {
  free: { label: "Free", icon: BookOpenCheck, className: "bg-hairline/40 text-ink-muted" },
  coins: { label: "coins", icon: Coins, className: "bg-amber-100 text-amber-700" },
  purchase: { label: "Buy", icon: ShoppingBag, className: "bg-accent/10 text-accent" },
  subscriber_only: { label: "Subscribers", icon: Crown, className: "bg-violet-100 text-violet-700" },
};

export function AccessBadge({ type, coinsRequired }: { type: ChapterAccess; coinsRequired?: number }) {
  const cfg = CONFIG[type];
  const Icon = cfg.icon;
  const label = type === "coins" && coinsRequired ? `${coinsRequired} ${cfg.label}` : cfg.label;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[11px] font-medium ${cfg.className}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}