// Centralised env access so a missing key fails with a clear, actionable
// message instead of a cryptic Supabase error. These are read at runtime
// (inside request handlers / actions), never at build time.

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase is not configured. Copy .env.local.example to .env.local and " +
        "fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY " +
        "from your Supabase project (Settings → API).",
    );
  }

  return { url, anonKey };
}

// True when both keys are present — used to render a friendly setup notice
// in the UI rather than throwing.
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
