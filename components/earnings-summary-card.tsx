import type { EarningsEntry, PayoutProfile } from "@/lib/mockdata";
import { estimateNextPayout } from "@/lib/mockdata";
import { formatCurrency } from "@/lib/format";

const SOURCE_LABELS: Record<string, string> = {
  ad_revenue: "Ad revenue",
  coin_sale: "Coin unlocks",
  chapter_purchase: "Chapter purchases",
  subscription: "Subscriptions",
};

export function EarningsSummaryCard({
  entries,
  profile,
}: {
  entries: EarningsEntry[];
  profile: PayoutProfile;
}) {
  const bySource = Object.keys(SOURCE_LABELS).map((source) => ({
    source,
    label: SOURCE_LABELS[source],
    net: entries.filter((e) => e.source === source).reduce((sum, e) => sum + e.netAmount, 0),
  }));
  const totalGross = entries.reduce((s, e) => s + e.grossAmount, 0);
  const totalFee = entries.reduce((s, e) => s + e.platformFee, 0);
  const totalNet = totalGross - totalFee;
  const hasEstimated = entries.some((e) => e.isEstimated);
  const payout = estimateNextPayout(entries, profile);

  return (
    <div className="rounded-xl border border-hairline bg-surface p-5">
      <h2 className="font-display text-lg font-semibold text-ink">Earnings breakdown</h2>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {bySource.map((s) => (
          <div key={s.source} className="rounded-lg bg-bg px-3 py-2.5">
            <p className="font-sans text-xs text-ink-muted">{s.label}</p>
            <p className="font-display text-base font-bold text-ink">{formatCurrency(s.net)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-hairline pt-4 font-sans text-sm">
        <span className="text-ink-muted">Gross − {formatCurrency(totalFee)} platform fee</span>
        <span className="font-semibold text-ink">{formatCurrency(totalNet)} net</span>
      </div>
      {hasEstimated && (
        <p className="mt-1 font-sans text-xs text-ink-muted">
          Includes estimated ad revenue pending the monthly report.
        </p>
      )}

      <div className="mt-4 rounded-lg bg-accent/5 p-3.5">
        <p className="font-sans text-xs font-medium text-ink-muted">Next payout</p>
        <p className="font-display text-xl font-bold text-ink">{formatCurrency(payout.amountDue)}</p>
        <p className="mt-0.5 font-sans text-xs text-ink-muted">
          {payout.isAboveThreshold
            ? `Scheduled for ${payout.nextPayoutDate} via ${profile.method}`
            : `Below the ${formatCurrency(profile.minimumThreshold)} minimum — rolls into next month`}
        </p>
      </div>
    </div>
  );
}