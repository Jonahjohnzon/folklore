"use client";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSnapshot } from "valtio";
import { SearchBox } from "./search-dropdown";
import { NotificationBell } from "./notification-bell";
import { useRouter } from "nextjs-toploader/app";
import { MessageBell } from "@/components/chat/message-bell";
import {
  Search,
  Menu,
  X,
  PenSquare,
  LayoutDashboard,
  Library,
  Sparkles,
  LogIn,
  UserPlus,
  LogOut,
  FilePlus,
  BookCopy,
  Wrench,
  GraduationCap,
  History,
} from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { CoinDisplay } from "./coin-display";
import { Avatar } from "./avatar";
import { store } from "@/app/store/userStore";
import { AuthService } from "@/app/services/auth";
import { Skeleton } from "./skeleton";

const NAV_LINKS = [
  { href: "/browse/fantasy", label: "Fantasy" },
  { href: "/browse/romance", label: "Romance" },
  { href: "/browse/sci-fi", label: "Sci-Fi" },
  { href: "/browse/thriller", label: "Thriller" },
];

const WRITE_TABS = [
  { id: "new-story", label: "New story", icon: FilePlus },
  { id: "my-stories", label: "My stories", icon: BookCopy },
  { id: "tools", label: "Helpful tools", icon: Wrench },
  { id: "tutorial", label: "Tutorial", icon: GraduationCap },
] as const;

const TOOLS = [
  { label: "Outline builder", href: "https://www.writinglab.io/outline-generator" },
  { label: "Image size compressor", href: "https://www.iloveimg.com/" },
  { label: "Grammar check", href: "https://www.grammarly.com/" },
];

const GUIDES = [
  { label: "Getting started guide", href: "/help/getting-started" },
  { label: "Growing your readership", href: "/help/growing-readership" },
];


type WriteTabId = (typeof WRITE_TABS)[number]["id"];

function useDropdown<T extends HTMLElement>() {
  const [open, setOpen] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return { open, setOpen, ref };
}

