// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingCarousel } from "@/components/trending-carousel";
import { BookRail } from "@/components/book-rail";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeService, type HomeFeed } from "@/app/services/HomeService";
import { InterestPicker } from "@/components/interest-picker";
import { ContinueReadingBanner } from "@/components/continue-reading-banner";
import { HomeSkeleton } from "@/components/home-skeleton";
import { SignalService } from "@/app/services/SignalService"; // ← add this import
import { ScrollToTop } from "@/components/scroll-to-top";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
const GENRES = [ "Mystery", "Horror", "Drama","Adventure", "Historical", "Slice of Life", "LitRPG", "Poetry"];

export default function HomePage() {
  const [feed, setFeed] = useState<HomeFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    HomeService.getFeed()
      .then(({ data }) => {
        setFeed(data);
        setShowOnboarding(data.needsOnboarding);
      })
      .catch(() => setFeed(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main>
      <ScrollToTop />
      <Navbar />
      <EmailVerificationBanner/>
      {feed?.continueReading && <ContinueReadingBanner item={feed.continueReading} />}

      {showOnboarding && (
        <InterestPicker
          onDone={() => {
            setShowOnboarding(false);
            // interests just changed — recommendations won't reflect them until
            // the next batch run, but re-fetching keeps continueReading etc. fresh
            HomeService.getFeed().then(({ data }) => setFeed(data));
          }}
        />
      )}

      {loading && <HomeSkeleton />}

      {!loading && feed && (
        <>
          <TrendingCarousel books={feed.trending} />

          <div className="border-b border-hairline">
            <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto scrollbar-none px-4 py-4 sm:px-6">
              {GENRES.map((g) => (
                <Link
                  key={g}
                  href={`/browse/${g.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() =>
                    SignalService.log("tag_clicked", { payload: { tagSlug: g.toLowerCase().replace(/\s+/g, "-"), tagName: g } })
                  }
                  className="shrink-0 rounded-full border border-hairline bg-surface px-3.5 py-1.5 font-sans text-sm font-medium text-ink-muted transition hover:border-accent hover:text-accent"
                >
                  {g}
                </Link>
              ))}
            </div>
          </div>

          <BookRail
            title={feed.personalizedIsFallback ? "Trending this week" : "Picked for you"}
            subtitle={feed.personalizedIsFallback ? "The stories everyone's talking about" : "Based on what you've been reading"}
            books={feed.personalized}
            href={feed.personalizedIsFallback ? "/browse/trending" : undefined}
            rank={feed.personalizedIsFallback}
          />

          <BookRail title="Fresh chapters" subtitle="Recently updated" books={feed.newReleases} href="/browse/new" />
          <BookRail title="Fantasy worlds to get lost in" books={feed.fantasy} href="/browse/fantasy" />
          <BookRail title="Swoon-worthy romance" books={feed.romance} href="/browse/romance" />
        </>
      )}

      {!loading && <Footer />}
    </main>
  );
}