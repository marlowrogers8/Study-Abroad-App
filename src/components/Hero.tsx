import { AISearch } from "./AISearch";
import { ShieldCheckIcon } from "./icons";

const stats = [
  { value: "12,400+", label: "Verified reviews" },
  { value: "1,900", label: "Programs compared" },
  { value: "84", label: "Countries" },
  { value: "$0", label: "Paid placements" },
];

export function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden border-b border-ink-100 bg-dotgrid"
    >
      {/* Soft brand glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-b from-brand-200/50 to-transparent blur-3xl"
      />

      <div className="container-page relative pb-16 pt-16 sm:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1.5 text-xs font-medium text-brand-700 animate-fade-up">
            <ShieldCheckIcon className="h-4 w-4" />
            Real student reviews · never paid, never sponsored
          </div>

          <h1 className="text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight text-ink-900 sm:text-6xl animate-fade-up">
            Choose your study abroad program with{" "}
            <span className="text-brand-600">total transparency</span>.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-balance text-base leading-relaxed text-ink-600 sm:text-lg animate-fade-up">
            Abroadly is the honest way to compare programs — powered by verified
            student reviews and real data on cost, safety, and outcomes. No
            sponsored rankings. No funnels. Just the truth.
          </p>

          <div className="mt-9 animate-fade-up">
            <AISearch />
          </div>
        </div>

        {/* Stats */}
        <dl className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-100 bg-ink-100 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-white px-4 py-5 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block font-display text-2xl font-semibold text-ink-900 sm:text-3xl">
                  {s.value}
                </span>
                <span className="mt-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
                  {s.label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
