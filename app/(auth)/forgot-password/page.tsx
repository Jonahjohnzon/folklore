// app/(auth)/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { AuthService } from "@/app/services/auth";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("loading");
    try {
      await AuthService.forgotPassword(identifier);
      // Always show the same success state regardless of whether the account exists.
      setStatus("sent");
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center space-y-2">
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If an account matches <strong>{identifier}</strong>, we&apos;ve sent a link to reset your password.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-24 space-y-4">
      <h1 className="text-xl font-semibold">Forgot your password?</h1>
      <p className="text-sm text-muted-foreground">
        Enter your email or username and we&apos;ll send you a reset link.
      </p>
      <input
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Email or username"
        required
        className="w-full border rounded-md px-3 py-2"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-primary text-primary-foreground py-2"
      >
        {status === "loading" ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}