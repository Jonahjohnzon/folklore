"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Send, Bot, User, LifeBuoy, Home } from "lucide-react";
import Link from "next/link";
interface FAQItem {
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    category: "Account",
    question: "How do I create a TipaTale account?",
    answer:
      "Tap Sign Up in the top right, then register with your email or a supported third-party account. You'll need to verify your email before you can publish or comment.",
  },
  {
    category: "Account",
    question: "How do I reset my password?",
    answer:
      "Go to the login page and select 'Forgot password?'. We'll send a reset link to the email on your account. If you don't see it, check your spam folder.",
  },
  {
    category: "Account",
    question: "Can I change my username or pen name?",
    answer:
      "Yes, from Settings → Profile. Your pen name (shown on your published books) can be changed at any time; your account username has a cooldown between changes.",
  },
  {
    category: "Coins & Payments",
    question: "How do I buy Coins?",
    answer:
      "Go to your Coin balance in the top navigation and select 'Buy Coins'. Choose a package and complete checkout through our payment provider. Coins are added to your balance instantly.",
  },
  {
    category: "Coins & Payments",
    question: "Can I get a refund on Coins?",
    answer:
      "Coin purchases are final and non-refundable, including unused Coins, as described in our Terms of Service. Please double check your package before confirming a purchase.",
  },
  {
    category: "Coins & Payments",
    question: "How do Creator payouts work?",
    answer:
      "Creators earn a share of Coins spent unlocking or tipping their chapters. Earnings from a calendar month are calculated after it closes and paid out during the first week of the following month, once you're above the minimum payout threshold and have valid payout details on file.",
  },
  {
    category: "Publishing",
    question: "How do I publish a story?",
    answer:
      "From your Creator dashboard, select 'New Book', fill in the title, description, cover, and genre tags, then add your first chapter. You can save chapters as drafts or publish them right away.",
  },
  {
    category: "Publishing",
    question: "How do I mark a chapter as mature content?",
    answer:
      "When editing a chapter, toggle 'Mature Content' before publishing. This restricts visibility to readers 18+ and keeps your story compliant with our guidelines.",
  },
  {
    category: "Publishing",
    question: "Can I lock chapters behind Coins?",
    answer:
      "Yes. When publishing a chapter, you can set a Coin price to unlock it. Readers can also tip you directly from your book page even on free chapters.",
  },
  {
    category: "Safety",
    question: "How do I report a book, comment, or user?",
    answer:
      "Use the Report link on any book, chapter, comment, or profile page, or go directly to our Report a Problem page. Our team reviews every report.",
  },
  {
    category: "Safety",
    question: "How do I block another user?",
    answer:
      "From their profile, tap the menu icon and select 'Block'. Blocked users can't message you, comment on your work, or see your activity.",
  },
];

const CATEGORIES = Array.from(new Set(FAQS.map((f) => f.category)));

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
}

const INITIAL_BOT_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "bot",
  text: "Hi! I'm the TipaTale help bot. Ask me about accounts, Coins, publishing, or reporting — or tell me what's going on and I'll point you in the right direction.",
};


const RULES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["refund"],
    reply:
      "Coin purchases are final and non-refundable — see the full policy under 'Coins & Payments' on our Terms of Service page. If something went wrong with the charge itself (like a duplicate charge), email support@tipatale.com.",
  },
  {
    keywords: ["payout", "earnings", "paid", "payment for my"],
    reply:
      "Creator payouts are calculated after each calendar month closes and sent out during the first week of the following month, once you're above the minimum threshold with valid payout details on file.",
  },
  {
    keywords: ["password", "log in", "login", "can't sign in", "locked out"],
    reply:
      "Reset your password from the login page using 'Forgot password?'. If the email doesn't arrive in a few minutes, check spam or email support@tipatale.com.",
  },
  {
    keywords: ["mature", "18+", "explicit content"],
    reply:
      "Toggle 'Mature Content' when editing a chapter, before publishing. This restricts it to readers 18+ and keeps your story compliant with our guidelines.",
  },
  {
    keywords: ["publish", "upload", "new book", "write a book", "how do i post"],
    reply:
      "Go to your Creator dashboard → New Book, add a title, description, cover, and genre tags, then add your first chapter. Chapters can be saved as drafts or published right away.",
  },
  {
    keywords: ["block", "harass", "abuse", "stalking"],
    reply:
      "You can block a user from their profile → menu icon → Block. For harassment or abuse, please also file a report at our Report a Problem page.",
  },
  {
    keywords: ["report", "flag", "copyright", "stolen"],
    reply:
      "You can report any book, chapter, comment, or user using the Report link on their page, or through our Report a Problem page. Our team reviews every report.",
  },
  {
    keywords: ["username", "pen name", "change my name"],
    reply:
      "Change your pen name (shown on published books) anytime from Settings → Profile. Your account username has a cooldown between changes.",
  },
  {
    keywords: ["buy coin", "purchase coin", "get coin", "coin package"],
    reply:
      "Go to your Coin balance in the top nav → 'Buy Coins' → pick a package → checkout. Coins are added instantly. Purchases are final and non-refundable.",
  },
  {
    keywords: ["coin"],
    reply:
      "Coins are TipaTale's currency for unlocking chapters and tipping writers. Buy them from your Coin balance in the top nav.",
  },
];

