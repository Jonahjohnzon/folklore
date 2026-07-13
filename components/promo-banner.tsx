// components/promo-banner.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { PromoBannerService, type PublicPromoBanner } from "@/app/services/PromoBannerService";

export function PromoBanner() {
  const [banners, setBanners] = useState<PublicPromoBanner[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    PromoBannerService.list()
      .then(({ data }) => setBanners(data.banners))
      .catch(() => {
        // No banners is a fine, silent state — this section just doesn't render.
      });
  }, []);

  if (banners.length === 0) return null;
  const banner = banners[index];

  function prev() {
    setIndex((i) => (i - 1 + banners.length) % banners.length);
  }
  function next() {
    setIndex((i) => (i + 1) % banners.length);
  }

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {banner.type === "announcement" ? (
        <AnnouncementBanner banner={banner} />
      ) : (
        <BooksBanner banner={banner} />
      )}

      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:scale-105 sm:left-4"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:scale-105 sm:right-4"
          >
            <ChevronRight size={18} />
          </button>
          <div className="mt-3 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setIndex(i)}
                aria-label={`Go to banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-accent" : "w-1.5 bg-hairline"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function BooksBanner({ banner }: { banner: PublicPromoBanner }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl pb-20 pt-10 transition-colors duration-500"
      style={{ backgroundColor: banner.bgColor }}
    >
      <div className="relative z-10 mx-auto max-w-xl px-10 text-center">
        <p className="relative inline-block font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
          <span className="block -rotate-2">{banner.heading}</span>
          {banner.accent && <span className="mt-1 block rotate-2 text-[1.1em]">{banner.accent}</span>}
          <Heart size={20} className="absolute -right-6 -top-2 -rotate-12 fill-pink-200 text-pink-200 opacity-90 sm:-right-8" />
          <Heart size={13} className="absolute -right-1 top-6 rotate-6 fill-pink-200 text-pink-200 opacity-80" />
        </p>
      </div>

      <svg className="absolute inset-x-0 bottom-0 h-28 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
        <path d="M0,64 C240,110 480,10 720,36 C960,62 1200,112 1440,58 L1440,120 L0,120 Z" fill={banner.waveColor} />
      </svg>

      <div className="relative z-10 mt-8 flex justify-center gap-3 overflow-x-auto px-8 pb-1 scrollbar-none sm:gap-4">
        {banner.books.map((book, i) => (
          <a
            key={book.title + i}
            href={book.href}
            className="group relative shrink-0 overflow-hidden rounded-md shadow-lg transition-transform duration-200 hover:-translate-y-2 hover:scale-[1.03]"
            style={{ transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 3}deg) translateY(${i % 3 === 1 ? 10 : 0}px)` }}
          >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.coverUrl}
                alt={book.title}
                className="h-36 w-24 object-cover sm:h-44 sm:w-28"
                loading="lazy"
              />
          </a>
        ))}
      </div>
    </div>
  );
}

// The entire banner is one click target — goes to a blog post, external
// article, or any in-app page, exactly the "click and it takes them to the
// blog or link I want" behavior. Internal paths use Link (client nav);
// anything else (external URLs) uses a plain <a>.
function AnnouncementBanner({ banner }: { banner: PublicPromoBanner }) {
  const isInternal = banner.linkUrl?.startsWith("/");
  const content = (
    <div
      className="relative flex min-h-48 items-center justify-center overflow-hidden rounded-3xl px-8 py-12 text-center transition-transform hover:scale-[1.01]"
      style={{ backgroundColor: banner.bgColor }}
    >
      {banner.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
        <img
          src={banner.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
      )}
      <div className="relative z-10 max-w-xl">
        <p className="font-heading text-3xl font-bold leading-tight text-white sm:text-4xl">
          <span className="block -rotate-1">{banner.heading}</span>
          {banner.accent && <span className="mt-1 block rotate-1 text-[1.1em]">{banner.accent}</span>}
        </p>
        {banner.linkLabel && (
          <span className="mt-5 inline-block rounded-full bg-white px-5 py-2 font-sans text-sm font-semibold text-ink">
            {banner.linkLabel}
          </span>
        )}
      </div>
    </div>
  );

  if (!banner.linkUrl) return content;

  return isInternal ? (
    <Link href={banner.linkUrl}>{content}</Link>
  ) : (
    <a href={banner.linkUrl} target={banner.openInNewTab ? "_blank" : undefined} rel={banner.openInNewTab ? "noopener noreferrer" : undefined}>
      {content}
    </a>
  );
}