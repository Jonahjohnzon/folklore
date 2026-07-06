"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { getPasswordStrength } from "@/lib/validation/auth";

interface PasswordFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  showStrength?: boolean;
  autoComplete?: string;
}

const STRENGTH_COLORS = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-500", "bg-emerald-500"];

export function PasswordField({
  label = "Password", value, onChange, onBlur, error, showStrength, autoComplete = "new-password",
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div>
      <label className="mb-1.5 block font-sans text-sm font-medium text-ink">
        {label} <span className="text-accent">*</span>
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
          <Lock size={16} />
        </span>
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border bg-bg py-2.5 pl-10 pr-10 font-sans text-sm text-ink transition focus:outline-none focus:ring-2 focus:ring-accent/30 ${
            error ? "border-red-400" : "border-hairline focus:border-accent"
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted transition hover:text-ink"
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrength && value && strength && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < strength.score ? STRENGTH_COLORS[strength.score] : "bg-hairline"
                }`}
              />
            ))}
          </div>
          <p className="mt-1 font-sans text-xs text-ink-muted">{strength.label}</p>
        </div>
      )}

      {error && <p className="mt-1.5 font-sans text-xs text-red-600">{error}</p>}
    </div>
  );
}