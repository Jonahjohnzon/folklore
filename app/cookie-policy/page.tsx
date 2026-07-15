// app/cookie-policy/page.tsx
import Link from "next/link";
import { ArrowLeft, ShieldCheck, BarChart3, Megaphone } from "lucide-react";

export const metadata = {
  title: "Cookie Policy — TipaTale",
  description: "How TipaTale uses cookies and similar technologies.",
};

const SECTIONS = [
  { id: "overview", title: "Overview" },
  { id: "necessary", title: "Necessary cookies" },
  { id: "analytics", title: "Analytics cookies" },
  { id: "marketing", title: "Marketing cookies" },
  { id: "managing", title: "Managing your choice" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Questions" },
];

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        replace
        className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-ink-muted transition hover:text-accent"
      >
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="mt-6 border-b border-hairline pb-8">
        <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-1 font-sans text-xs font-semibold uppercase tracking-wide text-accent">
          Legal
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink sm:text-4xl">Cookie Policy</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
          How TipaTale uses cookies and similar technologies to run the site, remember your
          preferences, and, where you allow it, understand how the site is used.
        </p>
        <p className="mt-4 font-sans text-xs text-ink-muted">Last updated July 14, 2026</p>

        {/* Quick facts */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <FactCard
            icon={<ShieldCheck size={16} />}
            label="Necessary"
            value="Always on"
            detail="Required for sign-in and reader preferences"
          />
          <FactCard
            icon={<BarChart3 size={16} />}
            label="Analytics"
            value="Your choice"
            detail="Helps us improve recommendations"
          />
          <FactCard
            icon={<Megaphone size={16} />}
            label="Marketing"
            value="Your choice"
            detail="Measures promotion performance"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[220px_1fr]">
        {/* Table of contents */}
        <nav aria-label="Table of contents" className="lg:sticky lg:top-10 lg:self-start">
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">On this page</p>
          <ul className="mt-3 flex flex-col gap-2 border-l border-hairline pl-3">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="font-sans text-sm text-ink-muted transition hover:text-accent"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <div className="flex flex-col gap-9">
          <Section id="overview" number="1" title="Overview">
            <p>
              TipaTale uses cookies and similar technologies to run the site, remember your
              preferences, and, where you allow it, understand how the site is used. This policy
              explains what each category does and how to change your choice at any time.
            </p>
          </Section>

          <Section id="necessary" number="2" title="Necessary cookies">
            <p>
              These keep you signed in, remember reader settings like font and theme, and protect
              the site from abuse. They can&apos;t be turned off, since the site won&apos;t work
              correctly without them.
            </p>
          </Section>

          <Section id="analytics" number="3" title="Analytics cookies">
            <p>
              With your permission, these help us understand which pages and stories get read, so
              we can improve recommendations and fix problems.
            </p>
          </Section>

          <Section id="marketing" number="4" title="Marketing cookies">
            <p>With your permission, these help us measure the performance of promotions.</p>
          </Section>

          <Section id="managing" number="5" title="Managing your choice">
            <p>
              You can change your preferences at any time using the cookie settings link in the
              site footer.
            </p>
          </Section>

          <Section id="changes" number="6" title="Changes to this policy">
            <p>
              We may update this Cookie Policy from time to time as our use of cookies changes.
              Material changes will be reflected here, with the &quot;last updated&quot; date above
              revised accordingly.
            </p>
          </Section>

          <Section id="contact" number="7" title="Questions">
            <p>
              If anything here is unclear, reach out to support — we&apos;re happy to explain how
              any specific cookie is used.
            </p>
          </Section>

          <div className="border-t border-hairline pt-6">
            <Link
              href="/"
              replace
              className="inline-flex items-center gap-1.5 font-sans text-sm font-medium text-accent hover:underline"
            >
              <ArrowLeft size={15} /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function FactCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <div className="flex items-center gap-1.5 text-accent">
        {icon}
        <span className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {label}
        </span>
      </div>
      <p className="mt-2 font-display text-lg font-bold text-ink">{value}</p>
      <p className="mt-0.5 font-sans text-xs leading-snug text-ink-muted">{detail}</p>
    </div>
  );
}

function Section({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-10">
      <h2 className="font-display text-base font-semibold text-ink">
        <span className="text-ink-muted">{number}.</span> {title}
      </h2>
      <div className="mt-1.5 font-sans text-sm leading-relaxed text-ink-muted">{children}</div>
    </section>
  );
}