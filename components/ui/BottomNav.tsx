"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Plant, Calendar, Plus, Sparkle } from "@phosphor-icons/react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  isAdd?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Garden",
    icon: <Plant weight="bold" className="w-6 h-6" />,
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: <Calendar weight="bold" className="w-6 h-6" />,
  },
  {
    href: "/add",
    label: "Add",
    isAdd: true,
    icon: <Plus weight="bold" className="w-7 h-7 flex-shrink-0" />,
  },
  {
    href: "/insights",
    label: "Insights",
    icon: <Sparkle weight="bold" className="w-6 h-6" />,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-charcoal/80 backdrop-blur-xl border-t border-white/5">
        <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.isAdd) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center w-14 h-14 -mt-4 bg-neon-emerald rounded-[20px] text-charcoal shadow-[0_0_20px_rgba(34,211,138,0.3)] transition-transform active:scale-95 hover:brightness-110"
                  aria-label={item.label}
                >
                  {item.icon}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? "text-neon-emerald" : "text-white/40 hover:text-white/80"
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-mono tracking-widest uppercase">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-safe-area-inset-bottom bg-charcoal/90 backdrop-blur-xl" />
    </nav>
  );
}
