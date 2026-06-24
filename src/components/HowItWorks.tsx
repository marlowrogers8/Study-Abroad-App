const steps = [
  {
    n: "01",
    title: "Ask in plain language",
    body: "Describe what matters to you — budget, field of study, safety, vibe. Our AI search reads thousands of verified reviews to find real matches.",
  },
  {
    n: "02",
    title: "Compare honest data",
    body: "See median costs, hidden fees, safety reports and outcomes side by side. Every program is graded on student reviews alone.",
  },
  {
    n: "03",
    title: "Decide with confidence",
    body: "Shortlist, read full student stories, and apply directly — knowing nothing on the page was paid for or sponsored.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-ink-950 py-20 text-white sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">
            How it works
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            From overwhelmed to confident in three steps
          </h2>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.n} className="relative">
              {i < steps.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-8 top-7 hidden h-px w-full bg-gradient-to-r from-white/25 to-transparent md:block"
                />
              )}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 font-display text-lg font-semibold text-brand-300">
                {s.n}
              </div>
              <h3 className="mt-5 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-200">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
