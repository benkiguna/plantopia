import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client (for client components) — singleton pattern
export function createBrowserClient() {
  return createSSRBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Get the current authenticated user's ID from the browser session
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
