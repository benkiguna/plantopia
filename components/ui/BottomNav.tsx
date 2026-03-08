"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M12 2L2 7v15h20V7L12 2z" />
        <path d="M12 22V12" />
        <path d="M12 12L2 7" />
        <path d="M12 12l10-5" />
      </svg>
    ),
  },
  {
    href: "/add",
    label: "Add",
    isAdd: true,
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
  {
    href: "/insights",
    label: "Insights",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-6 h-6"
      >
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-white/80 backdrop-blur-lg border-t border-forest/10">
        <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            if (item.isAdd) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center w-14 h-14 -mt-4 bg-green rounded-full text-cream shadow-lg transition-transform active:scale-95 hover:bg-green-light"
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
                  isActive ? "text-green" : "text-forest/60 hover:text-forest"
                }`}
              >
                {item.icon}
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="h-safe-area-inset-bottom bg-white/80 backdrop-blur-lg" />
    </nav>
  );
}
