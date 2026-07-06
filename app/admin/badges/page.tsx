// app/admin/badges/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  AdminService,
  type AdminBadgeRow,
  type AdminUserRow,
  type CreateBadgeBody,
} from "@/app/services/AdminService";
import { BadgeIcon } from "@/components/badge-icon";

const EMPTY_FORM: CreateBadgeBody = {
  key: "",
  category: "reading_milestone",
  tier: 1,
  name: "",
  threshold: 10,
};

export default function AdminBadgesPage() {
  const [badges, setBadges] = useState<AdminBadgeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CreateBadgeBody>(EMPTY_FORM);
  const [createError, setCreateError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editThreshold, setEditThreshold] = useState<number>(0);

  const [awardOpenFor, setAwardOpenFor] = useState<string | null>(null);

  function loadBadges() {
    setLoading(true);
    AdminService.getBadges()
      .then((res) => setBadges(res.data.badges))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadBadges();
  }, []);

  async function toggle(badge: AdminBadgeRow) {
    const next = !badge.active;
    setBadges((b) => b.map((row) => (row._id === badge._id ? { ...row, active: next } : row)));
    try {
      await AdminService.toggleBadgeActive(badge._id, next);
    } catch {
      setBadges((b) => b.map((row) => (row._id === badge._id ? { ...row, active: badge.active } : row)));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    if (!form.key.trim() || !form.name.trim()) {
      setCreateError("Key and name are required.");
      return;
    }

    setSaving(true);
    try {
      const res = await AdminService.createBadge({
        ...form,
        key: form.key.trim(),
        name: form.name.trim(),
      });
      setBadges((b) => [...b, res.data.badge].sort((a, c) => a.category.localeCompare(c.category) || a.tier - c.tier));
      setForm(EMPTY_FORM);
      setCreating(false);
    } catch (err: any) {
      setCreateError(err?.response?.data?.message ?? "Couldn't create badge.");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(badge: AdminBadgeRow) {
    setEditingId(badge._id);
    setEditThreshold(badge.threshold);
  }

  async function saveEdit(badge: AdminBadgeRow) {
    if (editThreshold === badge.threshold) {
      setEditingId(null);
      return;
    }
    const prev = badges;
    setBadges((b) => b.map((row) => (row._id === badge._id ? { ...row, threshold: editThreshold } : row)));
    setEditingId(null);
    try {
      await AdminService.updateBadge(badge._id, { threshold: editThreshold });
    } catch {
      setBadges(prev);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Badges</h1>
          <p className="mt-1 font-sans text-sm text-ink-muted">
            {"Deactivating a badge stops new awards — it doesn't remove it from users who already earned it."}
          </p>
        </div>
        <button
          onClick={() => setCreating((v) => !v)}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink hover:opacity-90"
        >
          <Plus size={14} />
          New badge
        </button>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="mt-4 rounded-xl border border-hairline p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 font-sans text-xs text-ink-muted">
              Key (stable, never renamed)
              <input
                value={form.key}
                onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
                placeholder="reading_3000"
                className="rounded-lg border border-hairline px-3 py-2 font-sans text-sm text-ink"
              />
            </label>

            <label className="flex flex-col gap-1 font-sans text-xs text-ink-muted">
              Display name
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Immortal reader"
                className="rounded-lg border border-hairline px-3 py-2 font-sans text-sm text-ink"
              />
            </label>

            <label className="flex flex-col gap-1 font-sans text-xs text-ink-muted">
              Category
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value as CreateBadgeBody["category"] }))
                }
                className="rounded-lg border border-hairline px-3 py-2 font-sans text-sm text-ink"
              >
                <option value="reading_milestone">Reading milestone</option>
                <option value="streak">Streak</option>
              </select>
            </label>

            <label className="flex flex-col gap-1 font-sans text-xs text-ink-muted">
              Tier (1–5, drives badge art)
              <input
                type="number"
                min={1}
                max={5}
                value={form.tier}
                onChange={(e) => setForm((f) => ({ ...f, tier: Number(e.target.value) }))}
                className="rounded-lg border border-hairline px-3 py-2 font-sans text-sm text-ink"
              />
            </label>

            <label className="flex flex-col gap-1 font-sans text-xs text-ink-muted">
              Threshold ({form.category === "reading_milestone" ? "chapters" : "streak days"})
              <input
                type="number"
                min={1}
                value={form.threshold}
                onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) }))}
                className="rounded-lg border border-hairline px-3 py-2 font-sans text-sm text-ink"
              />
            </label>

            <div className="flex items-end gap-2">
              <BadgeIcon category={form.category} tier={form.tier} size={40} title="Preview" />
              <span className="font-sans text-xs text-ink-muted">Preview</span>
            </div>
          </div>

          {createError && <p className="mt-3 font-sans text-xs text-red-500">{createError}</p>}

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink disabled:opacity-50"
            >
              {saving ? "Creating…" : "Create badge"}
            </button>
            <button
              type="button"
              onClick={() => {
                setCreating(false);
                setForm(EMPTY_FORM);
                setCreateError(null);
              }}
              className="rounded-full border border-hairline px-4 py-2 font-sans text-sm text-ink-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading && <p className="mt-4 font-sans text-sm text-ink-muted">Loading…</p>}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {badges.map((b) => (
          <div key={b._id} className="rounded-xl border border-hairline p-4">
            <div className="flex items-center gap-4">
              <BadgeIcon category={b.category} tier={b.tier} size={44} title={b.name} />
              <div className="flex-1">
                <p className="font-sans text-sm font-semibold text-ink">{b.name}</p>
                {editingId === b._id ? (
                  <input
                    type="number"
                    autoFocus
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(Number(e.target.value))}
                    onBlur={() => saveEdit(b)}
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(b)}
                    className="mt-0.5 w-24 rounded border border-hairline px-1.5 py-0.5 font-sans text-xs"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(b)}
                    className="mt-0.5 font-sans text-xs text-ink-muted hover:text-accent hover:underline"
                  >
                    {b.category === "reading_milestone" ? `${b.threshold} chapters` : `${b.threshold}-day streak`}
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 font-sans text-xs text-ink-muted">
                <input type="checkbox" checked={b.active} onChange={() => toggle(b)} />
                Active
              </label>
            </div>

            <button
              onClick={() => setAwardOpenFor(awardOpenFor === b._id ? null : b._id)}
              className="mt-3 font-sans text-xs font-medium text-accent hover:underline"
            >
              {awardOpenFor === b._id ? "Close" : "Manually award / revoke…"}
            </button>

            {awardOpenFor === b._id && <ManualAwardPanel badge={b} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ManualAwardPanel({ badge }: { badge: AdminBadgeRow }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<AdminUserRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    setSearching(true);
    setMessage(null);
    try {
      const res = await AdminService.getUsers(1, q.trim());
      setResults(res.data.users);
    } finally {
      setSearching(false);
    }
  }

  async function award(userId: string) {
    setBusyId(userId);
    setMessage(null);
    try {
      await AdminService.awardBadge(userId, badge._id);
      setMessage(`Awarded "${badge.name}".`);
    } catch {
      setMessage("Couldn't award badge.");
    } finally {
      setBusyId(null);
    }
  }

  async function revoke(userId: string) {
    setBusyId(userId);
    setMessage(null);
    try {
      await AdminService.revokeBadge(userId, badge._id);
      setMessage(`Revoked "${badge.name}".`);
    } catch {
      setMessage("Couldn't revoke badge.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-hairline bg-surface p-3">
      <form onSubmit={search} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search username…"
          className="flex-1 rounded-lg border border-hairline px-3 py-1.5 font-sans text-xs"
        />
        <button
          type="submit"
          disabled={searching}
          className="flex items-center gap-1 rounded-lg border border-hairline px-3 py-1.5 font-sans text-xs disabled:opacity-50"
        >
          <Search size={12} />
          {searching ? "…" : "Search"}
        </button>
      </form>

      {message && <p className="mt-2 font-sans text-xs text-ink-muted">{message}</p>}

      {results.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {results.map((u) => (
            <li key={u._id} className="flex items-center justify-between gap-2">
              <span className="font-sans text-xs text-ink">@{u.username}</span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => award(u._id)}
                  disabled={busyId === u._id}
                  className="rounded-full border border-hairline px-2.5 py-1 font-sans text-[11px] text-ink-muted hover:border-accent hover:text-accent disabled:opacity-50"
                >
                  Award
                </button>
                <button
                  onClick={() => revoke(u._id)}
                  disabled={busyId === u._id}
                  className="rounded-full border border-hairline px-2.5 py-1 font-sans text-[11px] text-ink-muted hover:border-red-400 hover:text-red-500 disabled:opacity-50"
                >
                  Revoke
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}