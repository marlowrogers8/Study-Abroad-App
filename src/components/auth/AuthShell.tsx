import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ShieldCheckIcon, StarIcon } from "@/components/icons";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const proofPoints = [
  "12,400+ verified student reviews",
  "Zero paid placements, ever",
  "Real cost & safety data, in the open",
];

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link href="/" className="inline-flex w-fit rounded-lg">
          <Logo />
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">
              {title}
            </h1>
            <p className="mt-2 text-sm text-ink-600">{subtitle}</p>

            {!isSupabaseConfigured && <SetupNotice />}

            <div className="mt-7">{children}</div>

            <p className="mt-6 text-center text-sm text-ink-600">{footer}</p>
          </div>
        </div>

        <p className="text-center text-xs text-ink-400 lg:text-left">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>

      {/* Right — brand panel */}
      <aside className="relative hidden overflow-hidden bg-ink-950 lg:block">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30 bg-dotgrid"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl"
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-brand-200">
            <ShieldCheckIcon className="h-4 w-4" />
            Built on transparency
          </span>

          <div>
            <p className="font-display text-3xl font-semibold leading-snug text-white">
              The only study abroad reviews that aren&apos;t for sale.
            </p>
            <ul className="mt-8 space-y-3">
              {proofPoints.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-ink-100">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500/20 text-brand-300">
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>

          <figure className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex gap-0.5 text-[var(--color-amber-glow)]">
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className="h-4 w-4" />
              ))}
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-ink-100">
              “I almost paid for a program a ‘review’ site pushed on me. Abroadly
              showed me the honest costs — I saved $3,000 and had a better term.”
            </blockquote>
            <figcaption className="mt-3 text-xs text-ink-300">
              Maya T. · studied in Lisbon
            </figcaption>
          </figure>
        </div>
      </aside>
    </main>
  );
}

function SetupNotice() {
  return (
    <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">
      <strong className="font-semibold">Almost there.</strong> Add your Supabase
      keys to <code className="rounded bg-amber-100 px-1">.env.local</code> to
      enable real sign-in. The form below is live but needs credentials to
      authenticate. See <code className="rounded bg-amber-100 px-1">.env.local.example</code>.
    </div>
  );
}
