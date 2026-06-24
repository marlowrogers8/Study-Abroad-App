import Link from "next/link";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";
import { GoogleButton } from "@/components/auth/GoogleButton";

export const metadata: Metadata = { title: "Create account · Abroadly" };

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect = "/account" } = await searchParams;

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free, ad-free, and always honest. Join thousands of students."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/signin" className="font-semibold text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </>
      }
    >
      <GoogleButton redirectTo={redirect} />

      <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-100" />
        or with email
        <span className="h-px flex-1 bg-ink-100" />
      </div>

      <AuthForm mode="signup" redirectTo={redirect} />
    </AuthShell>
  );
}
