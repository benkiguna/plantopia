import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import webpush from "https://esm.sh/web-push@3.6.6";

// Note: To use this in production, you must set these Supabase secrets:
// - VAPID_PUBLIC_KEY
// - VAPID_PRIVATE_KEY
// - SUPABASE_URL (default available)
// - SUPABASE_SERVICE_ROLE_KEY (default available) 
// - VAPID_SUBJECT (mailto:your-email@example.com)

serve(async () => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@plantopia.app";

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get all users who have a push subscription
    const { data: profiles, error: err } = await supabase
      .from("profiles")
      .select("id, name, push_subscription")
      .not("push_subscription", "is", null);

    if (err) throw err;
    if (!profiles || profiles.length === 0) {
      return new Response("No targetable profiles found", { status: 200 });
    }

    if (vapidPublic && vapidPrivate) {
      webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
    }

    let notificationsSent = 0;

    // This is a simplified cron approach. In reality, we'd hit the same calculation logic 
    // mapped to `care-scheduling` logic, but since Edge functions run in isolation, we either 
    // fetch that script from URL or re-implement / call an RPC/API route.
    // For the sake of this demo, we'll hit our Next.js API route or just send a generic digest to all.
    // A robust future implementation would invoke our `generateCareSchedule` here.
    
    // As a stand-in, let's just send a test blast to everyone with a sub for testing
    for (const profile of profiles) {
      const sub = typeof profile.push_subscription === 'string' 
        ? JSON.parse(profile.push_subscription) 
        : profile.push_subscription;

      const payload = JSON.stringify({
        title: "Plantopia Morning Digest",
        body: `Hi ${profile.name || 'Gardener'}! Check your schedule to see if your plants need care today.`,
        url: "/schedule",
      });

      try {
        if (vapidPublic && vapidPrivate) {
             await webpush.sendNotification(sub, payload);
             notificationsSent++;
        }
      } catch (pushErr) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = pushErr as any;
        console.error("Push Error for user", profile.id, error);
        // If Gone (410), we should ideally clean up the subscription
        if (error.statusCode === 410) {
          await supabase
            .from("profiles")
            .update({ push_subscription: null })
            .eq("id", profile.id);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, notificationsSent }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const error = err as Error;
    return new Response(JSON.stringify({ error: error?.message || "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
