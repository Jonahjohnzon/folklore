"use client";

interface AvatarProps {
  avatarUrl?: string | null;
  name?: string | null; // displayName or username — first letter used as fallback
  size?: number; // px
  className?: string;
}

export function Avatar({ avatarUrl, name, size = 32, className = "" }: AvatarProps) {
  const initial = name?.trim()?.[0]?.toUpperCase() ?? "?";

  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt={name ?? "User avatar"}
        className={`shrink-0 rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      aria-label={name ?? "User avatar"}
      className={`flex shrink-0 items-center justify-center rounded-full bg-accent font-display font-semibold text-accent-ink ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}