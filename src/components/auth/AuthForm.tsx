"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";
import { CheckIcon } from "@/components/icons";

const initialState: AuthState = { error: null, message: null };

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-1 w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.99] disabled:opacity-70"
    >
      {pending ? "One moment…" : label}
    </button>
  );
}

export function AuthForm({
  mode,
  redirectTo = "/account",
}: {
  mode: "signin" | "signup";
  redirectTo?: string;
}) {
  const action = mode === "signin" ? signIn : signUp;
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />

      {mode === "signup" && (
        <Field
          id="fullName"
          name="fullName"
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Jordan Rivera"
        />
      )}

      <Field
        id="email"
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@university.edu"
        required
      />

      <Field
        id="password"
        name="password"
        label="Password"
        type="password"
        autoComplete={mode === "signin" ? "current-password" : "new-password"}
        placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
        required
      />

      {state.error && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      )}

      {state.message && (
        <p className="flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800">
          <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      <SubmitButton label={mode === "signin" ? "Sign in" : "Create account"} />
    </form>
  );
}

function Field({
  id,
  label,
  ...props
}: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-800">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="w-full rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 transition-colors focus:border-brand-400"
      />
    </div>
  );
}
