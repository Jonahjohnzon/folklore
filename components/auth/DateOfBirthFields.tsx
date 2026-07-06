"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface DateOfBirthFieldsProps {
  day: string;
  month: string;
  year: string;
  onChange: (parts: { day: string; month: string; year: string }) => void;
  error?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onOutside();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onOutside]);
}

interface DropdownProps {
  label: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  error?: boolean;
}

function Dropdown({ label, value, placeholder, options, onSelect, error }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  const selected = options.find((o) => o.value === value);

  const triggerClass =
    "w-full rounded-lg border bg-bg px-3 py-2.5 text-left font-sans text-sm transition focus:outline-none focus:ring-2 focus:ring-accent/30 " +
    (error ? "border-red-400" : "border-hairline focus:border-accent") +
    " " +
    (selected ? "text-ink" : "text-ink-muted");

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={triggerClass}
      >
        {selected ? selected.label : placeholder}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={label}
          className="scrollbar-thin absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-hairline bg-bg shadow-lg"
        >
          {options.map((o) => (
            <div
              key={o.value}
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onSelect(o.value);
                setOpen(false);
              }}
              className={
                "cursor-pointer px-3 py-2 font-sans text-sm transition " +
                (o.value === value
                  ? "bg-accent/10 text-accent"
                  : "text-ink hover:bg-accent/5")
              }
            >
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DateOfBirthFields({ day, month, year, onChange, error }: DateOfBirthFieldsProps) {
  const days = useMemo(
    () => Array.from({ length: 31 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) })),
    []
  );

  const months = useMemo(
    () => MONTHS.map((m, i) => ({ value: String(i + 1), label: m })),
    []
  );

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    // 100-year window is generous on purpose — narrowing it doesn't add
    // real validation value, the age check after submit does that.
    return Array.from({ length: 100 }, (_, i) => {
      const y = current - i;
      return { value: String(y), label: String(y) };
    });
  }, []);

  return (
    <div>
      <label className="mb-1.5 block font-sans text-sm font-medium text-ink">
        Date of birth <span className="text-accent">*</span>
      </label>
      <p className="mb-2 font-sans text-xs text-ink-muted">
        {"We use this to keep mature content away from readers under 18, and Lore away from anyone under 13. It isn't shown on your profile."}
      </p>
      <div className="grid grid-cols-3 gap-2">
        <Dropdown
          label="Day"
          placeholder="Day"
          value={day}
          options={days}
          onSelect={(v) => onChange({ day: v, month, year })}
          error={!!error}
        />

        <Dropdown
          label="Month"
          placeholder="Month"
          value={month}
          options={months}
          onSelect={(v) => onChange({ day, month: v, year })}
          error={!!error}
        />

        <Dropdown
          label="Year"
          placeholder="Year"
          value={year}
          options={years}
          onSelect={(v) => onChange({ day, month, year: v })}
          error={!!error}
        />
      </div>
      {error && <p className="mt-1.5 font-sans text-xs text-red-600">{error}</p>}
    </div>
  );
}