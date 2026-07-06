// components/badge-icon.tsx
const SHIELD_COLORS: Record<number, { base: string; inset: string; emblem: string }> = {
  1: { base: "#b5794a", inset: "#8c5a34", emblem: "#f5e0c0" },
  2: { base: "#c8ccd1", inset: "#9aa0a6", emblem: "#565c62" },
  3: { base: "#e3b23c", inset: "#b8871c", emblem: "#6b4a12" },
  4: { base: "#b9d6e0", inset: "#86a8b5", emblem: "#3a5866" },
  5: { base: "#4a2d6b", inset: "#7a56a8", emblem: "#d9c7f5" },
};

const GEM_COLORS: Record<number, { base: string; shade: string; highlight: string }> = {
  1: { base: "#ffd9a0", shade: "#d99b3f", highlight: "#fff3d9" },
  2: { base: "#ff9f4d", shade: "#c05e12", highlight: "#ffd9a8" },
  3: { base: "#ff6b35", shade: "#9c3410", highlight: "#ffb37a" },
  4: { base: "#e8342a", shade: "#8a1810", highlight: "#ff8a72" },
  5: { base: "#7ec8e3", shade: "#2f6f8f", highlight: "#d9f2ff" },
};

export function BadgeIcon({
  category, tier, size = 56, title,
}: { category: "reading_milestone" | "streak"; tier: number; size?: number; title?: string }) {
  if (category === "reading_milestone") {
    const c = SHIELD_COLORS[tier] ?? SHIELD_COLORS[1];
    return (
      <svg width={size} height={size * (100 / 90)} viewBox="0 0 90 100" role="img" aria-label={title}>
        {title && <title>{title}</title>}
        <path d="M45,0 L90,18 L90,55 Q90,90 45,100 Q0,90 0,55 L0,18 Z" fill={c.base} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
        <path d="M45,8 L82,23 L82,53 Q82,82 45,90 Q8,82 8,53 L8,23 Z" fill="none" stroke={c.inset} strokeWidth="2" />
        {tier === 5 && (
          <>
            <circle cx="45" cy="18" r="3" fill="#f2c94c" />
            <circle cx="20" cy="45" r="2" fill="#f2c94c" />
            <circle cx="70" cy="45" r="2" fill="#f2c94c" />
          </>
        )}
        <path d="M45,32 L50,47 L65,50 L50,53 L45,68 L40,53 L25,50 L40,47 Z" fill={c.emblem} />
      </svg>
    );
  }

  const c = GEM_COLORS[tier] ?? GEM_COLORS[1];
  return (
    <svg width={size * (70 / 90)} height={size} viewBox="0 0 70 90" role="img" aria-label={title}>
      {title && <title>{title}</title>}
      <path d="M35,0 L70,30 L35,90 L0,30 Z" fill={c.base} stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      <path d="M35,0 L70,30 L35,90 Z" fill={c.shade} />
      <path d="M35,5 L42,20 L35,35 L28,20 Z" fill={c.highlight} />
    </svg>
  );
}