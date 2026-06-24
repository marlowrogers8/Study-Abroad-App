import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";

export const metadata: Metadata = { title: "Sign in · Abroadly" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const { redirect = "/account", error } = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to save programs and write verified reviews."
      footer={
        <>
          New to Abroadly?{" "}
          <Link href="/signup" className="font-semibold text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </>
      }
    >
      {error && (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          Something went wrong with that sign-in. Please try again.
        </p>
      )}

      <GoogleButton redirectTo={redirect} />

      <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-100" />
        or with email
        <span className="h-px flex-1 bg-ink-100" />
      </div>

      <AuthForm mode="signin" redirectTo={redirect} />
    </AuthShell>
  );
}
