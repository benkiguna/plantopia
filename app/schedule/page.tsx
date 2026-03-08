import { redirect } from "next/navigation";
import { createSimpleServerClient } from "@/lib/supabase/server";
import { getScheduleForUser } from "@/lib/data/schedule";
import ScheduleViewClient from "./ScheduleViewClient";

export const metadata = {
  title: "Care Schedule | Plantopia",
  description: "View and manage your upcoming plant care tasks.",
};

export default async function SchedulePage() {
  const supabase = createSimpleServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const initialSchedule = await getScheduleForUser(session.user.id);

  return <ScheduleViewClient initialSchedule={initialSchedule} />;
}
