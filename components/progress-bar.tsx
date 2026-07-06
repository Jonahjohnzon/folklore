interface ProgressBarProps {
  value: number; // 0–100
  size?: "sm" | "md";
  barClassName?: string;
  trackClassName?: string;
  className?: string;
}

export function ProgressBar({
  value,
  size = "sm",
  barClassName = "bg-accent",
  trackClassName = "bg-hairline/60",
  className = "",
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  const height = size === "sm" ? "h-1.5" : "h-2.5";
  return (
    <div className={`w-full overflow-hidden rounded-full ${height} ${trackClassName} ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${barClassName}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}