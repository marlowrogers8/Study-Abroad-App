import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { signOut } from "@/app/auth/actions";
import { Logo } from "@/components/Logo";
import { ShieldCheckIcon } from "@/components/icons";

export const metadata: Metadata = { title: "Your account · Abroadly" };

// Auth depends on per-request cookies — never prerender.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  // Without Supabase keys there's no auth — send users to sign in rather
  // than throwing. (Middleware can't guard this route until keys exist.)
  if (!isSupabaseConfigured) redirect("/signin?redirect=/account");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: middleware already guards /account, but re-check here.
  if (!user) redirect("/signin?redirect=/account");

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "there";

  return (
    <div className="min-h-screen bg-ink-50/50">
      <header className="border-b border-ink-100 bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link href="/" className="rounded-lg">
            <Logo />
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container-page py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Your account
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900">
          Welcome, {name} 👋
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-600">
          You&apos;re signed in. This is a protected page — only authenticated
          students can see it.
        </p>

        <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-ink-100 bg-white p-6">
            <h2 className="text-sm font-semibold text-ink-900">Signed in as</h2>
            <p className="mt-1 break-all text-sm text-ink-600">{user.email}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-700">
              <ShieldCheckIcon className="h-4 w-4" />
              Verified session
            </p>
          </div>

          <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-6">
            <h2 className="text-sm font-semibold text-ink-900">Coming soon</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-ink-600">
              <li>· Saved programs</li>
              <li>· Your verified reviews</li>
              <li>· Application tracker</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
