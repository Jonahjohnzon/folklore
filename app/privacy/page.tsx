import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How TipaTale collects, uses, and protects your information.",
};

const LAST_UPDATED = "July 10, 2026";

const SECTIONS = [
  { id: "overview", title: "1. Overview" },
  { id: "collect", title: "2. Information We Collect" },
  { id: "use", title: "3. How We Use Information" },
  { id: "sharing", title: "4. How We Share Information" },
  { id: "payments", title: "5. Payments & Coins Data" },
  { id: "cookies", title: "6. Cookies & Similar Technologies" },
  { id: "retention", title: "7. Data Retention" },
  { id: "rights", title: "8. Your Rights & Choices" },
  { id: "children", title: "9. Children's Privacy" },
  { id: "security", title: "10. Security" },
  { id: "international", title: "11. International Transfers" },
  { id: "changes", title: "12. Changes to this Policy" },
  { id: "contact", title: "13. Contact" },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="border-b border-hairline pb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">Legal</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">Privacy Policy</h1>
        <p className="mt-3 font-sans text-sm text-ink-muted">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
          This Privacy Policy explains how TipaTale (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) collects, uses, discloses, and protects information when you use
          TipaTale (the &ldquo;Service&rdquo;). It should be read together with our{" "}
          <a href="/terms" className="text-accent hover:underline">Terms of Service</a>.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <nav className="hidden lg:block">
          <div className="sticky top-8 rounded-xl border border-hairline bg-surface p-4">
            <p className="font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">On this page</p>
            <ul className="mt-3 space-y-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="font-sans text-xs leading-relaxed text-ink-muted transition hover:text-accent"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 space-y-10 font-sans text-[15px] leading-relaxed text-ink-muted">
          <section id="overview">
            <h2 className="font-display text-xl font-bold text-ink">1. Overview</h2>
            <p className="mt-3">
              TipaTale is a platform for reading and publishing serialized fiction. To operate
              the Service — including accounts, Coins, and Creator payouts — we need to collect
              and process certain information about you. This policy explains what we collect,
              why, and the choices available to you.
            </p>
          </section>

          <section id="collect">
            <h2 className="font-display text-xl font-bold text-ink">2. Information We Collect</h2>
            <p className="mt-3 font-semibold text-ink">Information you provide to us:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Account information: username, email address, password (stored hashed), and optional profile details like pen name, bio, and avatar.</li>
              <li>Content you post: chapters, book descriptions, cover images, comments, reviews, and messages.</li>
              <li>Payment-related information: purchase history and, for Creators, payout details (such as bank account or third-party payout account identifiers) needed to send earnings.</li>
              <li>Communications: anything you send us, such as support requests or copyright notices.</li>
            </ul>
            <p className="mt-4 font-semibold text-ink">Information collected automatically:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>Usage data: pages viewed, chapters read, reading progress, time spent, clicks, and search queries within the Service.</li>
              <li>Device and log data: IP address, browser type, operating system, device identifiers, and approximate location derived from IP address.</li>
              <li>Cookies and similar technologies, described in Section 6.</li>
            </ul>
            <p className="mt-4 font-semibold text-ink">Information from third parties:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5">
              <li>If you sign up or log in using a third-party account (such as Google or Apple), we receive basic profile information from that provider as permitted by your settings with them.</li>
              <li>Payment processors and app stores share limited transaction data with us (e.g. confirmation that a purchase succeeded), but not your full card number.</li>
            </ul>
          </section>

          <section id="use">
            <h2 className="font-display text-xl font-bold text-ink">3. How We Use Information</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>To provide, maintain, and improve the Service, including personalized recommendations;</li>
              <li>To process Coin purchases and calculate and issue Creator payouts;</li>
              <li>To communicate with you, including service updates, security alerts, and support responses;</li>
              <li>To detect, investigate, and prevent fraud, abuse, coin manipulation, and violations of our Terms;</li>
              <li>To comply with legal obligations, including tax reporting for Creator earnings where required;</li>
              <li>To send marketing communications, where permitted, which you can opt out of at any time.</li>
            </ul>
          </section>

          <section id="sharing">
            <h2 className="font-display text-xl font-bold text-ink">4. How We Share Information</h2>
            <p className="mt-3">We do not sell your personal information. We share information only in these circumstances:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li><strong className="text-ink">Public by design:</strong> your username, pen name, published stories, comments, and public profile are visible to other users, since TipaTale is a public reading platform.</li>
              <li><strong className="text-ink">Service providers:</strong> payment processors, cloud hosting, email delivery, and analytics vendors who process data on our behalf under contractual confidentiality and security obligations.</li>
              <li><strong className="text-ink">Legal reasons:</strong> when required to comply with law, enforce our Terms, or protect the rights, property, or safety of TipaTale, our users, or the public.</li>
              <li><strong className="text-ink">Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, subject to standard confidentiality protections.</li>
            </ul>
          </section>

          <section id="payments">
            <h2 className="font-display text-xl font-bold text-ink">5. Payments & Coins Data</h2>
            <p className="mt-3">
              Coin purchases are processed by third-party payment providers (such as Stripe,
              Apple, or Google, depending on how you access the Service). We receive confirmation
              of your purchase and your Coin balance, but do not store your full payment card
              details. Creator payout information (such as bank details) is collected solely to
              send you earnings and is handled under appropriate security controls; see our{" "}
              <a href="/terms#coins" className="text-accent hover:underline">Terms</a> for details
              on how Coins and payouts work.
            </p>
          </section>

          <section id="cookies">
            <h2 className="font-display text-xl font-bold text-ink">6. Cookies & Similar Technologies</h2>
            <p className="mt-3">
              We use cookies and similar technologies to keep you signed in, remember your
              preferences (like content filters), understand how the Service is used, and measure
              the effectiveness of our marketing. You can control cookies through your browser
              settings; disabling some cookies may affect Service functionality, such as staying
              logged in.
            </p>
          </section>

          <section id="retention">
            <h2 className="font-display text-xl font-bold text-ink">7. Data Retention</h2>
            <p className="mt-3">
              We retain account and content data for as long as your account is active, and for a
              reasonable period afterward to comply with legal, tax, and accounting obligations,
              resolve disputes, and enforce our agreements. Published stories and comments may
              remain visible after account deletion if other users have interacted with them,
              unless you request removal, subject to Section 8.
            </p>
          </section>

          <section id="rights">
            <h2 className="font-display text-xl font-bold text-ink">8. Your Rights & Choices</h2>
            <p className="mt-3">
              Depending on where you live, you may have rights to access, correct, delete, or
              export your personal information, and to object to or restrict certain processing.
              You can exercise many of these directly from your account settings, or by
              contacting us at{" "}
              <a href="mailto:privacy@tipatale.com" className="text-accent hover:underline">privacy@tipatale.com</a>.
              We will respond to verified requests within the timeframe required by applicable
              law. You may also unsubscribe from marketing emails using the link in any such
              email.
            </p>
          </section>

          <section id="children">
            <h2 className="font-display text-xl font-bold text-ink">9. Children&rsquo;s Privacy</h2>
            <p className="mt-3">
              TipaTale is not directed at children under 13, and we do not knowingly collect
              personal information from children under 13. If you believe a child under 13 has
              created an account, contact us at{" "}
              <a href="mailto:privacy@tipatale.com" className="text-accent hover:underline">privacy@tipatale.com</a>{" "}
              and we will take appropriate action, including deleting the account.
            </p>
          </section>

          <section id="security">
            <h2 className="font-display text-xl font-bold text-ink">10. Security</h2>
            <p className="mt-3">
              We use industry-standard technical and organizational measures, including
              encryption in transit and hashed password storage, to protect your information.
              However, no method of transmission or storage is completely secure, and we cannot
              guarantee absolute security.
            </p>
          </section>

          <section id="international">
            <h2 className="font-display text-xl font-bold text-ink">11. International Transfers</h2>
            <p className="mt-3">
              We may process and store information in countries other than the one you live in.
              Where required, we use appropriate safeguards (such as standard contractual
              clauses) to protect information transferred internationally.
            </p>
          </section>

          <section id="changes">
            <h2 className="font-display text-xl font-bold text-ink">12. Changes to this Policy</h2>
            <p className="mt-3">
              We may update this Privacy Policy from time to time. Material changes will be
              announced through the Service or by email, and the &ldquo;Last updated&rdquo; date
              above will be revised accordingly.
            </p>
          </section>

          <section id="contact">
            <h2 className="font-display text-xl font-bold text-ink">13. Contact</h2>
            <p className="mt-3">
              Questions about this Privacy Policy or your data can be sent to{" "}
              <a href="mailto:privacy@tipatale.com" className="text-accent hover:underline">privacy@tipatale.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}