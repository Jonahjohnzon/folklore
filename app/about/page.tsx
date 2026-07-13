import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, PenLine, Users, Coins, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "About TipaTale",
  description:
    "TipaTale is a home for serialized fiction — a place for readers to discover their next favorite story and for writers to build an audience, chapter by chapter.",
};

const VALUES = [
  {
    icon: BookOpen,
    title: "Stories, one chapter at a time",
    body: "TipaTale is built around serialization. Writers publish as they go, readers follow along, and stories grow with their audience instead of arriving all at once.",
  },
  {
    icon: PenLine,
    title: "Writers come first",
    body: "Every feature we build starts with the question of whether it helps a writer finish their story and find readers who love it. Tools, not gatekeepers.",
  },
  {
    icon: Users,
    title: "A community, not just a catalog",
    body: "Comments, votes, and follows exist so readers and writers can actually talk to each other — not just browse past one another.",
  },
  {
    icon: Coins,
    title: "A way for writers to earn",
    body: "Through coins, readers can support the stories they love directly, and writers can earn from the work they publish on TipaTale.",
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto flex flex-col items-start max-w-4xl px-4 py-14 sm:px-6">
      <Link
        href="/"
        replace
        className="flex items-center gap-1.5 rounded-full border border-hairline bg-bg px-3 py-3 font-sans text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
        aria-label="Back to home"
      >
        <Home size={20} />
      </Link>

      <div className="mt-6 border-b border-hairline pb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">About</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">TipaTale</h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          TipaTale is a platform for serialized fiction. We built it for people who read
          one chapter and immediately need the next one, and for writers who&apos;d rather
          publish today than wait for &ldquo;done.&rdquo;
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-bold text-ink">Why we exist</h2>
        <div className="mt-4 space-y-4 font-sans text-[15px] leading-relaxed text-ink-muted">
          <p>
            Most fiction platforms were built for finished books. TipaTale was built for
            stories in progress — the kind that get written a chapter at a time, read on
            a phone during a commute, and shaped along the way by a comment section that
            actually cares what happens next.
          </p>
          <p>
            We started TipaTale because that experience — the serialized, community-driven
            one that made sites like Wattpad and Inkitt so addictive — deserved a modern,
            fast, well-designed home. So that&apos;s what we&apos;re building: a place where a new
            writer can post their first chapter tonight, and a reader can find it, follow
            it, and root for it until the very last page.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">What we care about</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-hairline bg-surface p-5">
              <Icon size={20} className="text-accent" />
              <h3 className="mt-3 font-sans text-sm font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 font-sans text-sm leading-relaxed text-ink-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-ink">How it works</h2>
        <div className="mt-4 space-y-4 font-sans text-[15px] leading-relaxed text-ink-muted">
          <p>
            Writers publish chapters directly to their book&rsquo;s page. Readers follow
            books, leave comments on individual chapters, and can unlock select chapters
            or support writers using coins — TipaTale&rsquo;s in-platform currency, purchased
            with real money and spent on the stories you want to back.
          </p>
          <p>
            Genres range across romance, fantasy, horror, sci-fi, and pretty much
            everything in between. If it&rsquo;s fiction and it&rsquo;s being told in
            chapters, it belongs here.
          </p>
        </div>
      </section>

      <section className="mt-12 rounded-xl border border-hairline bg-surface p-6 text-center">
        <h2 className="font-display text-xl font-bold text-ink">Want to be part of it?</h2>
        <p className="mx-auto mt-2 max-w-md font-sans text-sm text-ink-muted">
          Whether you&rsquo;re here to read or here to write, TipaTale is free to join.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/sign-up"
            replace
            className="rounded-full bg-accent px-5 py-2 font-sans text-sm font-semibold text-accent-ink shadow-sm transition hover:opacity-90"
          >
            Create an account
          </Link>
          <Link
            href="/careers"
            replace
            className="rounded-full border border-hairline bg-bg px-5 py-2 font-sans text-sm font-semibold text-ink transition hover:border-accent"
          >
            See open roles
          </Link>
        </div>
      </section>
    </main>
  );
}