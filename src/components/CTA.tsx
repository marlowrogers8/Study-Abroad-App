"use client";

import { useState } from "react";
import { CheckIcon } from "./icons";

export function CTA() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-brand-600 px-6 py-14 text-center sm:px-12 sm:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20 bg-dotgrid"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-balance font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Get the honest take before you commit
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-balance text-base leading-relaxed text-brand-50">
              Join thousands of students using Abroadly to choose their program
              with confidence. Free, and always ad-free.
            </p>

            {done ? (
              <p className="mx-auto mt-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-medium text-white">
                <CheckIcon className="h-5 w-5" />
                You&apos;re on the list — check your inbox.
              </p>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (email.trim()) setDone(true);
                }}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <label htmlFor="cta-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/95 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:bg-white focus-visible:ring-offset-brand-600"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-ink-950 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-900"
                >
                  Get started
                </button>
              </form>
            )}
            <p className="mt-4 text-xs text-brand-100">
              No spam. No selling your data. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
