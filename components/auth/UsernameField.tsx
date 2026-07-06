"use client";

import { useEffect, useRef, useState } from "react";
import { AtSign, Check, X, Loader2 } from "lucide-react";
import { AuthService } from "@/app/services/auth";

interface UsernameFieldProps {
  value: string;
  onChange: (value: string) => void;
  onAvailabilityChange: (available: boolean | null) => void;
  error?: string;
  currentUsername?: string; // optional prop to indicate the current username of the user
}

type CheckState = "idle" | "checking" | "available" | "taken";

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/;

function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

export function UsernameField({ value, onChange, onAvailabilityChange, error, currentUsername }: UsernameFieldProps) {
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!isValidUsername(value)) {
      setCheckState("idle");
      onAvailabilityChange(null);
      return;
    }

    setCheckState("checking");
    onAvailabilityChange(null);

    const currentRequestId = ++requestIdRef.current;
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const res = await AuthService.checkUsernameAvailable(value);
        if (cancelled || currentRequestId !== requestIdRef.current) return;

        const available = res.data.available;
        setCheckState(available ? "available" : "taken");
        onAvailabilityChange(available);
      } catch {
        if (cancelled || currentRequestId !== requestIdRef.current) return;
        // fail open on network error — server-side uniqueness check on
        // register is the real backstop, so don't block typing here
        setCheckState("idle");
        onAvailabilityChange(null);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div>
      <label className="mb-1.5 block font-sans text-sm font-medium text-ink">
        Username <span className="text-accent">*</span>
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
          <AtSign size={16} />
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\s/g, ""))}
          placeholder="yourusername"
          autoComplete="username"
          className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-10 font-sans text-sm text-ink placeholder:text-ink-muted/60 transition focus:outline-none focus:ring-2 focus:ring-accent/30 ${
            error ? "border-red-400" : "border-hairline focus:border-accent"
          }`}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2">
          {checkState === "checking" && <Loader2 size={15} className="animate-spin text-ink-muted" />}
          {checkState === "available" && <Check size={15} className="text-emerald-600" />}
          {checkState === "taken" && <X size={15} className="text-red-500" />}
        </span>
      </div>

      {error ? (
        <p className="mt-1.5 font-sans text-xs text-red-600">{error}</p>
      ) : checkState === "taken" ? (
        <p className="mt-1.5 font-sans text-xs text-red-600">That username is taken.</p>
      ) : checkState === "available" ? (
        <p className="mt-1.5 font-sans text-xs text-emerald-600">@{value} is available.</p>
      ) : (
        <p className="mt-1.5 font-sans text-xs text-ink-muted">3–30 characters: letters, numbers, underscores.</p>
      )}
    </div>
  );
}