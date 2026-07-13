import type { Metadata } from "next";
import { Heart, Globe, Laptop, TrendingUp, Mail, Inbox, Home } from "lucide-react";
import Link from "next/link";
export const metadata: Metadata = {
  title: "Careers at TipaTale",
  description: "Help build the home for serialized fiction. See open roles at TipaTale.",
};

const PERKS = [
  { icon: Globe, title: "Remote-first", body: "Work from wherever you're most productive. We coordinate across time zones by default." },
  { icon: Laptop, title: "Flexible hours", body: "We care about output, not clock-in times. Structure your day around your life." },
  { icon: TrendingUp, title: "Real ownership", body: "Small team, high trust. You'll ship things that reach readers within weeks, not quarters." },
  { icon: Heart, title: "We read what we build", body: "Everyone on the team is expected to actually read on the platform — dogfooding is not optional." },
];

export default function CareersPage() {
  return (
    <main className="mx-auto max-w-4xl flex flex-col items-start px-4 py-14 sm:px-6">
        <Link
              href="/"
              replace
              className="flex mb-5 items-center gap-1.5 rounded-full border border-hairline bg-bg px-3 py-3 font-sans text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
              aria-label="Back to home"
              >
              <Home size={20} />
           </Link>
      <div className="border-b border-hairline pb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">Careers</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">Build TipaTale with us</h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          We&rsquo;re a small team building the platform we wish existed when we were reading
          fanfiction under our desks in class. If you like books, building things fast, and
          working with a team that actually uses its own product, you might like it here too.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-ink">Life at TipaTale</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {PERKS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-hairline bg-surface p-5">
              <Icon size={20} className="text-accent" />
              <h3 className="mt-3 font-sans text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">Open roles</h2>
        <div className="mt-5 flex flex-col items-center rounded-xl border border-hairline bg-surface px-6 py-14 text-center">
          <Inbox size={28} className="text-ink-muted" />
          <h3 className="mt-3 font-sans text-sm font-semibold text-ink">No open positions right now</h3>
          <p className="mt-1.5 max-w-sm font-sans text-sm leading-relaxed text-ink-muted">
            We&rsquo;re not actively hiring at the moment, but we&rsquo;re always happy to hear
            from people who&rsquo;d be a great fit for TipaTale. Send us a note below and
            we&rsquo;ll keep it on file for when a role opens up.
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-hairline bg-surface p-6 text-center">
        <Mail size={20} className="mx-auto text-accent" />
        <h2 className="mt-3 font-display text-xl font-bold text-ink">Want to stay on our radar?</h2>
        <p className="mx-auto mt-2 max-w-md font-sans text-sm text-ink-muted">
          Tell us a bit about yourself and what you&rsquo;d want to work on — we&rsquo;ll reach
          out when something opens up that fits.
        </p>
        <a
          href="mailto:careers@tipatale.com"
          className="mt-4 inline-block rounded-full bg-accent px-5 py-2 font-sans text-sm font-semibold text-accent-ink shadow-sm transition hover:opacity-90"
        >
          careers@tipatale.com
        </a>
      </section>
    </main>
  );
}