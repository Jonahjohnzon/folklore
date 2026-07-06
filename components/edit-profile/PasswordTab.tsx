"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Check, X as XIcon } from "lucide-react";
import { AuthService } from "@/app/services/auth"; // TODO: adjust path to your auth service
import { FieldLabel, TextInput, SaveBar, type SaveStatus } from "./shared";

const REQUIREMENTS: { label: string; test: (pw: string) => boolean }[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One number", test: (pw) => /[0-9]/.test(pw) },
  { label: "One symbol", test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

function scorePassword(pw: string) {
  return REQUIREMENTS.filter((r) => r.test(pw)).length;
}

export function PasswordTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const dirty = currentPassword !== "" || newPassword !== "" || confirmPassword !== "";
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const score = useMemo(() => scorePassword(newPassword), [newPassword]);
  const strengthLabel = ["Too weak", "Weak", "Okay", "Good", "Strong"][score];
  const strengthColor = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-lime-500", "bg-green-600"][score];

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSubmit = currentPassword.length > 0 && score === REQUIREMENTS.length && passwordsMatch;

  const resetFields = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSave = async () => {
    if (!canSubmit) {
      setStatus("error");
      setError(!passwordsMatch ? "New passwords don't match." : "Password doesn't meet the requirements yet.");
      return;
    }
    setStatus("saving");
    setError(null);
    try {
      await AuthService.changePassword({ currentPassword, newPassword });
      resetFields();
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err: any) {
      setStatus("error");
      setError(err?.response?.data?.message ?? "Current password is incorrect.");
    }
  };

  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-ink">Password</h3>
      <p className="mt-1 font-sans text-sm text-ink-muted">Choose a password you don't use anywhere else.</p>

      <div className="mt-6">
        <FieldLabel>Current password</FieldLabel>
        <div className="relative">
          <TextInput
            type={showCurrent ? "text" : "password"}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="pr-10"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-ink-muted hover:text-ink"
            aria-label={showCurrent ? "Hide password" : "Show password"}
          >
            {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="mt-5">
        <FieldLabel>New password</FieldLabel>
        <div className="relative">
          <TextInput
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-ink-muted hover:text-ink"
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {newPassword.length > 0 && (
          <>
            <div className="mt-2 flex gap-1">
              {REQUIREMENTS.map((_, i) => (
                <span key={i} className={`h-1 flex-1 rounded-full ${i < score ? strengthColor : "bg-hairline"}`} />
              ))}
            </div>
            <p className="mt-1 font-sans text-xs font-medium text-ink-muted">{strengthLabel}</p>
          </>
        )}

        <ul className="mt-3 grid grid-cols-2 gap-y-1.5">
          {REQUIREMENTS.map((req) => {
            const met = req.test(newPassword);
            return (
              <li key={req.label} className={`flex items-center gap-1.5 font-sans text-xs ${met ? "text-ink" : "text-ink-muted"}`}>
                {met ? <Check size={12} className="text-green-600" /> : <XIcon size={12} className="text-ink-muted" />}
                {req.label}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-5">
        <FieldLabel>Confirm new password</FieldLabel>
        <TextInput
          type={showNew ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
        {confirmPassword.length > 0 && !passwordsMatch && (
          <p className="mt-1.5 font-sans text-xs font-medium text-red-500">{"Passwords don't match yet."}</p>
        )}
      </div>

      <SaveBar status={status} errorMessage={error} onSave={handleSave} disabled={!dirty} />
    </div>
  );
}