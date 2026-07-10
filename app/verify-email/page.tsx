// app/verify-email/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AuthService } from "@/app/services/auth";

function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");

  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("Verifying your email…");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    AuthService.verifyEmail(token)
      .then(() => {
        setStatus("success");
        setMessage("Your email is verified.");
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .catch((err: any) => {
        setStatus("error");
        setMessage(err.message || "This link is invalid or has expired.");
      });
  }, [token]);

  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      {status === "pending" && <Loader2 size={28} className="animate-spin text-accent" />}
      {status === "success" && <CheckCircle2 size={28} className="text-green-600" />}
      {status === "error" && <XCircle size={28} className="text-red-600" />}
      <p className="mt-4 font-sans text-sm text-ink">{message}</p>
      <button
        onClick={() => router.push("/")}
        className="mt-6 rounded-full bg-accent px-5 py-2.5 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90"
      >
        Go home
      </button>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
          <Loader2 size={28} className="animate-spin text-accent" />
          <p className="mt-4 font-sans text-sm text-ink">Verifying your email…</p>
        </main>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}