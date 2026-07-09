// components/reader-swipe-onboarding.tsx
"use client";
import { useEffect, useState } from "react";

export function SwipeOnboardingHint({ visible, onDismiss }: { visible: boolean; onDismiss: () => void }) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    setShow(visible);
    if (!visible) return;
    const t = setTimeout(() => {
      setShow(false);
      onDismiss();
    }, 2600);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-opacity duration-500 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[1px]" />
      <div className="relative flex flex-col items-center gap-3">
        <div className="relative h-14 w-24 overflow-hidden">
          <SwipeHandIcon className="swipe-hint-hand absolute left-0 top-0 h-14 w-14 text-white drop-shadow" />
        </div>
        <p className="rounded-full bg-black/50 px-4 py-1.5 font-sans text-xs font-medium text-white">
          Swipe to turn the page
        </p>
      </div>

      <style jsx>{`
        .swipe-hint-hand {
          animation: swipe-hint-move 1.4s ease-in-out infinite;
        }
        @keyframes swipe-hint-move {
          0% { transform: translateX(28px); opacity: 0; }
          15% { opacity: 1; }
          55% { transform: translateX(-8px); opacity: 1; }
          75% { opacity: 0; }
          100% { transform: translateX(-8px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

function SwipeHandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M13 11V5.5a1.5 1.5 0 0 0-3 0V12M10 12V4a1.5 1.5 0 0 0-3 0v9M7 13V7a1.5 1.5 0 0 0-3 0v7c0 4 2.5 7 7 7h1c4 0 6-2.5 6-6v-3a1.5 1.5 0 0 0-3 0"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}