import Link from "next/link";
import { Coins } from "lucide-react";

export function CoinDisplay({ balance }: { balance: number }) {
  return (
    <Link
      href="/coins"
      className="flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3 py-1.5 font-sans text-sm font-semibold text-ink transition hover:border-gold hover:text-gold"
    >
      <Coins size={15} className="text-gold" />
      {balance.toLocaleString()}
      <span className="ml-0.5 hidden text-accent sm:inline">+</span>
    </Link>
  );
}
