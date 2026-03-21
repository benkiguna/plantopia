import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { MobileShell } from "@/components/MobileShell";
import { SettingsView } from "@/components/SettingsView";

export const metadata = {
  title: "Settings | Plantopia",
};

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  return (
    <MobileShell>
      <SettingsView user={{ id: user.id, email: user.email ?? "", name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null, avatarUrl: user.user_metadata?.avatar_url ?? null }} />
    </MobileShell>
  );
}
