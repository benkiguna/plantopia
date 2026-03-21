"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase";

interface SettingsViewProps {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push("/auth");
  };

  const displayName = user.name || user.email.split("@")[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="px-4 pt-14 pb-32">
      <div className="pt-6 pb-2">
        <p className="font-sans text-[11px] text-white/50 tracking-[0.12em] uppercase">Account</p>
        <h1 className="font-serif text-[32px] font-bold text-text-light leading-tight">Settings</h1>
      </div>

      {/* Profile card */}
      <div className="glass-card p-5 flex items-center gap-4 mt-4">
        {user.avatarUrl ? (
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0">
            <Image src={user.avatarUrl} alt={displayName} fill className="object-cover" sizes="56px" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-full bg-glass-emerald/20 border border-white/10 flex items-center justify-center shrink-0">
            <span className="font-serif text-[20px] font-bold text-neon-emerald">{initials}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="font-sans font-semibold text-white text-[15px] truncate">{displayName}</p>
          <p className="font-sans text-[12px] text-white/50 truncate">{user.email}</p>
        </div>
      </div>

      {/* Sign out */}
      <div className="mt-6">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="w-full py-4 rounded-2xl text-[13px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {signingOut ? "Signing out…" : "Sign Out"}
        </button>
      </div>
    </div>
  );
}
