/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { MailCheck } from "lucide-react";
import { useSnapshot } from "valtio";
import { store } from "@/app/store/userStore";
import { AuthService } from "@/app/services/auth"; // TODO: adjust path to your auth service
import { FieldLabel, TextInput, SaveBar, type SaveStatus } from "./shared";

export function AccountTab({ onDirtyChange }: { onDirtyChange: (dirty: boolean) => void }) {
  const snap = useSnapshot(store);

  const [email, setEmail] = useState(snap.email ?? "");
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);

  const dirty = email !== (snap.email ?? "");
  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      // Changing email should re-trigger verification rather than swap it instantly,
      // same pattern you used for the forum's Nodemailer verification flow.
      await AuthService.requestEmailChange(email);
      setPendingVerification(true);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err: any) {
      setStatus("error");
      setError(err?.message ?? "Couldn't update your email.");
    }
  };

  return (
    <div>
      <h3 className="font-display text-xl font-semibold text-ink">Account</h3>
      <p className="mt-1 font-sans text-sm text-ink-muted">Manage the email tied to your account.</p>

      <div className="mt-6">
        <FieldLabel hint="We'll send a confirmation link to your new address before it takes effect.">
          Email address
        </FieldLabel>
        <TextInput type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>

      {snap.emailVerified === false && (
        <p className="mt-2 font-sans text-xs font-medium text-amber-600">{"Your current email isn't verified yet."}</p>
      )}

      {pendingVerification && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-hairline bg-hairline/20 px-3.5 py-3">
          <MailCheck size={16} className="mt-0.5 shrink-0 text-accent" />
          <p className="font-sans text-xs text-ink-muted">
            Check <span className="font-semibold text-ink">{email}</span> for a link to confirm this change. Your email stays the
            same until you confirm.
          </p>
        </div>
      )}

      <SaveBar status={status} errorMessage={error} onSave={handleSave} disabled={!dirty} />
    </div>
  );
}