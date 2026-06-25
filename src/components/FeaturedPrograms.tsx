import Link from "next/link";
import { featuredPrograms } from "@/lib/data";
import { ProgramCard } from "./programs/ProgramCard";
import { ShieldCheckIcon, ArrowRightIcon } from "./icons";

export function FeaturedPrograms() {
  return (
    <section id="programs" className="scroll-mt-20 bg-ink-50/60 py-20 sm:py-28">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Top rated this term
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Programs students actually recommend
            </h2>
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
            <ShieldCheckIcon className="h-4 w-4 text-brand-600" />
            Ranked by verified reviews, not by who paid
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredPrograms.map((p) => (
            <ProgramCard key={p.id} p={p} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/programs"
            className="inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-5 py-2.5 text-sm font-semibold text-ink-800 transition-colors hover:border-brand-300 hover:text-brand-700"
          >
            Browse all programs
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
