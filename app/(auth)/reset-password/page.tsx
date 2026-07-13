/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(auth)/reset-password/page.tsx
"use client";

import { useState } from "react";
import {  useSearchParams } from "next/navigation";
import { AuthService } from "@/app/services/auth";
import { Suspense } from "react";
import { useRouter } from "nextjs-toploader/app";
 function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (!token) {
      setError("Missing or invalid reset link");
      return;
    }

    setStatus("loading");
    try {
      await AuthService.resetPassword({ token, newPassword });
      setStatus("done");
      setTimeout(() => router.push("/sign-in"), 2000);
    } catch (err) {
      setError("This reset link is invalid or has expired.");
      setStatus("idle");
    }
  }

  if (!token) {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center space-y-2">
        <h1 className="text-xl font-semibold">Invalid link</h1>
        <p className="text-sm text-muted-foreground">
          This reset link is missing a token. Request a new one from the{" "}
          <a href="/forgot-password" className="underline">forgot password</a> page.
        </p>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="max-w-sm mx-auto mt-24 text-center space-y-2">
        <h1 className="text-xl font-semibold">Password reset</h1>
        <p className="text-sm text-muted-foreground">Redirecting you to login...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-24 space-y-4">
      <h1 className="text-xl font-semibold">Set a new password</h1>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
        minLength={8}
        required
        className="w-full border rounded-md px-3 py-2"
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        minLength={8}
        required
        className="w-full border rounded-md px-3 py-2"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-md bg-primary text-primary-foreground py-2"
      >
        {status === "loading" ? "Resetting..." : "Reset password"}
      </button>
    </form>
  );
}

export default function Page (){
  return(
    <Suspense fallback={<div></div>}>
      <ResetPasswordPage/>
    </Suspense>
  )
}