import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

// Browser-side Supabase client (used in Client Components).
export function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
