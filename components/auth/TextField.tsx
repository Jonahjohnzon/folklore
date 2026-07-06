"use client";

interface TextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  icon?: React.ComponentType<{ size?: number }>;
  autoComplete?: string;
  required?: boolean;
}

export function TextField({
  label, type = "text", value, onChange, onBlur, placeholder, error, hint, icon: Icon, autoComplete, required,
}: TextFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block font-sans text-sm font-medium text-ink">
        {label}
        {required && <span className="text-accent"> *</span>}
      </label>
      <div className="relative">
        {Icon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted">
            <Icon size={16} />
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`w-full rounded-lg border bg-bg px-3.5 py-2.5 font-sans text-sm text-ink placeholder:text-ink-muted/60 transition focus:outline-none focus:ring-2 focus:ring-accent/30 ${
            Icon ? "pl-10" : ""
          } ${error ? "border-red-400" : "border-hairline focus:border-accent"}`}
        />
      </div>
      {error ? (
        <p className="mt-1.5 font-sans text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 font-sans text-xs text-ink-muted">{hint}</p>
      ) : null}
    </div>
  );
}