// components/badge-shelf.tsx
import { Badge, type BadgeRole } from "@/components/badge";
import type { PublicUserBadge } from "@/app/services/user.service";

export function BadgeShelf({
  badges,
  role = "chip",
  max,
}: {
  badges: PublicUserBadge[];
  role?: BadgeRole;
  max?: number; // cap how many render, e.g. on a compact card
}) {
  if (badges.length === 0) return null;

  const shown = max ? badges.slice(0, max) : badges;
  const hiddenCount = max ? Math.max(0, badges.length - max) : 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {shown.map((b) => (
        <Badge key={b.key} category={b.category} tier={b.tier} name={b.name} description={b.description} role={role} />
      ))}
      {hiddenCount > 0 && (
        <span className="font-sans text-xs text-ink-muted">+{hiddenCount} more</span>
      )}
    </div>
  );
}