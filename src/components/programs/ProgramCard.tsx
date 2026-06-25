import Link from "next/link";
import type { Program } from "@/lib/data";
import { formatUSD } from "@/lib/format";
import { StarIcon, ArrowRightIcon } from "../icons";

export function ProgramCard({ p }: { p: Program }) {
  return (
    <Link
      href={`/programs/${p.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(12,30,37,0.35)]"
    >
      {/* Header band with grade */}
      <div className="relative flex items-center justify-between bg-ink-950 px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {p.flag} {p.name}
          </p>
          <p className="truncate text-xs text-ink-200">
            {p.city}, {p.country}
          </p>
        </div>
        <div
          className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-500 text-white"
          title="Student review grade"
        >
          <span className="text-lg font-bold leading-none">{p.grade}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 font-semibold text-ink-900">
            <StarIcon className="h-4 w-4 text-[var(--color-amber-glow)]" />
            {p.rating}
          </span>
          <span className="text-ink-400">·</span>
          <span className="text-ink-500">{p.reviewCount.toLocaleString()} reviews</span>
          <span className="ml-auto font-semibold text-ink-900">
            {formatUSD(p.cost.total)} all-in
          </span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">{p.blurb}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {p.tags.slice(0, 4).map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
            >
              {t}
            </span>
          ))}
        </div>

        <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 group-hover:text-brand-800">
          See the full breakdown
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
