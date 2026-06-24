import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

// Server-side Supabase client (Server Components, Server Actions, Route Handlers).
// In Next.js 15 `cookies()` is async, so this helper is async too.
export async function createClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // `setAll` was called from a Server Component — safe to ignore when
          // middleware is refreshing sessions (it is, see src/middleware.ts).
        }
      },
    },
  });
}
