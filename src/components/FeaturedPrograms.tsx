import { featuredPrograms, type Program } from "@/lib/data";
import { StarIcon, ArrowRightIcon, ShieldCheckIcon } from "./icons";

function ProgramCard({ p }: { p: Program }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition-all hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(12,30,37,0.35)]">
      {/* Header band with grade */}
      <div className="relative flex items-center justify-between bg-ink-950 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">
            {p.flag} {p.name}
          </p>
          <p className="text-xs text-ink-200">
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
          <span className="text-ink-500">{p.reviews} reviews</span>
          <span className="ml-auto font-semibold text-ink-900">{p.costPerTerm}</span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-600">{p.blurb}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700"
            >
              {t}
            </span>
          ))}
        </div>

        <a
          href="#"
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
        >
          Read student reviews
          <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
    </article>
  );
}

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
            Ranked by verified reviews — not by who paid
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredPrograms.map((p) => (
            <ProgramCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
