import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Coins, PenLine, ShieldCheck, MessageSquare, Tags } from "lucide-react";

export const metadata: Metadata = {
  title: "Community Guidelines",
  description: "How to read, publish, buy Coins, and behave on TipaTale.",
};

const SECTIONS = [
  { id: "getting-started", title: "1. Getting Started" },
  { id: "reading", title: "2. Reading & Following Stories" },
  { id: "coins", title: "3. Buying & Using Coins" },
  { id: "publishing", title: "4. Publishing Your Own Story" },
  { id: "tagging", title: "5. Tags & Mature Content" },
  { id: "community", title: "6. Community Conduct" },
  { id: "enforcement", title: "7. What Happens If You Break the Rules" },
];

export default function GuidelinesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="border-b border-hairline pb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">Guidelines</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">Using TipaTale</h1>
        <p className="mt-4 max-w-2xl font-sans text-base leading-relaxed text-ink-muted">
          Whether you&rsquo;re here to read, write, or both, this page covers the basics — how
          the site works, how Coins work, and what we expect from everyone in the community.
          For the legal fine print, see our{" "}
          <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:block">
          <div className="sticky top-8 rounded-xl border border-hairline bg-surface p-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">On this page</p>
            <ul className="mt-3 space-y-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="font-sans text-xs leading-relaxed text-ink-muted transition hover:text-accent">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 space-y-12 font-sans text-[15px] leading-relaxed text-ink-muted">
          <section id="getting-started">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-accent" />
              <h2 className="font-display text-xl font-bold text-ink">1. Getting Started</h2>
            </div>
            <p className="mt-3">
              Create a free account with your email or a supported third-party sign-in. Pick a
              username and, if you plan to publish, a pen name — this is the name readers will
              see on your books. From there you can start reading immediately; publishing tools
              unlock once your email is verified.
            </p>
          </section>

          <section id="reading">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-accent" />
              <h2 className="font-display text-xl font-bold text-ink">2. Reading & Following Stories</h2>
            </div>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Browse by genre from the homepage, or search for a title, author, or tag directly.</li>
              <li>Tap <strong className="text-ink">Follow</strong> on any book to get notified when a new chapter goes up, and to add it to your Library.</li>
              <li>Leave comments on individual chapters — this is one of the best ways to support a writer, even more than a rating.</li>
              <li>Rate and review completed books, or leave chapter-level reactions as you go.</li>
              <li>Use the mature content toggle in your settings to hide or show 18+ tagged stories in your browse feed.</li>
            </ul>
          </section>

          <section id="coins">
            <div className="flex items-center gap-2">
              <Coins size={18} className="text-accent" />
              <h2 className="font-display text-xl font-bold text-ink">3. Buying & Using Coins</h2>
            </div>
            <p className="mt-3">
              Coins are TipaTale&rsquo;s in-platform currency. You can buy them from your Coin
              balance (top navigation) in fixed packages using a card or your app store account.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Use Coins to unlock chapters that a writer has priced, or to tip any writer directly on a free chapter.</li>
              <li>Coins are added to your balance instantly after purchase.</li>
              <li><strong className="text-ink">All Coin purchases are final.</strong> We don&rsquo;t offer refunds or exchanges on Coins, spent or unspent, so double-check your package before confirming — see the full policy in our{" "}
                <Link href="/terms#coins" className="text-accent hover:underline">Terms of Service</Link>.
              </li>
              <li>If you&rsquo;re publishing, Coins spent on your chapters convert into Creator earnings — see the next section.</li>
            </ul>
          </section>

          <section id="publishing">
            <div className="flex items-center gap-2">
              <PenLine size={18} className="text-accent" />
              <h2 className="font-display text-xl font-bold text-ink">4. Publishing Your Own Story</h2>
            </div>
            <p className="mt-3">
              Anyone can publish on TipaTale. Head to your Creator dashboard and select{" "}
              <strong className="text-ink">New Book</strong> to get started.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Add a title, description, cover image, and genre tags — these are how readers find your story, so be specific.</li>
              <li>Publish chapters as you write them. There&rsquo;s no need to finish the whole book first; serialization is the whole point.</li>
              <li>Save a chapter as a draft to keep working on it privately, or publish it right away to your followers.</li>
              <li>Optionally price individual chapters in Coins, or leave everything free and rely on tips — it&rsquo;s your call.</li>
              <li>Track your reads, follows, and earnings from your Creator dashboard.</li>
              <li>Creator earnings are calculated at the end of each calendar month and paid out during the first week of the following month, once you&rsquo;re above the minimum payout threshold with valid payout details on file. Full details are in our{" "}
                <Link href="/terms#payouts" className="text-accent hover:underline">Terms of Service</Link>.
              </li>
            </ul>
          </section>

          <section id="tagging">
            <div className="flex items-center gap-2">
              <Tags size={18} className="text-accent" />
              <h2 className="font-display text-xl font-bold text-ink">5. Tags & Mature Content</h2>
            </div>
            <p className="mt-3">
              Accurate tagging keeps the platform usable for everyone. Tag your book&rsquo;s
              genre, and any content warnings that apply (violence, self-harm, sexual content,
              etc.).
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>If a chapter contains sexual content or graphic violence between adult characters, mark it as <strong className="text-ink">Mature</strong> before publishing — this restricts it to readers 18+.</li>
              <li>Sexual or suggestive content involving minors is never permitted, in any form, under any framing — including in text described as fictional. This is an absolute rule, not a tagging option.</li>
              <li>Mislabeling mature content (intentionally or repeatedly) may result in content removal or account restrictions.</li>
            </ul>
          </section>

          <section id="community">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-accent" />
              <h2 className="font-display text-xl font-bold text-ink">6. Community Conduct</h2>
            </div>
            <p className="mt-3">We want TipaTale to feel good to spend time in, for readers and writers alike. That means:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li><strong className="text-ink">Be respectful.</strong> Critique a story, don&rsquo;t attack the person who wrote it. Harassment, hate speech, and targeted abuse aren&rsquo;t tolerated.</li>
              <li><strong className="text-ink">Don&rsquo;t plagiarize.</strong> Only publish work you wrote or have the rights to publish. Copying another writer&rsquo;s work, on or off TipaTale, will get it taken down.</li>
              <li><strong className="text-ink">Use spoiler etiquette.</strong> Keep major plot spoilers out of public comments on recent chapters where possible.</li>
              <li><strong className="text-ink">No manipulation.</strong> Don&rsquo;t use bots, fake accounts, or coordinated groups to inflate reads, ratings, or Coin activity.</li>
              <li><strong className="text-ink">Report, don&rsquo;t retaliate.</strong> If you see a violation, use the Report link on the content or the{" "}
                <Link href="/report" className="text-accent hover:underline">Report a Problem</Link>{" "}
                page rather than escalating it yourself.
              </li>
            </ul>
          </section>

          <section id="enforcement">
            <h2 className="font-display text-xl font-bold text-ink">7. What Happens If You Break the Rules</h2>
            <p className="mt-3">
              Depending on the severity, violations of these guidelines can result in content
              removal, temporary restrictions (like losing publishing or commenting privileges),
              or permanent account termination. Severe violations — such as content sexualizing
              minors, or credible threats of violence — result in immediate termination and may
              be reported to law enforcement. For the full legal terms behind enforcement, see our{" "}
              <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}