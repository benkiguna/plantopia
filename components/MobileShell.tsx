"use client";

import { ReactNode } from "react";
import { TopBar, BottomNav } from "@/components/ui";

interface MobileShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  topBarContent?: ReactNode;
  transparentHeader?: boolean;
}

export function MobileShell({
  children,
  title,
  showBack = false,
  topBarContent,
  transparentHeader = false,
}: MobileShellProps) {
  return (
    <div className="min-h-dvh flex flex-col max-w-md mx-auto bg-transparent relative">
{/* ambient glow removed — body radial-gradient is the background */}

      {(title || topBarContent || showBack) && (
        <TopBar title={title} showBack={showBack} transparent={transparentHeader}>
          {topBarContent}
        </TopBar>
      )}
      <main className={`flex-1 ${transparentHeader ? "-mt-14" : ""}`}>{children}</main>
      <BottomNav />
    </div>
  );
}
