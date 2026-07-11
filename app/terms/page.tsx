import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of TipaTale.",
};

const LAST_UPDATED = "July 10, 2026";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of these Terms" },
  { id: "eligibility", title: "2. Eligibility" },
  { id: "accounts", title: "3. Your Account" },
  { id: "content-license", title: "4. Your Content & the License You Grant Us" },
  { id: "conduct", title: "5. Acceptable Use" },
  { id: "mature-content", title: "6. Mature Content" },
  { id: "coins", title: "7. Coins & Payments" },
  { id: "payouts", title: "8. Creator Earnings & Payouts" },
  { id: "ip", title: "9. Intellectual Property & Copyright Complaints" },
  { id: "termination", title: "10. Suspension & Termination" },
  { id: "disclaimers", title: "11. Disclaimers" },
  { id: "liability", title: "12. Limitation of Liability" },
  { id: "indemnification", title: "13. Indemnification" },
  { id: "disputes", title: "14. Governing Law & Disputes" },
  { id: "changes", title: "15. Changes to these Terms" },
  { id: "contact", title: "16. Contact" },
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="border-b border-hairline pb-8">
        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">Legal</p>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">Terms of Service</h1>
        <p className="mt-3 font-sans text-sm text-ink-muted">Last updated: {LAST_UPDATED}</p>
        <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of TipaTale
          (the &ldquo;Service&rdquo;), operated by TipaTale (&ldquo;TipaTale,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By creating an account or otherwise using the
          Service, you agree to be bound by these Terms. If you do not agree, do not use the
          Service.
        </p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
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

        {/* Body */}
        <div className="min-w-0 space-y-10 font-sans text-[15px] leading-relaxed text-ink-muted">
          <section id="acceptance">
            <h2 className="font-display text-xl font-bold text-ink">1. Acceptance of these Terms</h2>
            <p className="mt-3">
              These Terms form a binding legal agreement between you and TipaTale. They apply to
              all visitors, registered users, readers, and writers (&ldquo;Creators&rdquo;) who use
              the Service, including our website and any mobile applications. Our{" "}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>{" "}
              is incorporated into these Terms by reference.
            </p>
          </section>

          <section id="eligibility">
            <h2 className="font-display text-xl font-bold text-ink">2. Eligibility</h2>
            <p className="mt-3">
              You must be at least 13 years old to create an account. If you are under 18 (or the
              age of legal majority in your jurisdiction), you may only use the Service under the
              supervision of a parent or legal guardian who agrees to these Terms on your behalf.
              Access to books or chapters marked as Mature Content is restricted to users who are
              18 or older, or the age of majority in their jurisdiction, whichever is higher. By
              using the Service you represent that you meet these requirements.
            </p>
          </section>

          <section id="accounts">
            <h2 className="font-display text-xl font-bold text-ink">3. Your Account</h2>
            <p className="mt-3">
              You are responsible for maintaining the confidentiality of your account credentials
              and for all activity that occurs under your account. Notify us immediately at{" "}
              <a href="mailto:support@tipatale.com" className="text-accent hover:underline">support@tipatale.com</a>{" "}
              if you suspect unauthorized use of your account. You agree to provide accurate
              information when registering and to keep it up to date. We may suspend or terminate
              accounts that provide false information or violate these Terms.
            </p>
          </section>

          <section id="content-license">
            <h2 className="font-display text-xl font-bold text-ink">4. Your Content & the License You Grant Us</h2>
            <p className="mt-3">
              You retain full ownership of the stories, chapters, cover art, comments, and any
              other content you post to TipaTale (&ldquo;User Content&rdquo;). We do not claim
              ownership over your work.
            </p>
            <p className="mt-3">
              By posting User Content, you grant TipaTale a worldwide, non-exclusive,
              royalty-free, sublicensable license to host, store, reproduce, display, distribute,
              and perform that content solely for the purpose of operating, promoting, and
              improving the Service — for example, displaying your book on the site and apps,
              generating previews, or featuring it in promotional placements within TipaTale. This
              license ends when you remove the content or delete your account, except to the
              extent copies reasonably persist in backups or as required by law.
            </p>
            <p className="mt-3">
              You are solely responsible for your User Content and confirm that you have the
              rights necessary to post it, and that it does not infringe any third party&rsquo;s
              copyright, trademark, privacy, or other rights.
            </p>
          </section>

          <section id="conduct">
            <h2 className="font-display text-xl font-bold text-ink">5. Acceptable Use</h2>
            <p className="mt-3">You agree not to use the Service to:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Post content that is unlawful, defamatory, or infringes someone else&rsquo;s intellectual property rights;</li>
              <li>Post sexual content involving minors, in any form — this is never permitted, regardless of framing;</li>
              <li>Harass, threaten, dox, or incite violence against any person or group;</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation;</li>
              <li>Upload malware, scrape the Service at scale, or attempt to bypass rate limits or access controls;</li>
              <li>Manipulate reads, ratings, comments, or coin transactions through bots, fake accounts, or coordinated activity;</li>
              <li>Circumvent paywalls, coin-gated chapters, or DRM by unauthorized technical means.</li>
            </ul>
            <p className="mt-3">
              We may remove content or restrict accounts that violate this section, with or
              without notice, at our discretion.
            </p>
          </section>

          <section id="mature-content">
            <h2 className="font-display text-xl font-bold text-ink">6. Mature Content</h2>
            <p className="mt-3">
              TipaTale permits certain mature themes (including violence and sexual content
              between adult characters) when properly tagged, subject to our content guidelines.
              Content sexualizing minors is strictly prohibited under any circumstances and will
              result in immediate account termination and may be reported to law enforcement.
              Readers may opt to hide mature content in their browsing settings.
            </p>
          </section>

          <section id="coins">
            <h2 className="font-display text-xl font-bold text-ink">7. Coins & Payments</h2>
            <p className="mt-3">
              TipaTale offers &ldquo;Coins,&rdquo; a virtual currency you may purchase with real
              money to unlock chapters, tip Creators, or access other paid features on the
              Service.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Coins have no cash value and cannot be exchanged, redeemed, or refunded for cash, except where required by applicable law.</li>
              <li>Coins are non-transferable between accounts and may not be sold, gifted, or resold outside the Service.</li>
              <li><strong className="text-ink">All Coin purchases are final and non-refundable.</strong> Once a purchase is completed, we do not offer refunds or exchanges, including for unused Coins, accidental purchases, or Coins spent on content you did not enjoy. Please review your purchase carefully before confirming.</li>
              <li>This no-refund policy does not affect any statutory rights you may have under the mandatory consumer protection laws of your jurisdiction that cannot be waived by agreement.</li>
              <li>We may offer promotional or bonus Coins at our discretion; these are subject to expiration and additional terms disclosed at the time they are granted.</li>
              <li>Coins are processed through third-party payment providers (such as app store billing or card processors). Your payment information is handled by those providers subject to their own terms; TipaTale does not store full card numbers.</li>
              <li>We may adjust Coin pricing, packages, or the Coin cost of unlocking content at any time. Changes do not affect Coins you already own.</li>
              <li>If your account is suspended or terminated for violating these Terms, any unused Coins may be forfeited.</li>
            </ul>
          </section>

          <section id="payouts">
            <h2 className="font-display text-xl font-bold text-ink">8. Creator Earnings & Payouts</h2>
            <p className="mt-3">
              Creators may earn a share of the Coins that readers spend unlocking their chapters
              or tipping them directly, in accordance with the revenue share rate published in
              your Creator dashboard, which may vary by content type and may change from time to
              time with notice.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>
                <strong className="text-ink">Payout schedule.</strong> Earnings accrued during a
                calendar month are calculated after that month closes and are paid out during the
                first week of the following calendar month, provided your account meets the
                minimum payout threshold and has valid, verified payout details on file.
              </li>
              <li>
                If your balance is below the minimum payout threshold, it rolls over and is
                included in the following month&rsquo;s payout calculation.
              </li>
              <li>
                Payouts are sent via the payout method you configure in your Creator settings
                (e.g. bank transfer or supported third-party payment provider). Processing times
                after we initiate payment depend on your bank or provider and are outside our
                control.
              </li>
              <li>
                You are solely responsible for reporting and paying any taxes owed on your
                earnings in your jurisdiction. We may be required to collect tax information (such
                as a W-9, W-8BEN, or local equivalent) before releasing payouts, and may withhold
                or delay payment until valid information is provided.
              </li>
              <li>
                We may withhold or reverse payouts associated with fraudulent activity, coin
                manipulation, chargebacks, or violations of these Terms, and may require
                repayment of amounts paid in error.
              </li>
            </ul>
          </section>

          <section id="ip">
            <h2 className="font-display text-xl font-bold text-ink">9. Intellectual Property & Copyright Complaints</h2>
            <p className="mt-3">
              TipaTale respects intellectual property rights and expects the same from our users.
              If you believe content on TipaTale infringes your copyright, send a notice to{" "}
              <a href="mailto:copyright@tipatale.com" className="text-accent hover:underline">copyright@tipatale.com</a>{" "}
              including: (a) identification of the copyrighted work; (b) the URL or location of
              the allegedly infringing content; (c) your contact information; (d) a statement of
              good-faith belief that the use is unauthorized; and (e) a statement, under penalty
              of perjury, that the notice is accurate and that you are authorized to act on behalf
              of the rights holder. We will respond in accordance with applicable law and may
              remove content and/or terminate repeat infringers&rsquo; accounts.
            </p>
          </section>

          <section id="termination">
            <h2 className="font-display text-xl font-bold text-ink">10. Suspension & Termination</h2>
            <p className="mt-3">
              You may delete your account at any time from your account settings. We may suspend
              or terminate your access to the Service, with or without notice, if we believe you
              have violated these Terms, created risk or legal exposure for us, or for any other
              reason at our discretion, including extended inactivity. Sections of these Terms
              that by their nature should survive termination (including Coins, Payouts,
              Disclaimers, Limitation of Liability, and Disputes) will survive.
            </p>
          </section>

          <section id="disclaimers">
            <h2 className="font-display text-xl font-bold text-ink">11. Disclaimers</h2>
            <p className="mt-3">
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without
              warranties of any kind, whether express or implied, including implied warranties of
              merchantability, fitness for a particular purpose, and non-infringement. We do not
              warrant that the Service will be uninterrupted, secure, or error-free, or that any
              User Content is accurate or reliable. Content posted by Creators reflects the views
              of those Creators, not TipaTale.
            </p>
          </section>

          <section id="liability">
            <h2 className="font-display text-xl font-bold text-ink">12. Limitation of Liability</h2>
            <p className="mt-3">
              To the maximum extent permitted by law, TipaTale and its officers, employees, and
              partners will not be liable for any indirect, incidental, special, consequential, or
              punitive damages, or any loss of profits, revenue, data, or goodwill, arising from
              your use of the Service. Our total aggregate liability for any claim arising out of
              or relating to these Terms or the Service will not exceed the greater of (a) the
              amount you paid us in the twelve months preceding the claim, or (b) $100 USD.
              Nothing in these Terms limits liability that cannot be limited under applicable law.
            </p>
          </section>

          <section id="indemnification">
            <h2 className="font-display text-xl font-bold text-ink">13. Indemnification</h2>
            <p className="mt-3">
              You agree to indemnify and hold harmless TipaTale from any claims, damages, losses,
              and expenses (including reasonable legal fees) arising from your User Content, your
              violation of these Terms, or your violation of any rights of a third party.
            </p>
          </section>

          <section id="disputes">
            <h2 className="font-display text-xl font-bold text-ink">14. Governing Law & Disputes</h2>
            <p className="mt-3">
              These Terms are governed by the laws of the jurisdiction in which TipaTale is
              incorporated, without regard to conflict-of-law principles, except where mandatory
              local consumer protection law provides otherwise. Any dispute arising out of these
              Terms will first be attempted to be resolved informally by contacting{" "}
              <a href="mailto:support@tipatale.com" className="text-accent hover:underline">support@tipatale.com</a>.
              {" "}
              <em>[Placeholder — insert your company&rsquo;s actual jurisdiction, arbitration
              clause, and venue here before publishing; this varies significantly by country and
              should be set by counsel.]</em>
            </p>
          </section>

          <section id="changes">
            <h2 className="font-display text-xl font-bold text-ink">15. Changes to these Terms</h2>
            <p className="mt-3">
              We may update these Terms from time to time. If we make material changes, we will
              notify you by posting the updated Terms with a new &ldquo;Last updated&rdquo; date
              and, where appropriate, through the Service or by email. Continued use of the
              Service after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section id="contact">
            <h2 className="font-display text-xl font-bold text-ink">16. Contact</h2>
            <p className="mt-3">
              Questions about these Terms can be sent to{" "}
              <a href="mailto:support@tipatale.com" className="text-accent hover:underline">support@tipatale.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}