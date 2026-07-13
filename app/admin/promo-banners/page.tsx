// app/admin/promo-banners/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { AdminService, type AdminPromoBanner } from "@/app/services/AdminService";
import { DropdownSelect } from "@/app/components/ui/dropdown-select";

const TYPE_OPTIONS = [
  { value: "books" as const, label: "Book carousel" },
  { value: "announcement" as const, label: "Announcement / link-out" },
];

const EMPTY_FORM = {
  type: "books" as "books" | "announcement",
  heading: "",
  accent: "",
  bgColor: "#C81854",
  waveColor: "#FF9478",
  books: [{ title: "", coverUrl: "", href: "" }],
  imageUrl: "",
  linkUrl: "",
  linkLabel: "",
  openInNewTab: false,
  active: true,
  order: 0,
};

export default function AdminPromoBannersPage() {
  const [banners, setBanners] = useState<AdminPromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    AdminService.getPromoBanners()
      .then((res) => setBanners(res.data.banners))
      .finally(() => setLoading(false));
  }
  useEffect(load, []);

  function updateBookField(i: number, field: "title" | "coverUrl" | "href", value: string) {
    setForm((f) => ({
      ...f,
      books: f.books.map((b, idx) => (idx === i ? { ...b, [field]: value } : b)),
    }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const payload = {
        ...form,
        books: form.type === "books" ? form.books.filter((b) => b.title && b.coverUrl && b.href) : [],
      };
      const { data } = await AdminService.createPromoBanner(payload);
      setBanners((prev) => [data.banner, ...prev]);
      setForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that banner.");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(b: AdminPromoBanner) {
    const prev = banners;
    setBanners((bs) => bs.map((x) => (x._id === b._id ? { ...x, active: !x.active } : x)));
    try {
      await AdminService.updatePromoBanner(b._id, { active: !b.active });
    } catch {
      setBanners(prev);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this banner?")) return;
    const prev = banners;
    setBanners((bs) => bs.filter((b) => b._id !== id));
    try {
      await AdminService.deletePromoBanner(id);
    } catch {
      setBanners(prev);
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Promo banners</h1>
      <p className="mt-1 font-sans text-sm text-ink-muted">
        Homepage banners — either a book carousel (like Wattpad&apos;s &quot;fan-favorites&quot; shelf) or a single
        clickable announcement that links out to a blog post, article, or in-app page.
      </p>

      {/* ── Create form ─────────────────────────────────────────── */}
      <form onSubmit={handleCreate} className="mt-6 flex flex-col gap-4 rounded-xl border border-hairline bg-surface p-5">
        <div className="flex flex-wrap items-end gap-3">
          <Field label="Type">
            <DropdownSelect value={form.type} options={TYPE_OPTIONS} onChange={(v) => setForm((f) => ({ ...f, type: v }))} className="w-56" />
          </Field>
          <Field label="Heading (line 1)">
            <input value={form.heading} onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))} placeholder="Fall hard for these" className="w-56 rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm" />
          </Field>
          <Field label="Accent (line 2)">
            <input value={form.accent} onChange={(e) => setForm((f) => ({ ...f, accent: e.target.value }))} placeholder="fan-favorites" className="w-56 rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm" />
          </Field>
          <Field label="Background color">
            <input type="color" value={form.bgColor} onChange={(e) => setForm((f) => ({ ...f, bgColor: e.target.value }))} className="h-9 w-14 rounded-lg border border-hairline" />
          </Field>
          {form.type === "books" && (
            <Field label="Wave color">
              <input type="color" value={form.waveColor} onChange={(e) => setForm((f) => ({ ...f, waveColor: e.target.value }))} className="h-9 w-14 rounded-lg border border-hairline" />
            </Field>
          )}
        </div>

        {form.type === "books" ? (
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Books</p>
            <div className="mt-2 flex flex-col gap-2">
              {form.books.map((b, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <input value={b.title} onChange={(e) => updateBookField(i, "title", e.target.value)} placeholder="Title" className="w-40 rounded-lg border border-hairline px-2.5 py-1.5 font-sans text-xs" />
                  <input value={b.coverUrl} onChange={(e) => updateBookField(i, "coverUrl", e.target.value)} placeholder="Cover image URL" className="w-56 rounded-lg border border-hairline px-2.5 py-1.5 font-sans text-xs" />
                  <input value={b.href} onChange={(e) => updateBookField(i, "href", e.target.value)} placeholder="/book/slug" className="w-40 rounded-lg border border-hairline px-2.5 py-1.5 font-sans text-xs" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, books: f.books.filter((_, idx) => idx !== i) }))}
                    className="text-ink-muted hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, books: [...f.books, { title: "", coverUrl: "", href: "" }] }))}
              className="mt-2 flex items-center gap-1 font-sans text-xs font-medium text-accent hover:underline"
            >
              <Plus size={12} /> Add book
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <Field label="Destination link">
              <input
                value={form.linkUrl}
                onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))}
                placeholder="/blog/valentines-picks  or  https://blog.example.com/post"
                className="w-72 rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm"
              />
            </Field>
            <Field label="Button label (optional)">
              <input value={form.linkLabel} onChange={(e) => setForm((f) => ({ ...f, linkLabel: e.target.value }))} placeholder="Read more" className="w-44 rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm" />
            </Field>
            <Field label="Background image URL (optional)">
              <input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://…jpg" className="w-64 rounded-lg border border-hairline px-3 py-1.5 font-sans text-sm" />
            </Field>
            <label className="flex items-center gap-1.5 font-sans text-xs text-ink-muted">
              <input type="checkbox" checked={form.openInNewTab} onChange={(e) => setForm((f) => ({ ...f, openInNewTab: e.target.checked }))} />
              Open in new tab (external links only)
            </label>
          </div>
        )}

        {error && <p className="font-sans text-xs text-red-600">{error}</p>}

        <button type="submit" disabled={creating} className="self-start rounded-full bg-accent px-4 py-2 font-sans text-sm font-semibold text-accent-ink disabled:opacity-50">
          {creating ? "Creating…" : "Create banner"}
        </button>
      </form>

      {/* ── List ────────────────────────────────────────────────── */}
      <div className="mt-6 flex flex-col gap-2">
        {loading && <p className="font-sans text-sm text-ink-muted">Loading…</p>}
        {banners.map((b) => (
          <div key={b._id} className="flex items-center justify-between gap-3 rounded-xl border border-hairline bg-surface p-3">
            <div className="flex items-center gap-3">
              <GripVertical size={14} className="text-ink-muted" />
              <span className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: b.bgColor }} />
              <div>
                <p className="font-sans text-sm font-medium text-ink">
                  {b.heading} {b.accent}
                </p>
                <p className="font-sans text-xs text-ink-muted capitalize">
                  {b.type === "books" ? `${b.books.length} books` : b.linkUrl}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActive(b)}
                className={`rounded-full border px-2.5 py-1 font-sans text-xs ${b.active ? "border-accent bg-accent/10 text-accent" : "border-hairline text-ink-muted"}`}
              >
                {b.active ? "Active" : "Inactive"}
              </button>
              <button onClick={() => handleDelete(b._id)} className="text-ink-muted hover:text-red-600">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-sans text-xs text-ink-muted">{label}</span>
      {children}
    </label>
  );
}