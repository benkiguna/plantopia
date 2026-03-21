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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        transparent
          ? "bg-transparent"
          : "backdrop-blur-xl bg-black/5 border-b border-white/[0.03]"
      }`}
    >
      <div className="max-w-md mx-auto flex items-center h-20 px-6">
        {/* Left Section: Back Button */}
        <div className="flex items-center w-12">
          {showBack && (
            <button
              onClick={() => window.history.back()}
              className="p-2 -ml-2 text-white/40 hover:text-white transition-all duration-300 active:scale-90"
              aria-label="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2" // Thinned out for a "scientific instrument" feel
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6"
              >
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Center Section: Serif Italic Title */}
        <div className="flex-1 flex justify-center">
          {title && (
            <h1 className="text-xl font-serif italic text-white/90 tracking-tight">
              {title}
            </h1>
          )}
        </div>

        {/* Right Section: Actions/Children */}
        <div className="flex items-center justify-end w-12">
          {children && (
            <div className="flex items-center gap-2">{children}</div>
          )}
        </div>
      </div>
    </header>
  );
}
