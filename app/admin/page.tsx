// app/admin/page.tsx — overview
"use client";

import { useEffect, useState } from "react";
import { AdminService, type AdminStats } from "@/app/services/AdminService";

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setloading] = useState(true)
  useEffect(() => {
    try{
    AdminService.getStats().then((res) => setStats(res.data.stats)).catch(() => {});
    setloading(false)
    }
    catch{}
  }, []);

  const cards = stats
    ? [
        { label: "Total users", value: stats.totalUsers },
        { label: "Active creators", value: stats.activeCreators },
        { label: "Total books", value: stats.totalBooks },
        { label: "Suspended users", value: stats.suspendedUsers },
      ]
    : [];

  if(loading) return <div></div>

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Overview</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-hairline p-4">
            <p className="font-display text-2xl font-semibold text-ink">{c.value ?? "—"}</p>
            <p className="mt-1 font-sans text-xs text-ink-muted">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}