"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

function LeafIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 1.5 : 1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 21c3-3 7-6 12-12C14 5 8 5 4 9s-1 9 2 12z" />
      <path d="M6 21c0-4 2-8 6-12" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 1.5 : 1} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Garden",
    icon: (active) => <LeafIcon active={active} />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (active) => <ProfileIcon active={active} />,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-fit">
      <div className="glass-card px-4 py-3 flex items-center gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-10 py-1.5 rounded-2xl transition-all ${
                isActive
                  ? "text-amber-glow"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-amber-glow/8 shadow-[0_0_12px_rgba(255,213,128,0.1)]" />
              )}
              <span className="relative z-10">{item.icon(isActive)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
