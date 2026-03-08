"use client";

import { Warning as PhosphorWarning } from "@phosphor-icons/react";

export function WarningIcon({ className }: { className?: string }) {
  return <PhosphorWarning weight="fill" className={className} />;
}
