import type { HistoryEntryDTO } from "@/app/services/LibraryService";

export interface HistoryGroup {
  label: string;
  entries: HistoryEntryDTO[];
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function labelForDay(date: Date, today: Date): string {
  const diffDays = Math.round((startOfDay(today).getTime() - startOfDay(date).getTime()) / 86_400_000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays < 7) return date.toLocaleDateString(undefined, { weekday: "long" });

  const sameYear = date.getFullYear() === today.getFullYear();
  return date.toLocaleDateString(
    undefined,
    sameYear ? { month: "long", day: "numeric" } : { month: "long", day: "numeric", year: "numeric" }
  );
}

// Assumes `entries` is already sorted newest-first (the /history route
// returns it that way), so buckets naturally come out in chronological
// order (Today, then Yesterday, ...) without a separate sort here.
export function groupHistoryByDate(entries: HistoryEntryDTO[]): HistoryGroup[] {
  const today = new Date();
  const groups: HistoryGroup[] = [];
  const indexByLabel = new Map<string, number>();

  for (const entry of entries) {
    const label = labelForDay(new Date(entry.lastReadAt), today);
    let idx = indexByLabel.get(label);
    if (idx === undefined) {
      idx = groups.length;
      indexByLabel.set(label, idx);
      groups.push({ label, entries: [] });
    }
    groups[idx].entries.push(entry);
  }

  return groups;
}