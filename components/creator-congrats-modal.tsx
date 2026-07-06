"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Feather } from "lucide-react";

interface CreatorCongratsModalProps {
  penName: string;
  onClose: () => void;
}

const PIECE_COUNT = 36;
const COLORS = ["bg-accent", "bg-gold", "bg-accent/60"];

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotateStart: number;
  rotateEnd: number;
  color: string;
  width: number;
}

function createPieces(): ConfettiPiece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2.4 + Math.random() * 1.4,
    rotateStart: Math.random() * 360,
    rotateEnd: Math.random() * 720 - 360,
    color: COLORS[i % COLORS.length],
    width: 5 + Math.random() * 4,
  }));
}

function ConfettiField() {
  // Generated client-side, after mount — never during render, and never on the server.
  const [pieces, setPieces] = useState<ConfettiPiece[] | null>(null);

  useEffect(() => {
    setPieces(createPieces());
  }, []);

  if (!pieces) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={`absolute top-[-10%] rounded-[1px] ${p.color}`}
          style={
            {
              left: `${p.left}%`,
              width: p.width,
              height: p.width * 2.4,
              transform: `rotate(${p.rotateStart}deg)`,
              animation: `confetti-fall ${p.duration}s ${p.delay}s ease-in forwards`,
              "--rotate-end": `${p.rotateEnd}deg`,
            } as React.CSSProperties
          }
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          to {
            top: 110%;
            transform: rotate(var(--rotate-end));
          }
        }
      `}</style>
    </div>
  );
}

export function CreatorCongratsModal({ penName, onClose }: CreatorCongratsModalProps) {
  const router = useRouter();
  const [sealVisible, setSealVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSealVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-ink/30 backdrop-blur-sm">
      <ConfettiField />

      <div className="relative mx-4 flex w-full max-w-md flex-col items-center overflow-hidden rounded-2xl border border-hairline bg-surface-raised p-8 text-center shadow-2xl">
        <div
          className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-accent-ink transition-all duration-500"
          style={{
            transform: sealVisible ? "scale(1)" : "scale(0.4)",
            opacity: sealVisible ? 1 : 0,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <Feather size={26} />
        </div>

        <p className="font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Your seal is set
        </p>
        <h2 className="mt-1.5 font-display text-2xl font-semibold text-ink">
          Welcome, {penName}
        </h2>
        <p className="mt-2 font-sans text-sm text-ink-muted">
          {"You're a creator on Lore now. Your dashboard, drafts, and readers are waiting."}
        </p>

      <button
        onClick={() => {
          onClose();
          router.replace("/dashboard");
        }}
        className="mt-6 w-full cursor-pointer rounded-full bg-accent px-4 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-70"
      >
        Go to your dashboard
      </button>
      </div>
    </div>
  );
}