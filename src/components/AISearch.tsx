"use client";

import { useRef, useState } from "react";
import { aiSuggestions, mockAnswer } from "@/lib/data";
import { SparkleIcon, SearchIcon, StarIcon, ShieldCheckIcon, ArrowRightIcon } from "./icons";

type Status = "idle" | "thinking" | "answered";

export function AISearch() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [submitted, setSubmitted] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function runSearch(q: string) {
    const text = q.trim();
    if (!text) return;
    setSubmitted(text);
    setStatus("thinking");
    if (timer.current) clearTimeout(timer.current);
    // Simulated latency — replaced by a real streaming model call later.
    timer.current = setTimeout(() => setStatus("answered"), 1100);
  }

  return (
    <div id="search" className="mx-auto w-full max-w-3xl scroll-mt-24">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
        className="group relative"
        role="search"
      >
        <div className="flex items-center gap-2 rounded-2xl border border-ink-200 bg-white p-2 shadow-[0_8px_30px_-12px_rgba(12,30,37,0.25)] transition-shadow focus-within:border-brand-400 focus-within:shadow-[0_12px_40px_-12px_rgba(10,141,132,0.35)]">
          <span className="pl-3 text-brand-600" aria-hidden="true">
            <SparkleIcon className="h-5 w-5" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything — “affordable engineering programs in Japan with housing”"
            aria-label="Search study abroad programs with AI"
            className="min-w-0 flex-1 bg-transparent py-2.5 text-[0.95rem] text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.98]"
          >
            <SearchIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </form>

      {/* Suggestion chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
          Try
        </span>
        {aiSuggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuery(s);
              runSearch(s);
            }}
            className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Results panel */}
      {status !== "idle" && (
        <div
          className="mt-6 overflow-hidden rounded-2xl border border-ink-100 bg-white text-left shadow-[0_20px_60px_-24px_rgba(12,30,37,0.3)] animate-fade-up"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 border-b border-ink-100 bg-ink-50/60 px-5 py-3">
            <SparkleIcon className="h-4 w-4 text-brand-600" />
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Abroadly AI · transparent matches
            </span>
          </div>

          {status === "thinking" ? (
            <ThinkingState query={submitted} />
          ) : (
            <AnswerState query={submitted} />
          )}
        </div>
      )}
    </div>
  );
}

function ThinkingState({ query }: { query: string }) {
  return (
    <div className="px-5 py-5">
      <p className="text-sm text-ink-500">
        Reading verified reviews for{" "}
        <span className="font-medium text-ink-800">“{query}”</span>…
      </p>
      <div className="mt-4 space-y-2.5">
        {[100, 85, 70].map((w) => (
          <div
            key={w}
            className="relative h-3 overflow-hidden rounded-full bg-ink-100"
            style={{ width: `${w}%` }}
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/70 to-transparent [animation:shimmer_1.4s_infinite]" />
          </div>
        ))}
      </div>
    </div>
  );
}

function AnswerState({ query }: { query: string }) {
  return (
    <div className="px-5 py-5">
      <p className="text-sm leading-relaxed text-ink-700">
        <span className="font-medium text-ink-900">“{query}”</span> — {mockAnswer.summary}
      </p>

      <ul className="mt-4 space-y-3">
        {mockAnswer.matches.map((m) => (
          <li
            key={m.id}
            className="flex items-center gap-4 rounded-xl border border-ink-100 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
              {m.grade}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink-900">
                {m.flag} {m.name}
              </p>
              <p className="truncate text-xs text-ink-500">
                {m.city}, {m.country} · ${m.cost.total.toLocaleString()} total
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-800">
              <StarIcon className="h-4 w-4 text-[var(--color-amber-glow)]" />
              {m.rating}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
        <p className="flex items-center gap-1.5 text-xs text-ink-500">
          <ShieldCheckIcon className="h-4 w-4 text-brand-600" />
          Ranked only by verified reviews — no paid placements.
        </p>
        <a
          href="#programs"
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          See all
          <ArrowRightIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
