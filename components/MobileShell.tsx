"use client";

import { ReactNode } from "react";
import { BottomNav, TopBar } from "@/components/ui";

interface MobileShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showNav?: boolean;
  topBarContent?: ReactNode;
  transparentHeader?: boolean;
}

export function MobileShell({
  children,
  title,
  showBack = false,
  showNav = true,
  topBarContent,
  transparentHeader = false,
}: MobileShellProps) {
  return (
    <div className="min-h-dvh flex flex-col max-w-md mx-auto bg-cream">
      {(title || topBarContent || showBack) && (
        <TopBar title={title} showBack={showBack} transparent={transparentHeader}>
          {topBarContent}
        </TopBar>
      )}
      <main className={`flex-1 ${showNav ? "pb-20" : ""}`}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
