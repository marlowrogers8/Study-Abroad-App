"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AuthState = { error: string | null; message?: string | null };

const NOT_CONFIGURED =
  "Sign-in isn't connected yet. Add your Supabase keys to .env.local to enable it.";

function readCredentials(formData: FormData) {
  return {
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim(),
    redirectTo: String(formData.get("redirect") ?? "/account"),
  };
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const { email, password, redirectTo } = readCredentials(formData);
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect(redirectTo || "/account");
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) return { error: NOT_CONFIGURED };

  const { email, password, fullName } = readCredentials(formData);
  if (!email || !password) {
    return { error: "Enter your email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) return { error: error.message };

  // If email confirmation is on, there's no session yet — tell the user.
  if (data.user && !data.session) {
    return {
      error: null,
      message: "Check your inbox to confirm your email, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
