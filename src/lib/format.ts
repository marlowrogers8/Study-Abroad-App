// Display helpers shared across program pages.

export function formatUSD(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// US State Dept travel advisory levels, with a UI tone for the badge.
export const ADVISORY = {
  1: { label: "Level 1 · Exercise normal precautions", tone: "green" as const },
  2: { label: "Level 2 · Exercise increased caution", tone: "amber" as const },
  3: { label: "Level 3 · Reconsider travel", tone: "orange" as const },
  4: { label: "Level 4 · Do not travel", tone: "red" as const },
};

export const TONE_CLASSES: Record<string, string> = {
  green: "bg-brand-50 text-brand-700 ring-brand-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  orange: "bg-orange-50 text-orange-700 ring-orange-200",
  red: "bg-red-50 text-red-700 ring-red-200",
};

export const LGBTQ_TONE: Record<string, string> = {
  "generally safe": "green",
  caution: "amber",
  hostile: "red",
};

// Lower language-barrier score = more English spoken.
export function languageLabel(score: number): string {
  if (score <= 1) return "English widely spoken";
  if (score <= 4) return "Some local language helpful";
  if (score <= 7) return "Strong immersion";
  return "Full immersion";
}
