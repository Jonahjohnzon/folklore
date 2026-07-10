"use client";
import { AuthService } from "@/app/services/auth";
import { getErrorMessage } from "@/lib/api/errors";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { hydrateStore } from "../store/StoreHydrator";
import { AuthShell } from "@/components/auth/AuthShell";
import { TextField } from "@/components/auth/TextField";
import { PasswordField } from "@/components/auth/PasswordField";
import { SocialAuthDivider } from "@/components/auth/SocialAuthButtons";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

interface FormErrors {
  identifier?: string;
  password?: string;
}

export default function SignInPage() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!identifier.trim()) next.identifier = "Enter your email or username.";
    if (!password) next.password = "Enter your password.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try { 
     await AuthService.login({ identifier, password });
     await hydrateStore();
     router.replace("/");
    } catch (err) {
    
      setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Pick up your stories right where you left off."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <TextField
          label="Email or username"
          icon={Mail}
          value={identifier}
          onChange={setIdentifier}
          placeholder="you@example.com"
          autoComplete="username"
          error={errors.identifier}
          required
        />

        <div>
          <PasswordField
            value={password}
            onChange={setPassword}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="mt-3 flex items-center justify-between">
            <label className="flex items-center gap-2 font-sans text-sm text-ink-muted">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-hairline text-accent focus:ring-accent/30"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="font-sans text-sm text-accent hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {submitError && (
          <p className="rounded-lg border border-red-300 bg-red-50 px-3.5 py-2 font-sans text-sm text-red-700">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 rounded-full bg-accent py-3 font-sans text-sm font-semibold text-accent-ink shadow-sm transition hover:opacity-90 hover:shadow-md disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
          {isSubmitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <SocialAuthDivider />
      <SocialAuthButtons />

      <p className="mt-8 text-center font-sans text-sm text-ink-muted">
        New to TipaTale?{" "}
        <Link href="/sign-up" className="font-medium text-accent hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}