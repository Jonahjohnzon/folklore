// app/admin/layout.tsx
import Link from "next/link";
import { LayoutDashboard, Users, Music, Award, ShieldAlert } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/sounds", label: "Sounds", icon: Music },
  { href: "/admin/badges", label: "Badges", icon: Award },
  { href: "/admin/moderation", label: "Moderation", icon: ShieldAlert },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-6">
      <aside className="w-48 shrink-0">
        <p className="mb-4 font-sans text-xs font-semibold uppercase tracking-wide text-ink-muted">Admin</p>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm text-ink-muted hover:bg-surface hover:text-ink"
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}