function getBotReply(input: string): string {
  const q = input.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => q.includes(kw))) return rule.reply;
  }
  return "I couldn't find an exact match for that. Try browsing the FAQ categories below, or email support@tipatale.com and our team will help directly.";
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, botTyping]);

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setBotTyping(true);

    // Simulated latency for the canned reply. Replace this block with a
    // real fetch("/api/support-chat", { ... }) call when a bot backend exists.
    setTimeout(() => {
      const reply: ChatMessage = { id: `b-${Date.now()}`, role: "bot", text: getBotReply(text) };
      setMessages((m) => [...m, reply]);
      setBotTyping(false);
    }, 700);
  }

  const visibleFaqs = FAQS.filter((f) => f.category === activeCategory);

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="border-b flex flex-col items-start border-hairline pb-8">
                      <Link
                        href="/"
                        replace
                        className="flex mb-5 items-center gap-1.5 rounded-full border border-hairline bg-bg px-3 py-3 font-sans text-xs font-medium text-ink transition hover:border-accent hover:text-accent"
                        aria-label="Back to home"
                      >
                        <Home size={20} />
                      </Link>
        <div className="flex items-center gap-2">
          <LifeBuoy size={16} className="text-accent" />
          <p className="font-sans text-xs font-semibold uppercase tracking-wide text-accent">Help Center</p>
        </div>
        <h1 className="mt-1 font-display text-4xl font-bold text-ink sm:text-5xl">How can we help?</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-relaxed text-ink-muted">
          Search the common questions below, or chat with our help bot for a quick pointer. For
          content or safety issues, use{" "}
          <a href="/report" className="text-accent hover:underline">Report a Problem</a> instead.
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* FAQ */}
        <section>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setOpenIndex(null);
                }}
                className={`rounded-full border px-3.5 py-1.5 font-sans text-xs font-medium transition ${
                  activeCategory === cat
                    ? "border-accent bg-accent text-accent-ink shadow-sm"
                    : "border-hairline bg-bg text-ink hover:border-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mt-5 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline bg-surface">
            {visibleFaqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={faq.question}>
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-bg"
                  >
                    <span className="font-sans text-sm font-semibold text-ink">{faq.question}</span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-ink-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4">
                      <p className="font-sans text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-6 font-sans text-sm text-ink-muted">
            Still stuck? Email us at{" "}
            <a href="mailto:support@tipatale.com" className="text-accent hover:underline">support@tipatale.com</a>{" "}
            or use the{" "}
            <a href="/contact" className="text-accent hover:underline">Contact page</a>.
          </p>
        </section>

        {/* Chat widget */}
        <section className="flex h-[560px] flex-col overflow-hidden rounded-xl border border-hairline bg-surface shadow-sm">
          <div className="flex items-center gap-2 border-b border-hairline bg-bg px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Bot size={16} />
            </div>
            <div>
              <p className="font-sans text-sm font-semibold text-ink">TipaTale Help Bot</p>
              <p className="font-sans text-[11px] text-ink-muted">Usually replies instantly</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div key={m.id} className={`flex items-end gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <Bot size={12} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 font-sans text-sm leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-accent text-accent-ink"
                      : "rounded-bl-sm border border-hairline bg-bg text-ink"
                  }`}
                >
                  {m.text}
                </div>
                {m.role === "user" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-hairline text-ink-muted">
                    <User size={12} />
                  </div>
                )}
              </div>
            ))}
            {botTyping && (
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Bot size={12} />
                </div>
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-hairline bg-bg px-3.5 py-2.5">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-muted" />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-hairline p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-full border border-hairline bg-bg px-4 py-2 font-sans text-sm text-ink outline-none transition placeholder:text-ink-muted/60 focus:border-accent"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send size={14} />
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}