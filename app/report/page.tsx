"use client";

import { useState } from "react";
import { Flag, CheckCircle2, Loader2 } from "lucide-react";

type ReportType = "book" | "chapter" | "comment" | "user" | "other";
type ReportReason =
  | "copyright"
  | "harassment"
  | "spam"
  | "untagged_mature"
  | "impersonation"
  | "underage"
  | "other";

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: "book", label: "A book" },
  { value: "chapter", label: "A chapter" },
  { value: "comment", label: "A comment" },
  { value: "user", label: "A user" },
  { value: "other", label: "Something else" },
];

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: "copyright", label: "Copyright infringement" },
  { value: "harassment", label: "Harassment or abuse" },
  { value: "spam", label: "Spam or scam" },
  { value: "untagged_mature", label: "Mature content not tagged" },
  { value: "impersonation", label: "Impersonation" },
  { value: "underage", label: "Underage user or content involving minors" },
  { value: "other", label: "Other" },
];

interface FormState {
  type: ReportType;
  reason: ReportReason;
  url: string;
  description: string;
  email: string;
}

const INITIAL_STATE: FormState = {
  type: "book",
  reason: "copyright",
  url: "",
  description: "",
  email: "",
};

export default function ReportPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.description.trim()) {
      setError("Please describe the issue so we can look into it.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong sending your report. Please try again, or email support@tipatale.com directly.");
    }
  }

  if (status === "success") {
    return (
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
        <CheckCircle2 size={40} className="text-accent" />
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Report received</h1>
        <p className="mt-2 font-sans text-sm leading-relaxed text-ink-muted">
          Thanks for flagging this. Our team reviews reports in the order they come in and will
          take action if it violates our{" "}
          <a href="/guidelines" className="text-accent hover:underline">Community Guidelines</a>{" "}
          or{" "}
          <a href="/terms" className="text-accent hover:underline">Terms of Service</a>. If you
          gave us an email, we&rsquo;ll follow up if we need more details.
        </p>
        <button
          onClick={() => {
            setForm(INITIAL_STATE);
            setStatus("idle");
          }}
          className="mt-6 rounded-full border border-hairline bg-bg px-5 py-2 font-sans text-sm font-semibold text-ink transition hover:border-accent"
        >
          Submit another report
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <div className="border-b border-hairline pb-6">
        <div className="flex items-center gap-2">
          <Flag size={16} className="text-accent" />
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">Report a problem</p>
        </div>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink">Report content or a user</h1>
        <p className="mt-3 max-w-lg font-sans text-sm leading-relaxed text-ink-muted">
          Use this form to flag a book, chapter, comment, or user that violates our{" "}
          <a href="/guidelines" className="text-accent hover:underline">Community Guidelines</a>.
          For account-specific help, visit our{" "}
          <a href="/help" className="text-accent hover:underline">Help Center</a> instead.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="font-sans text-sm font-semibold text-ink">What are you reporting?</label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {REPORT_TYPES.map((t) => (
              <button
                type="button"
                key={t.value}
                onClick={() => update("type", t.value)}
                className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
                  form.type === t.value
                    ? "border-accent bg-accent text-accent-ink shadow-sm"
                    : "border-hairline bg-bg text-ink hover:border-accent"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="reason" className="font-sans text-sm font-semibold text-ink">Reason</label>
          <select
            id="reason"
            value={form.reason}
            onChange={(e) => update("reason", e.target.value as ReportReason)}
            className="mt-2 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition focus:border-accent"
          >
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="url" className="font-sans text-sm font-semibold text-ink">
            Link to the content <span className="font-normal text-ink-muted">(optional, but helps us find it faster)</span>
          </label>
          <input
            id="url"
            type="url"
            value={form.url}
            onChange={(e) => update("url", e.target.value)}
            placeholder="https://tipatale.com/book/..."
            className="mt-2 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="description" className="font-sans text-sm font-semibold text-ink">
            Describe the issue
          </label>
          <textarea
            id="description"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={5}
            placeholder="Tell us what happened, including anything that will help our team review it."
            className="mt-2 w-full resize-none rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent"
          />
        </div>

        <div>
          <label htmlFor="email" className="font-sans text-sm font-semibold text-ink">
            Your email <span className="font-normal text-ink-muted">(optional, in case we need more info)</span>
          </label>
          <input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            className="mt-2 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Sending report…
            </>
          ) : (
            "Submit report"
          )}
        </button>

        <p className="text-center font-sans text-xs text-ink-muted">
          For urgent safety issues involving a minor, also contact your local authorities directly.
        </p>
      </form>
    </main>
  );
}