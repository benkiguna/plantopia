import { ReactNode } from "react";

interface TopBarProps {
  title?: string;
  children?: ReactNode;
  showBack?: boolean;
  transparent?: boolean;
}

export function TopBar({
  title,
  children,
  showBack = false,
  transparent = false,
}: TopBarProps) {
  return (
    <header
      className={`sticky top-0 z-40 ${
        transparent
          ? "bg-transparent"
          : "bg-charcoal/80 backdrop-blur-lg border-b border-white/5"
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-3 w-full">
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {title && (
            <h1 className="text-xl font-display font-semibold text-white">
              {title}
            </h1>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </header>
  );
}
