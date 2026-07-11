"use client";

import { useState } from "react";
import { Mail, MessageCircle, Shield, Briefcase, CheckCircle2, Loader2 } from "lucide-react";

type Topic = "support" | "press" | "copyright" | "careers" | "other";

const TOPICS: { value: Topic; label: string }[] = [
  { value: "support", label: "General support" },
  { value: "press", label: "Press / media" },
  { value: "copyright", label: "Copyright concern" },
  { value: "careers", label: "Careers" },
  { value: "other", label: "Other" },
];

const DIRECT_CONTACTS = [
  { icon: Mail, label: "Support", email: "support@tipatale.com", body: "Account issues, billing, or general questions." },
  { icon: Shield, label: "Copyright", email: "copyright@tipatale.com", body: "Report copyright infringement or a DMCA notice." },
  { icon: Briefcase, label: "Careers", email: "careers@tipatale.com", body: "Job applications and open roles." },
  { icon: MessageCircle, label: "Press", email: "press@tipatale.com", body: "Media inquiries and partnerships." },
];

interface FormState {
  name: string;
  email: string;
  topic: Topic;
  message: string;
}

const INITIAL_STATE: FormState = { name: "", email: "", topic: "support", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    setError(null);
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Something went wrong sending your message. Please try again or email us directly below.");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="border-b border-hairline pb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">Contact</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">Get in touch</h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          Have a question, a partnership idea, or something that needs a human? Send us a note
          below, or email the right team directly.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        {/* Form */}
        <section>
          {status === "success" ? (
            <div className="flex flex-col items-center rounded-xl border border-hairline bg-surface px-6 py-16 text-center">
              <CheckCircle2 size={36} className="text-accent" />
              <h2 className="mt-4 font-display text-xl font-bold text-ink">Message sent</h2>
              <p className="mt-2 max-w-sm font-sans text-sm leading-relaxed text-ink-muted">
                Thanks for reaching out — we typically reply within a couple of business days.
              </p>
              <button
                onClick={() => {
                  setForm(INITIAL_STATE);
                  setStatus("idle");
                }}
                className="mt-6 rounded-full border border-hairline bg-bg px-5 py-2 font-sans text-sm font-semibold text-ink transition hover:border-accent"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="font-sans text-sm font-semibold text-ink">Name</label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Your name"
                    className="mt-2 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="font-sans text-sm font-semibold text-ink">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="font-sans text-sm font-semibold text-ink">What&rsquo;s this about?</label>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TOPICS.map((t) => (
                    <button
                      type="button"
                      key={t.value}
                      onClick={() => update("topic", t.value)}
                      className={`rounded-full border px-3 py-1.5 font-sans text-xs font-medium transition ${
                        form.topic === t.value
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
                <label htmlFor="message" className="font-sans text-sm font-semibold text-ink">Message</label>
                <textarea
                  id="message"
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  rows={6}
                  placeholder="How can we help?"
                  className="mt-2 w-full resize-none rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent"
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
                className="flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {status === "submitting" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send message"
                )}
              </button>
            </form>
          )}
        </section>

        {/* Direct contacts */}
        <aside className="space-y-3">
          {DIRECT_CONTACTS.map(({ icon: Icon, label, email, body }) => (
            <a
              key={email}
              href={`mailto:${email}`}
              className="flex gap-3 rounded-xl border border-hairline bg-surface p-4 transition hover:border-accent"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Icon size={16} />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-ink">{label}</p>
                <p className="mt-0.5 font-sans text-xs text-ink-muted">{body}</p>
                <p className="mt-1 font-sans text-xs font-medium text-accent">{email}</p>
              </div>
            </a>
          ))}
        </aside>
      </div>
    </main>
  );
}