import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { allPrograms, getProgramById } from "@/lib/data";
import {
  formatUSD,
  formatDate,
  languageLabel,
  ADVISORY,
  TONE_CLASSES,
  LGBTQ_TONE,
} from "@/lib/format";
import {
  StarIcon,
  ShieldCheckIcon,
  CheckIcon,
  ArrowRightIcon,
  GlobeIcon,
} from "@/components/icons";

export function generateStaticParams() {
  return allPrograms.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const p = getProgramById(id);
  if (!p) return { title: "Program not found · Abroadly" };
  return {
    title: `${p.name} · Abroadly`,
    description: `${p.city}, ${p.country}. True all-in cost ${formatUSD(
      p.cost.total
    )}. ${p.blurb}`,
  };
}

export default async function ProgramDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = getProgramById(id);
  if (!p) notFound();

  const advisory = ADVISORY[p.stateDeptAdvisoryLevel];
  const hasAdvisorIntel =
    p.advisorHighlights.length > 0 ||
    p.advisorRedFlags.length > 0 ||
    p.advisorRecommendationRate !== null;

  const costRows: { label: string; value: number; emptyLabel?: string }[] = [
    { label: "Program fee", value: p.cost.programFee },
    { label: "Housing", value: p.cost.housingEstimate, emptyLabel: "Included" },
    { label: "Food", value: p.cost.foodEstimate, emptyLabel: "Included" },
    { label: "Flights (round-trip)", value: p.cost.flightEstimate },
    { label: "Student visa", value: p.cost.visaFee, emptyLabel: "None required" },
    {
      label: "Required insurance",
      value: p.cost.insuranceRequired,
      emptyLabel: "Included",
    },
  ];

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="border-b border-ink-100 bg-ink-950">
          <div className="container-page py-10 sm:py-14">
            <Link
              href="/programs"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-200 transition-colors hover:text-white"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-180" />
              All programs
            </Link>

            <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-brand-300">{p.provider}</p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {p.flag} {p.name}
                </h1>
                <p className="mt-2 text-ink-200">
                  {p.city}, {p.country}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                  <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                    <StarIcon className="h-4 w-4 text-[var(--color-amber-glow)]" />
                    {p.rating}
                    <span className="font-normal text-ink-300">
                      ({p.reviewCount.toLocaleString()} reviews)
                    </span>
                  </span>
                  <span className="font-semibold text-white">
                    {formatUSD(p.cost.total)} all-in
                  </span>
                </div>
              </div>

              <div
                className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-500 text-white"
                title="Student review grade"
              >
                <span className="text-2xl font-bold leading-none">{p.grade}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        <div className="container-page grid gap-10 py-12 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-10">
            {/* Summary */}
            <Section title="The honest summary">
              <p className="leading-relaxed text-ink-700">{p.blurb}</p>
            </Section>

            {/* True cost */}
            <Section
              title="True cost breakdown"
              note="What you'll actually spend, not just the program fee."
            >
              <div className="overflow-hidden rounded-2xl border border-ink-100">
                {costRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5 last:border-0"
                  >
                    <span className="text-sm text-ink-600">{row.label}</span>
                    <span className="text-sm font-semibold text-ink-900">
                      {row.value === 0 && row.emptyLabel ? (
                        <span className="text-brand-600">{row.emptyLabel}</span>
                      ) : (
                        formatUSD(row.value)
                      )}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between bg-ink-950 px-5 py-4">
                  <span className="text-sm font-semibold text-white">
                    True total per term
                  </span>
                  <span className="text-lg font-bold text-white">
                    {formatUSD(p.cost.total)}
                  </span>
                </div>
              </div>

              {p.hiddenCosts.length > 0 && (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-800">
                    Costs students underestimate
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {p.hiddenCosts.map((c) => (
                      <li key={c} className="flex gap-2 text-sm text-amber-900">
                        <span aria-hidden="true">•</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>

            {/* Safety */}
            <Section title="Safety & wellbeing">
              <div className="grid gap-4 sm:grid-cols-2">
                <Tile label="US State Dept advisory">
                  <span
                    className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${TONE_CLASSES[advisory.tone]}`}
                  >
                    {advisory.label}
                  </span>
                </Tile>
                <Tile label="LGBTQ+ climate">
                  <span
                    className={`inline-block rounded-lg px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${TONE_CLASSES[LGBTQ_TONE[p.lgbtqTier]]}`}
                  >
                    {p.lgbtqTier}
                  </span>
                </Tile>
                <Tile label="Solo-female safety score">
                  <span className="text-lg font-bold text-ink-900">
                    {p.soloFemaleSafetyScore}
                    <span className="text-sm font-normal text-ink-500"> / 10</span>
                  </span>
                </Tile>
                <Tile label="Crime index (lower is safer)">
                  <span className="text-lg font-bold text-ink-900">
                    {p.crimeIndex}
                    <span className="text-sm font-normal text-ink-500"> / 100</span>
                  </span>
                </Tile>
              </div>
              {p.safetyNotes && (
                <p className="mt-4 rounded-xl bg-ink-50 p-4 text-sm leading-relaxed text-ink-700">
                  {p.safetyNotes}
                </p>
              )}
            </Section>

            {/* Academics */}
            <Section title="Academics & credit">
              <div className="grid gap-4 sm:grid-cols-2">
                <Tile label="Credit transfer success">
                  <span className="text-lg font-bold text-ink-900">
                    {p.creditTransferRate}%
                  </span>
                </Tile>
                <Tile label="Language">
                  <span className="text-sm font-semibold text-ink-900">
                    {languageLabel(p.languageBarrierScore)}
                  </span>
                </Tile>
                <Tile label="Fields of study">
                  <div className="flex flex-wrap gap-1.5">
                    {p.fieldsOfStudy.map((f) => (
                      <span
                        key={f}
                        className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </Tile>
                <Tile label="Terms offered">
                  <span className="text-sm font-semibold capitalize text-ink-900">
                    {p.durationOptions.join(", ")}
                  </span>
                </Tile>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.pellGrantEligible && <Badge>Pell Grant eligible</Badge>}
                {p.financialAidAccepted && <Badge>Accepts financial aid</Badge>}
                {p.internshipsAvailable && <Badge>Internships available</Badge>}
                {p.coopEligible && <Badge>Co-op eligible</Badge>}
              </div>
            </Section>

            {/* Advisor intelligence */}
            {hasAdvisorIntel && (
              <Section
                title="What advisors say"
                note="Sourced directly from university study abroad advisors."
              >
                {p.advisorRecommendationRate !== null && (
                  <p className="mb-4 text-sm text-ink-700">
                    <span className="font-semibold text-ink-900">
                      {p.advisorRecommendationRate}%
                    </span>{" "}
                    of advisors we surveyed recommend this program.
                  </p>
                )}
                {p.advisorHighlights.length > 0 && (
                  <ul className="space-y-2">
                    {p.advisorHighlights.map((h) => (
                      <li key={h} className="flex gap-2 text-sm text-ink-700">
                        <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        {h}
                      </li>
                    ))}
                  </ul>
                )}
                {p.advisorRedFlags.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                    <p className="text-sm font-semibold text-red-800">Advisor cautions</p>
                    <ul className="mt-2 space-y-1.5">
                      {p.advisorRedFlags.map((f) => (
                        <li key={f} className="flex gap-2 text-sm text-red-900">
                          <span aria-hidden="true">•</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {p.scholarships.length > 0 && (
              <div className="rounded-2xl border border-ink-100 bg-white p-5">
                <h3 className="font-display text-lg font-semibold text-ink-900">
                  Scholarships
                </h3>
                <ul className="mt-3 space-y-3">
                  {p.scholarships.map((s) => (
                    <li key={s.name} className="text-sm">
                      <p className="font-medium text-ink-900">{s.name}</p>
                      {s.amount > 0 && (
                        <p className="text-brand-700">up to {formatUSD(s.amount)}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border border-ink-100 bg-white p-5">
              <h3 className="font-display text-lg font-semibold text-ink-900">
                Application deadlines
              </h3>
              <ul className="mt-3 space-y-2">
                {p.applicationWindows.map((w) => (
                  <li
                    key={w.term}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-ink-600">{w.term}</span>
                    <span className="font-medium text-ink-900">
                      {formatDate(w.deadline)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <a
                href={p.programUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <GlobeIcon className="h-4 w-4" />
                Visit the official program site
              </a>
              <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-brand-800">
                <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
                Abroadly earns nothing from this link. We never take referral fees or
                sponsorships from programs.
              </p>
            </div>

            <p className="px-1 text-xs text-ink-400">
              Data last updated {formatDate(p.lastUpdated)}.
            </p>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900">
        {title}
      </h2>
      {note && <p className="mt-1 text-sm text-ink-500">{note}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
        {label}
      </p>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-ink-900 px-3 py-1 text-xs font-medium text-white">
      <CheckIcon className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}
