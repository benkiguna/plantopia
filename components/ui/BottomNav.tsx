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

function TrowelIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 1.5 : 1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ClockIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 1.5 : 1} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GearIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 1.5 : 1} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (active) => <LeafIcon active={active} />,
  },
  {
    href: "/add",
    label: "Collection",
    icon: (active) => <TrowelIcon active={active} />,
  },
  {
    href: "/schedule",
    label: "History",
    icon: (active) => <ClockIcon active={active} />,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (active) => <GearIcon active={active} />,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-40px)] max-w-sm">
      <div className="glass-card px-2 py-3 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all ${
                isActive
                  ? "text-amber-glow"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {/* Active glow background */}
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
