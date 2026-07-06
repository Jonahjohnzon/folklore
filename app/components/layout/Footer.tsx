import Link from "next/link";

const LINKS = {
  Discover: ["Browse all genres", "New releases", "Top charts", "Editor's picks", "Completed stories"],
  Write:    ["Start writing", "Writer resources", "Monetization", "Creator program", "Analytics"],
  Company:  ["About Lore", "Careers", "Press", "Blog", "Investors"],
  Support:  ["Help centre", "Guidelines", "Privacy policy", "Terms of service", "Cookie settings"],
};

export function Footer() {
  return (
    <footer className="bg-ink text-page mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {Object.entries(LINKS).map(([col, links]) => (
            <div key={col}>
              <p className="text-2xs uppercase tracking-widest2 text-ink-faint font-semibold mb-4">
                {col}
              </p>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <Link
                      href="#"
                      className="text-xs text-white/60 hover:text-white transition-colors"
                    >
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
          <span className="font-serif text-xl font-black text-white tracking-tighter">Lore</span>
          <p className="text-2xs text-white/30 text-center">
            © 2026 Lore Publishing Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["𝕏", "Instagram", "Discord"].map((s) => (
              <Link key={s} href="#" className="text-2xs text-white/40 hover:text-white transition-colors">
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}