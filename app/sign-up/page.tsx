"use client";

import { AuthService } from "@/app/services/auth";
import { getErrorMessage, getFieldErrors  } from "@/lib/api/errors";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "nextjs-toploader/app";
import { Mail, User as UserIcon, Loader2, ArrowRight } from "lucide-react";
import { hydrateStore } from "../store/StoreHydrator";
import { AuthShell } from "@/components/auth/AuthShell";
import { TextField } from "@/components/auth/TextField";
import { PasswordField } from "@/components/auth/PasswordField";
import { UsernameField } from "@/components/auth/UsernameField";
import { DateOfBirthFields } from "@/components/auth/DateOfBirthFields";
import { SocialAuthDivider } from "@/components/auth/SocialAuthButtons";
import {
  isValidEmail, getPasswordStrength, buildDateFromParts, calculateAge,
  MIN_SIGNUP_AGE, MATURE_CONTENT_AGE,
} from "@/lib/validation/auth";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";

interface FormErrors {
  email?: string;
  username?: string;
  password?: string;
  dob?: string;
  terms?: string;
}

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const [dobParts, setDobParts] = useState({ day: "", month: "", year: "" });
  const dob = buildDateFromParts(dobParts.day, dobParts.month, dobParts.year);
  const age = dob ? calculateAge(dob) : null;

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function validate(): FormErrors {
    const next: FormErrors = {};

    if (!isValidEmail(email)) next.email = "Enter a valid email address.";

    if (!username) next.username = "Choose a username.";
    else if (usernameAvailable === false) next.username = "That username is taken.";
    else if (usernameAvailable === null) next.username = "Still checking that username — wait a second.";

    if (getPasswordStrength(password).score < 2 || password.length < 8) {
      next.password = "Use at least 8 characters, with a mix of letters and numbers.";
    }

    if (!dob) {
      next.dob = "Enter your full date of birth.";
    } else if (age !== null && age < MIN_SIGNUP_AGE) {
      next.dob = `You must be at least ${MIN_SIGNUP_AGE} to join Lore.`;
    }

    if (!agreedToTerms) next.terms = "You need to accept the Terms and Privacy Policy to continue.";

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
      await AuthService.register({
      email,
      username,
      password,
      displayName: displayName || undefined,
      dateOfBirth: dob!.toISOString(),
      marketingOptIn,
      agreedToTerms,
    });
    await hydrateStore();
    router.push("/");
    } catch (err) {
        const fieldErrors = getFieldErrors(err);
        if (fieldErrors) {
          setErrors((prev) => ({
            ...prev,
            email: fieldErrors.email?.[0],
            username: fieldErrors.username?.[0] ?? prev.username,
            password: fieldErrors.password?.[0],
            dob: fieldErrors.dateOfBirth?.[0],
          }));
        }
        setSubmitError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Get started"
      title="Create your account"
      subtitle="Join readers and writers building stories together."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <TextField
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={setEmail}
          onBlur={() => setErrors((p) => ({ ...p, email: isValidEmail(email) ? undefined : "Enter a valid email address." }))}
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email}
          required
        />

        <UsernameField
          value={username}
          onChange={setUsername}
          onAvailabilityChange={setUsernameAvailable}
          error={errors.username}
        />

        <TextField
          label="Display name"
          icon={UserIcon}
          value={displayName}
          onChange={setDisplayName}
          placeholder="How you'll appear to other readers"
          hint="Optional — shown instead of your username. You can change this anytime."
        />

        <PasswordField
          value={password}
          onChange={setPassword}
          onBlur={() =>
            setErrors((p) => ({
              ...p,
              password: getPasswordStrength(password).score < 2 || password.length < 8
                ? "Use at least 8 characters, with a mix of letters and numbers."
                : undefined,
            }))
          }
          showStrength
          error={errors.password}
        />

        <DateOfBirthFields
          day={dobParts.day}
          month={dobParts.month}
          year={dobParts.year}
          onChange={setDobParts}
          error={errors.dob}
        />
{/* age >= MIN_SIGNUP_AGE && age < MATURE_CONTENT_AGE block removed — signup now requires 18+ */}
        {dob && age !== null && age >= MIN_SIGNUP_AGE && age < MATURE_CONTENT_AGE && (
          <p className="-mt-3 font-sans text-xs text-ink-muted">
            {"You'll be able to turn on mature content once you turn {MATURE_CONTENT_AGE}."}
          </p>
        )}

        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-2.5 font-sans text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-hairline text-accent focus:ring-accent/30"
            />
            <span>
              I agree to Lore&apos;s{" "}
              <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link> and{" "}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {errors.terms && <p className="font-sans text-xs text-red-600">{errors.terms}</p>}

          <label className="flex items-start gap-2.5 font-sans text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={marketingOptIn}
              onChange={(e) => setMarketingOptIn(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-hairline text-accent focus:ring-accent/30"
            />
            <span>Email me new chapter alerts and Lore updates.</span>
          </label>
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
          {isSubmitting ? "Creating your account…" : "Create account"}
        </button>
      </form>

      <SocialAuthDivider />
      <SocialAuthButtons />

      <p className="mt-8 text-center font-sans text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-accent hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}