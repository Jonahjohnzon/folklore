"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState, Suspense } from "react";
import {
  Coins, CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCcw, ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { CoinService } from "@/app/services/coinService";

type VerifyState = "checking" | "success" | "pending" | "failed";

interface VerifyResult {
  coinsCredited: number;
  newBalance: number;
  packageLabel: string;
  amountLabel: string;
  reference: string;
}

export default function PaymentThankYouPage() {
  return (
    <Suspense fallback={<ThankYouFallback />}>
      <PaymentThankYouContent />
    </Suspense>
  );
}

function ThankYouFallback() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
        <Loader2 size={28} className="animate-spin" />
      </div>
      <h1 className="font-display text-2xl font-bold text-ink">Confirming your payment…</h1>
      <p className="mt-1.5 font-sans text-sm text-ink-muted">This only takes a moment. Don&apos;t close this page.</p>
    </main>
  );
}

const MAX_POLLS = 6;
const POLL_INTERVAL_MS = 3000;

function PaymentThankYouContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const reference = searchParams.get("reference") ?? searchParams.get("trxref");

  const [state, setState] = useState<VerifyState>("checking");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (!reference) {
      setState("failed");
      return;
    }

    let cancelled = false;

    async function verify() {
      try {
        const res = await CoinService.verifyPayment(reference!);
        if (cancelled) return;

        if (res.success && res.data.status === "completed") {
          setResult({
            coinsCredited: res.data.coinsCredited!,
            newBalance: res.data.newBalance!,
            packageLabel: res.data.packageLabel!,
            amountLabel: res.data.amountLabel!,
            reference: res.data.reference!,
          });
          setState("success");
        } else if (res.success && res.data.status === "pending") {
          setState("pending");
        } else {
          setState("failed");
        }
      } catch {
        if (!cancelled) setState("failed");
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [reference, pollCount]);

  useEffect(() => {
    if (state !== "pending" && state !== "checking") return;
    if (pollCount >= MAX_POLLS) return;
    const t = setTimeout(() => setPollCount((c) => c + 1), POLL_INTERVAL_MS);
    return () => clearTimeout(t);
  }, [state, pollCount]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      {state === "checking" && (
        <>
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Loader2 size={28} className="animate-spin" />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Confirming your payment…</h1>
          <p className="mt-1.5 font-sans text-sm text-ink-muted">This only takes a moment. Don&apos;t close this page.</p>
        </>
      )}

      {state === "success" && result && (
        <>
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 size={30} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Thank you!</h1>
          <p className="mt-1.5 max-w-xs font-sans text-sm text-ink-muted">
            Your coins have been added to your account. Time to unlock the next chapter.
          </p>

          <div className="mt-6 w-full rounded-2xl border border-hairline bg-surface-raised p-5 shadow-sm">
            <div className="flex items-center justify-center gap-2 text-gold">
              <Coins size={22} />
              <span className="font-display text-2xl font-bold text-ink">
                +{result.coinsCredited.toLocaleString()} coins
              </span>
            </div>
            <div className="mt-4 space-y-2 overflow-hidden border-t border-hairline pt-4 text-left font-sans text-sm">
              <Row label="Amount charged" value={result.amountLabel} />
              <Row label="Reference" value={result.reference} mono />
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
            <button
              onClick={() => router.replace("/coins")}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90"
            >
              View wallet <ArrowRight size={15} />
            </button>
            <Link
              href="/"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline px-5 py-3 font-sans text-sm font-semibold text-ink hover:border-accent/50"
            >
              Keep reading
            </Link>
          </div>
        </>
      )}

      {state === "pending" && (
        <>
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold">
            <ReceiptText size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">Payment received, confirming…</h1>
          <p className="mt-1.5 max-w-xs font-sans text-sm text-ink-muted">
            {pollCount >= 3
              ? "This is taking longer than usual — crypto payments can take a few minutes to confirm on-chain. Your coins will appear automatically once it clears."
              : "We're waiting on final confirmation from the payment provider. This page will update on its own."}
          </p>
          <button
            onClick={() => setPollCount((c) => c + 1)}
            className="mt-6 flex items-center gap-2 rounded-full border border-hairline px-5 py-2.5 font-sans text-sm font-semibold text-ink hover:border-accent/50"
          >
            <RefreshCcw size={14} /> Check again
          </button>
        </>
      )}

      {state === "failed" && (
        <>
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-600">
            <XCircle size={28} />
          </div>
          <h1 className="font-display text-2xl font-bold text-ink">We couldn&apos;t confirm this payment</h1>
          <p className="mt-1.5 max-w-xs font-sans text-sm text-ink-muted">
            {reference
              ? "If you were charged, your coins will still be credited once we hear back from the provider — no need to pay twice."
              : "We couldn't find a payment reference for this page."}
          </p>
          <div className="mt-6 flex w-full flex-col gap-2.5 sm:flex-row">
            <button
              onClick={() => router.replace("/coins")}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm hover:opacity-90"
            >
              Back to wallet <ArrowRight size={15} />
            </button>
            <Link
              href="/support"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-hairline px-5 py-3 font-sans text-sm font-semibold text-ink hover:border-accent/50"
            >
              Contact support
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-ink-muted">{label}</span>
      <span className={`text-right text-ink ${mono ? "font-mono text-xs" : "font-medium"}`}>{value}</span>
    </div>
  );
}