import { destinations } from "@/lib/data";
import { ArrowRightIcon } from "./icons";

export function Destinations() {
  return (
    <section id="destinations" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Explore
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
              Browse by destination
            </h2>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            All 84 countries
            <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {destinations.map((d) => (
            <a
              key={d.country}
              href="#"
              className={`group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br ${d.gradient} p-4 ring-1 ring-inset ring-black/5 transition-transform hover:-translate-y-1`}
            >
              <span
                aria-hidden="true"
                className="absolute right-3 top-3 text-2xl opacity-90 transition-transform group-hover:scale-110"
              >
                {d.flag}
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent"
              />
              <span className="relative">
                <span className="block text-base font-semibold text-white drop-shadow-sm">
                  {d.country}
                </span>
                <span className="block text-xs font-medium text-white/85">
                  {d.programCount} programs
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
