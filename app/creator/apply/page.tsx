"use client";
import Link from "next/link";
import { useState } from "react";
import { useSnapshot } from "valtio";
import { Feather, Coins, LayoutDashboard, Users } from "lucide-react";
import { store } from "@/app/store/userStore";
import { UserService } from "@/app/services/user.service";
import { CreatorCongratsModal } from "@/components/creator-congrats-modal";

const BENEFITS = [
  {
    icon: Feather,
    title: "Publish freely",
    body: "Post chapters as you write them — no queue, no waiting on review.",
  },
  {
    icon: Coins,
    title: "Earn from readers",
    body: "Lock chapters behind coins and set your own pace for paid releases.",
  },
  {
    icon: LayoutDashboard,
    title: "A dashboard built for writers",
    body: "Track reads, follows, and earnings for every story in one place.",
  },
  {
    icon: Users,
    title: "Reach real readers",
    body: "Your stories surface in Browse the moment you publish.",
  },
];

export default function BecomeCreatorPage() {
  const snap = useSnapshot(store);
  const alreadyCreator = snap.creatorStatus === "active";

  const [penName, setPenName] = useState(snap.displayName || "");
  const [bio, setBio] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!penName.trim() || !agreed) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await UserService.applyCreator({
        penName: penName.trim(),
        bio: bio.trim() || undefined,
      });

      store.penName = res.data.user.penName;
      store.creatorStatus = res.data.user.creatorStatus;
      store.creatorActivatedAt = res.data.user.creatorActivatedAt;
      if (res.data.user.bio) store.bio = res.data.user.bio;

      setShowCongrats(true);
    } catch (err) {
      setError(typeof err === "string" ? err : "Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (alreadyCreator && !showCongrats) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-ink">
          <Feather size={22} />
        </div>
        <h1 className="mt-5 font-display text-2xl font-semibold text-ink">
          You&apos;re already a creator
        </h1>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          Head to your dashboard to publish and manage your stories.
        </p>
        <Link
        href="/dashboard"
        replace
        className="mt-6 cursor-pointer rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-70"
        >
        Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-accent">
          Creator program
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          Every story starts with a name.
        </h1>
        <p className="mt-4 font-sans text-base text-ink-muted">
          Choose the name your readers will know you by, and start publishing on Lore today.
          Approval is instant — there&apos;s no waitlist.
        </p>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* Benefits */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {BENEFITS.map((b) => (
            <div key={b.title} className="flex gap-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <b.icon size={16} />
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-ink">{b.title}</p>
                <p className="mt-0.5 font-sans text-sm text-ink-muted">{b.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-hairline bg-surface-raised p-6 sm:p-8"
        >
          <div>
            <label htmlFor="penName" className="font-sans text-sm font-semibold text-ink">
              Pen name
            </label>
            <input
              id="penName"
              value={penName}
              onChange={(e) => setPenName(e.target.value)}
              placeholder="How readers will see your name"
              maxLength={40}
              className="mt-2 w-full rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>

          <div className="mt-5">
            <label htmlFor="bio" className="font-sans text-sm font-semibold text-ink">
              Creator bio <span className="font-normal text-ink-muted">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A line readers will see on your profile"
              maxLength={280}
              rows={3}
              className="mt-2 w-full resize-none rounded-lg border border-hairline bg-bg px-3.5 py-2.5 font-sans text-sm text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none"
            />
          </div>

          <label className="mt-5 flex items-start gap-2.5 font-sans text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-hairline accent-(--accent,var(--color-accent))"
            />
            I agree to Lore&apos;s creator guidelines and content policy.
          </label>

          {error && <p className="mt-3 font-sans text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={!penName.trim() || !agreed || submitting}
            className="mt-6 w-full rounded-full cursor-pointer bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Setting things up…" : "Become a creator"}
          </button>
        </form>
      </div>

      {showCongrats && (
        <CreatorCongratsModal
          penName={penName.trim()}
          onClose={() => setShowCongrats(false)}
        />
      )}
    </div>
  );
}