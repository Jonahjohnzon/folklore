interface SkeletonProps {
  className?: string;
  /** Desktop only — mobile never animates, per design. */
  animate?: boolean;
}

export function Skeleton({ className = "", animate = true }: SkeletonProps) {
  return (
    <div
      className={`rounded-md bg-hairline ${animate ? "lg:animate-pulse" : ""} ${className}`}
    />
  );
}