function DropdownPanel({
  width = "w-64",
  label,
  children,
}: {
  width?: string;
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute right-0 z-50 mt-2 ${width} overflow-hidden rounded-xl border border-hairline bg-surface-raised shadow-xl`}
    >
      <div className="flex flex-col p-1.5">
        {label && (
          <p className="px-2.5 pb-1.5 pt-1 font-sans text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            {label}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}

function DropdownItem({
  href,
  onClick,
  icon: Icon,
  children,
  variant = "default",
  trailing,
}: {
  href?: string;
  onClick?: () => void;
  icon?: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
  variant?: "default" | "accent" | "gold" | "danger";
  trailing?: React.ReactNode;
}) {
  const styles =
    variant === "accent"
      ? "bg-accent text-accent-ink hover:opacity-90"
      : variant === "gold"
      ? "text-gold hover:bg-bg"
      : variant === "danger"
      ? "text-red-500 hover:bg-bg"
      : "text-ink hover:bg-bg";

  const content = (
    <>
      {Icon && <Icon size={15} />}
      <span className="flex-1 text-left">{children}</span>
      {trailing}
    </>
  );

  const className = `flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 font-sans text-sm font-medium transition ${styles}`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function DropdownDivider() {
  return <div className="my-1.5 h-px bg-hairline" />;
}

/** Shown at the top of AccountMenu / MobileMenu when logged in. */
function AccountHeader({ snap }: { snap: typeof store }) {
  const name = snap.displayName || snap.username;
  return (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <Avatar avatarUrl={snap.avatarUrl} name={name} size={40} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-semibold text-ink">{name}</p>
        <p className="truncate font-sans text-xs text-ink-muted">@{snap.username}</p>
      </div>
    </div>
  );
}

function AccountHeaderSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-2">
      <Skeleton animate={false} className="h-9 w-9 rounded-full" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <Skeleton animate={false} className="h-3.5 w-24" />
        <Skeleton animate={false} className="h-3 w-16" />
      </div>
    </div>
  );
}

async function handleSignOut(closeMenu: () => void) {
  try {
    await AuthService.logout();
  } finally {
    store.hydrated = false;
    store._id = null;
    store.username = "";
    store.displayName = "";
    store.avatarUrl = null;
    store.email = "";
    store.creatorStatus = "not_applied";
    closeMenu();
    window.location.href = "/";
  }
}

function AccountMenu() {
  const { open, setOpen, ref } = useDropdown<HTMLDivElement>();
  const snap = useSnapshot(store);
  const isLoading = !snap.authChecked;
  const isLoggedIn = snap.hydrated && !!snap._id;
  const isCreator = snap.creatorStatus === "active";

  if (isLoading) {
    return (
      <div className="hidden h-9 w-9 items-center justify-center lg:flex">
        <Skeleton className="h-9 w-9 rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Account"
        className="hidden cursor-pointer  items-center justify-center rounded-full lg:flex"
      >
        {isLoggedIn ? (
          <Avatar avatarUrl={snap.avatarUrl} name={snap.displayName || snap.username} size={40} />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-accent">
            <LayoutDashboard size={16} />
          </span>
        )}
      </button>

      {open && (
        <DropdownPanel width="w-64" label={isLoggedIn ? undefined : "Account"}>
          {isLoggedIn ? (
            <>
              <AccountHeader snap={snap} />
              <DropdownDivider />
              <DropdownItem href={`/u/${snap.username}`} onClick={() => setOpen(false)} icon={LayoutDashboard}>
                My profile
              </DropdownItem>
              <DropdownItem href="/library" onClick={() => setOpen(false)} icon={Library}>
                My library
              </DropdownItem>
              <DropdownItem href="/history" onClick={() => setOpen(false)} icon={History}>
                Reading history
              </DropdownItem>

              <DropdownDivider />

              {isCreator ? (
                <DropdownItem href="/dashboard" onClick={() => setOpen(false)} icon={PenSquare}>
                  Creator dashboard
                </DropdownItem>
              ) : (
                <DropdownItem href="/creator/apply" onClick={() => setOpen(false)} icon={Sparkles} variant="gold">
                  Become a creator
                </DropdownItem>
              )}
              {/* {!isCreator && (
                <DropdownItem href="/premium" onClick={() => setOpen(false)} icon={Sparkles} variant="gold">
                  Try Premium
                </DropdownItem>
              )} */}

              <DropdownDivider />

              <DropdownItem onClick={() => handleSignOut(() => setOpen(false))} icon={LogOut} variant="danger">
                Sign out
              </DropdownItem>
            </>
          ) : (
            <>
              <DropdownItem href="/sign-up" onClick={() => setOpen(false)} icon={UserPlus} variant="accent">
                Sign up
              </DropdownItem>
              <DropdownItem href="/sign-in" onClick={() => setOpen(false)} icon={LogIn}>
                Sign in
              </DropdownItem>

              <DropdownDivider />

              {/* <DropdownItem href="/premium" onClick={() => setOpen(false)} icon={Sparkles} variant="gold">
                Try Premium
              </DropdownItem> */}
            </>
          )}
        </DropdownPanel>
      )}
    </div>
  );
}

function WriteMenu() {
  const { open, setOpen, ref } = useDropdown<HTMLDivElement>();
  const [activeTab, setActiveTab] = useState<WriteTabId>("new-story");
  const snap = useSnapshot(store);
  const router = useRouter()
  const isLoading = !snap.authChecked;
  const isLoggedIn = snap.hydrated && !!snap._id;
  const isCreator = snap.creatorStatus === "active";

  if (isLoading) {
    return (
      <div className="hidden lg:flex">
        <Skeleton className="h-9 w-20 rounded-full" />
      </div>
    );
  }

  if (!isCreator) {
    return (
      <Link
        href={isLoggedIn ? "/creator/apply" : "/sign-in?redirect=/creator/apply"}
        className="hidden items-center gap-1.5 rounded-full border border-hairline px-3.5 py-2 font-sans text-sm font-semibold text-ink-muted transition hover:border-accent hover:text-accent lg:flex"
      >
        <Sparkles size={14} />
        Become a creator
      </Link>
    );
  }
  

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="hidden items-center gap-1.5 cursor-pointer rounded-full bg-accent px-3.5 py-2 font-sans text-sm font-semibold text-accent-ink transition hover:opacity-90 lg:flex"
      >
        <PenSquare size={14} />
        Write
      </button>

      {open && (
        <DropdownPanel width="w-80" label="Write">
          <div className="flex flex-col gap-0.5">
            {WRITE_TABS.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`flex w-full items-center cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 font-sans text-sm font-medium transition ${
                    active ? "bg-accent/10 text-accent" : "text-ink-muted hover:bg-bg hover:text-ink"
                  }`}
                >
                  <t.icon size={15} />
                  {t.label}
                </button>
              );
            })}
          </div>

          <DropdownDivider />

          <div className="flex max-h-72 flex-col gap-1.5 cursor-pointer overflow-y-auto px-1 pb-1">
            {activeTab === "new-story" && (
              <div className="flex flex-col gap-3 px-1.5 py-1">
                <p className="font-sans text-sm text-ink-muted">Start a brand new story from scratch.</p>
                <DropdownItem href="/write" onClick={() => setOpen(false)} icon={FilePlus} variant="accent">
                  Create new story
                </DropdownItem>
              </div>
            )}

            {activeTab === "my-stories" && (
              <div className="flex flex-col gap-1.5 cursor-pointer">
                <p className="px-1.5 py-1 font-sans text-sm text-ink-muted">Your in-progress and published works.</p>
                <DropdownItem href="/dashboard" onClick={() => setOpen(false)}>
                  View all stories →
                </DropdownItem>
              </div>
            )}

            {activeTab === "tools" && (
              <div className="flex flex-col gap-1.5">
                <p className="px-1.5 py-1 font-sans text-sm text-ink-muted">Tools to help you plan and polish your writing.</p>
                {TOOLS.map((tool) => (
                      <DropdownItem
                        key={tool.label}
                        icon={Wrench}
                        onClick={() => router.push(tool.href)}
                      >
                        {tool.label}
                      </DropdownItem>
                    ))}
              </div>
            )}

            {activeTab === "tutorial" && (
              <div className="flex flex-col gap-1.5">
                <p className="px-1.5 py-1 font-sans text-sm text-ink-muted">New to writing on Lore? Start here.</p>
                {GUIDES.map((guide) => (
                  <DropdownItem
                    key={guide.label}
                    icon={Wrench}
                    onClick={() => router.push(guide.href)}
                  >
                    {guide.label}
                  </DropdownItem>
                ))}
              </div>
            )}
          </div>
        </DropdownPanel>
      )}
    </div>
  );
}

function MobileMenu() {
  const { open, setOpen, ref } = useDropdown<HTMLDivElement>();
  const snap = useSnapshot(store);
  const isLoading = !snap.authChecked;
  const isLoggedIn = snap.hydrated && !!snap._id;
  const isCreator = snap.creatorStatus === "active";

  return (
    <div className="relative lg:hidden" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink-muted transition hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-accent"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {open && (
        <DropdownPanel width="w-64" label={isLoading || isLoggedIn ? undefined : "Menu"}>
          {isLoading ? (
            <>
              <AccountHeaderSkeleton />
              <DropdownDivider />
            </>
          ) : isLoggedIn ? (
            <>
              <AccountHeader snap={snap} />

              <div className="my-1.5 flex items-center justify-between rounded-lg bg-bg px-2.5 py-2">
                <span className="font-sans text-xs font-medium text-ink-muted">Coin balance</span>
                <CoinDisplay balance={snap.coinBalance} />
              </div>

              <DropdownDivider />
              <DropdownItem href={`/u/${snap.username}`} onClick={() => setOpen(false)} icon={LayoutDashboard}>
                My profile
              </DropdownItem>
              <DropdownItem href="/history" onClick={() => setOpen(false)} icon={History}>
                Reading history
              </DropdownItem>
              <DropdownDivider />
            </>
          ) : (
            <>
              <DropdownItem href="/sign-up" onClick={() => setOpen(false)} icon={UserPlus} variant="accent">
                Sign up
              </DropdownItem>
              <DropdownItem href="/sign-in" onClick={() => setOpen(false)} icon={LogIn}>
                Sign in
              </DropdownItem>
              <DropdownDivider />
            </>
          )}

          {isCreator && (
            <DropdownItem href="/write" onClick={() => setOpen(false)} icon={PenSquare} variant="accent">
              Start writing
            </DropdownItem>
          )}
          <DropdownItem href="/library" onClick={() => setOpen(false)} icon={Library}>
            My library
          </DropdownItem>

          {!isLoading && (
            <>
              {isCreator ? (
                <DropdownItem href="/dashboard" onClick={() => setOpen(false)} icon={PenSquare}>
                  Creator dashboard
                </DropdownItem>
              ) : (
                <DropdownItem
                  href={isLoggedIn ? "/creator/apply" : "/sign-in?redirect=/creator/apply"}
                  onClick={() => setOpen(false)}
                  icon={Sparkles}
                  variant="gold"
                >
                  Become a creator
                </DropdownItem>
              )}
            </>
          )}

          <DropdownDivider />

          {NAV_LINKS.map((l) => (
            <DropdownItem key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </DropdownItem>
          ))}

          {!isLoading && isLoggedIn && (
            <>
              <DropdownDivider />
              <DropdownItem onClick={() => handleSignOut(() => setOpen(false))} icon={LogOut} variant="danger">
                Sign out
              </DropdownItem>
            </>
          )}
        </DropdownPanel>
      )}
    </div>
  );
}
export function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const snap = useSnapshot(store);
  const isLoading = !snap.authChecked;
  const isLoggedIn = snap.hydrated && !!snap._id;

  return (
    <header className="sticky top-0 z-40 w-full overflow-x-clip border-b border-hairline bg-surface/90 backdrop-blur supports-backdrop-filter:bg-surface/75">
      <div className="mx-auto flex h-16 max-w-7xl min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink"
        >
          <Image src="/logo.png" alt="TipaTale" width={44} height={44} priority className="sm:h-[62px] sm:w-[62px]" />
        </Link>

        <nav className="ml-2 hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="font-sans text-sm font-medium text-ink-muted transition hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden flex-1 max-w-sm items-center md:flex">
          <SearchBox />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 md:ml-3">
          <button
            onClick={() => setSearchOpen((s) => !s)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-hairline text-ink-muted md:hidden"
            aria-label="Search"
          >
            <Search size={16} />
          </button>

          {!isLoading && isLoggedIn && (
            <div className="hidden lg:block">
              <CoinDisplay balance={snap.coinBalance} />
            </div>
          )}

          <ThemeSwitcher />

          <WriteMenu />
          <AccountMenu />
          {!isLoading && isLoggedIn && <MessageBell />}
          {!isLoading && isLoggedIn && <NotificationBell />}

          <MobileMenu />
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-hairline px-4 py-2.5 md:hidden">
          <SearchBox autoFocus onNavigate={() => setSearchOpen(false)} />
        </div>
      )}
    </header>
  );
}