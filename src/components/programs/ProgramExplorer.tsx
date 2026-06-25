"use client";

import { useMemo, useState } from "react";
import type { Program } from "@/lib/data";
import { ProgramCard } from "./ProgramCard";
import { SearchIcon, ShieldCheckIcon } from "../icons";

type SortKey = "rating" | "cost" | "safety" | "reviews";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "rating", label: "Highest rated" },
  { key: "cost", label: "Lowest total cost" },
  { key: "safety", label: "Safest first" },
  { key: "reviews", label: "Most reviews" },
];

const COST_TIERS = [
  { label: "Any budget", max: Infinity },
  { label: "Under $18k", max: 18000 },
  { label: "Under $22k", max: 22000 },
  { label: "Under $26k", max: 26000 },
];

export function ProgramExplorer({
  programs,
  initialCountry = "",
}: {
  programs: Program[];
  initialCountry?: string;
}) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState(initialCountry);
  const [field, setField] = useState("");
  const [costTier, setCostTier] = useState(0);
  const [sort, setSort] = useState<SortKey>("rating");
  const [finAid, setFinAid] = useState(false);
  const [housingIncluded, setHousingIncluded] = useState(false);
  const [lgbtqSafe, setLgbtqSafe] = useState(false);
  const [safestOnly, setSafestOnly] = useState(false);

  const countries = useMemo(
    () => [...new Set(programs.map((p) => p.country))].sort(),
    [programs]
  );
  const fields = useMemo(
    () => [...new Set(programs.flatMap((p) => p.fieldsOfStudy))].sort(),
    [programs]
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = programs.filter((p) => {
      if (q) {
        const hay = [
          p.name,
          p.city,
          p.country,
          p.provider,
          ...p.fieldsOfStudy,
          ...p.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (country && p.country !== country) return false;
      if (field && !p.fieldsOfStudy.includes(field)) return false;
      if (p.cost.total > COST_TIERS[costTier].max) return false;
      if (finAid && !p.financialAidAccepted) return false;
      if (housingIncluded && p.cost.housingEstimate !== 0) return false;
      if (lgbtqSafe && p.lgbtqTier !== "generally safe") return false;
      if (safestOnly && p.stateDeptAdvisoryLevel > 1) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "cost":
          return a.cost.total - b.cost.total;
        case "safety":
          return (
            a.stateDeptAdvisoryLevel - b.stateDeptAdvisoryLevel ||
            b.soloFemaleSafetyScore - a.soloFemaleSafetyScore
          );
        case "reviews":
          return b.reviewCount - a.reviewCount;
        default:
          return b.rating - a.rating;
      }
    });
  }, [
    programs,
    query,
    country,
    field,
    costTier,
    sort,
    finAid,
    housingIncluded,
    lgbtqSafe,
    safestOnly,
  ]);

  const selectCls =
    "rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm text-ink-800 focus:border-brand-400 focus:outline-none";

  return (
    <div>
      {/* Search + selects */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-ink-200 bg-white px-3 shadow-sm focus-within:border-brand-400">
          <SearchIcon className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search programs, cities, fields…"
            aria-label="Search programs"
            className="w-full bg-transparent py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            aria-label="Filter by country"
            className={selectCls}
          >
            <option value="">All countries</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={field}
            onChange={(e) => setField(e.target.value)}
            aria-label="Filter by field of study"
            className={selectCls}
          >
            <option value="">All fields</option>
            {fields.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select
            value={costTier}
            onChange={(e) => setCostTier(Number(e.target.value))}
            aria-label="Filter by total cost"
            className={selectCls}
          >
            {COST_TIERS.map((t, i) => (
              <option key={t.label} value={i}>
                {t.label}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            aria-label="Sort programs"
            className={selectCls}
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Toggle chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Toggle on={finAid} onClick={() => setFinAid((v) => !v)}>
          Accepts financial aid
        </Toggle>
        <Toggle on={housingIncluded} onClick={() => setHousingIncluded((v) => !v)}>
          Housing included
        </Toggle>
        <Toggle on={lgbtqSafe} onClick={() => setLgbtqSafe((v) => !v)}>
          LGBTQ+ safe
        </Toggle>
        <Toggle on={safestOnly} onClick={() => setSafestOnly((v) => !v)}>
          Level 1 safety only
        </Toggle>
      </div>

      {/* Result meta */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-500">
          {results.length} {results.length === 1 ? "program" : "programs"}
        </p>
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500">
          <ShieldCheckIcon className="h-4 w-4 text-brand-600" />
          Ranked by verified reviews, never by who paid
        </p>
      </div>

      {/* Grid */}
      {results.length > 0 ? (
        <div className="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => (
            <ProgramCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-ink-200 py-16 text-center">
          <p className="text-sm font-medium text-ink-700">No programs match those filters.</p>
          <p className="mt-1 text-sm text-ink-500">Try widening your budget or clearing a filter.</p>
        </div>
      )}
    </div>
  );
}

function Toggle({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        on
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-ink-200 bg-white text-ink-600 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}
