import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getScheduleForUser } from "@/lib/data/schedule";
import ScheduleViewClient from "./ScheduleViewClient";

export const metadata = {
  title: "Care Schedule | Plantopia",
  description: "View and manage your upcoming plant care tasks.",
};

export default async function SchedulePage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const initialSchedule = await getScheduleForUser(user.id);

  return <ScheduleViewClient initialSchedule={initialSchedule} />;
}
