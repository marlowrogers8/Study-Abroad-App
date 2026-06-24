import {
  ShieldCheckIcon,
  NoMoneyIcon,
  ChartIcon,
  UsersIcon,
} from "./icons";

const pillars = [
  {
    icon: ShieldCheckIcon,
    title: "Verified reviews only",
    body: "Every review is tied to a confirmed program enrollment. No bots, no astroturf — just students who were actually there.",
  },
  {
    icon: NoMoneyIcon,
    title: "Zero paid placements",
    body: "Programs can't buy a higher ranking or a featured spot. We don't take referral kickbacks that bias what you see.",
  },
  {
    icon: ChartIcon,
    title: "Real data, in the open",
    body: "Median costs, hidden fees, safety reports and post-program outcomes — sourced from students and shown plainly.",
  },
  {
    icon: UsersIcon,
    title: "Built for students",
    body: "No funnels steering you toward whoever pays us. Our only incentive is helping you find your genuine best fit.",
  },
];

export function Differentiators() {
  return (
    <section id="why" className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Who we are
          </p>
          <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">
            The study abroad industry runs on paid funnels. We don&apos;t.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-balance text-base leading-relaxed text-ink-600">
            Most sites earn a commission for sending you to specific programs, so
            their “reviews” and rankings are quietly for sale. Abroadly was built
            on the opposite promise: complete transparency.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-ink-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_18px_40px_-20px_rgba(10,141,132,0.4)]"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                <p.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-ink-900">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
