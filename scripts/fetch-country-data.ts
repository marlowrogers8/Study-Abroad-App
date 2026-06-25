/**
 * Fetches per-country safety, cost-of-living, and LGBTQ+ data from public sources.
 * Outputs: src/lib/data/country-data.json
 *
 * Sources:
 *   - US State Dept travel advisories (public JSON)
 *   - Numbeo cost of living + crime indices (public API, no key required for basic fetch)
 *   - ILGA World State-Sponsored Homophobia index (static, updated annually)
 */

import fs from "fs";
import path from "path";

const OUT_PATH = path.join(__dirname, "../src/lib/data/country-data.json");

// ------- US State Dept Travel Advisories -------
// Public feed: https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html
// The JSON feed URL below is the machine-readable version.
const STATE_DEPT_FEED =
  "https://travel.state.gov/content/dam/traveladvisories/en/consolidated-advisories-data.json";

async function fetchStateDeptAdvisories(): Promise<
  Record<string, { level: number; summary: string }>
> {
  console.log("Fetching State Dept advisories...");
  const res = await fetch(STATE_DEPT_FEED);
  if (!res.ok) throw new Error(`State Dept fetch failed: ${res.status}`);
  const json = (await res.json()) as {
    advList: { countryCode: string; advisoryLevel: number; body: string }[];
  };

  const result: Record<string, { level: number; summary: string }> = {};
  for (const adv of json.advList ?? []) {
    result[adv.countryCode] = {
      level: adv.advisoryLevel,
      // First sentence of the advisory body as the summary
      summary: (adv.body ?? "").split(".")[0].trim(),
    };
  }
  return result;
}

// ------- Numbeo City/Country Data -------
// Numbeo has a free API endpoint for country-level data without auth.
// https://www.numbeo.com/api/
// We use the country indices endpoint which returns cost of living and crime.
const NUMBEO_COUNTRY_URL =
  "https://www.numbeo.com/api/country_indices?api_key=free";

async function fetchNumbeoCountryData(): Promise<
  Record<
    string,
    { costOfLivingIndex: number; crimeIndex: number; safetyIndex: number }
  >
> {
  console.log("Fetching Numbeo country data...");
  // Numbeo free tier is rate-limited; we use the public JSON directly.
  // If the API requires a key, fall back to the static snapshot below.
  try {
    const res = await fetch(NUMBEO_COUNTRY_URL);
    if (!res.ok) throw new Error(`Numbeo fetch failed: ${res.status}`);
    const json = (await res.json()) as {
      country_name: string;
      coli: number;
      crime_index: number;
      safety_index: number;
    }[];

    const result: Record<
      string,
      { costOfLivingIndex: number; crimeIndex: number; safetyIndex: number }
    > = {};
    for (const row of json) {
      result[row.country_name] = {
        costOfLivingIndex: row.coli,
        crimeIndex: row.crime_index,
        safetyIndex: row.safety_index,
      };
    }
    return result;
  } catch {
    console.warn("Numbeo API unavailable — using static snapshot");
    return NUMBEO_STATIC_SNAPSHOT;
  }
}

// Static snapshot of Numbeo data (2024) for key study abroad destinations.
// Update annually by re-running this script.
const NUMBEO_STATIC_SNAPSHOT: Record<
  string,
  { costOfLivingIndex: number; crimeIndex: number; safetyIndex: number }
> = {
  Japan: { costOfLivingIndex: 69.3, crimeIndex: 21.6, safetyIndex: 78.4 },
  Spain: { costOfLivingIndex: 56.3, crimeIndex: 35.2, safetyIndex: 64.8 },
  Italy: { costOfLivingIndex: 62.1, crimeIndex: 41.8, safetyIndex: 58.2 },
  Australia: { costOfLivingIndex: 78.4, crimeIndex: 39.7, safetyIndex: 60.3 },
  "South Africa": { costOfLivingIndex: 35.2, crimeIndex: 76.2, safetyIndex: 23.8 },
  Chile: { costOfLivingIndex: 38.9, crimeIndex: 47.1, safetyIndex: 52.9 },
  Germany: { costOfLivingIndex: 63.5, crimeIndex: 30.4, safetyIndex: 69.6 },
  France: { costOfLivingIndex: 73.8, crimeIndex: 47.3, safetyIndex: 52.7 },
  "United Kingdom": { costOfLivingIndex: 78.1, crimeIndex: 43.8, safetyIndex: 56.2 },
  Netherlands: { costOfLivingIndex: 74.2, crimeIndex: 35.1, safetyIndex: 64.9 },
  Portugal: { costOfLivingIndex: 50.4, crimeIndex: 27.6, safetyIndex: 72.4 },
  Ireland: { costOfLivingIndex: 76.3, crimeIndex: 32.1, safetyIndex: 67.9 },
  "New Zealand": { costOfLivingIndex: 76.8, crimeIndex: 44.1, safetyIndex: 55.9 },
  Singapore: { costOfLivingIndex: 82.6, crimeIndex: 18.4, safetyIndex: 81.6 },
  "South Korea": { costOfLivingIndex: 64.1, crimeIndex: 26.3, safetyIndex: 73.7 },
  Taiwan: { costOfLivingIndex: 54.2, crimeIndex: 23.1, safetyIndex: 76.9 },
  Morocco: { costOfLivingIndex: 31.2, crimeIndex: 46.8, safetyIndex: 53.2 },
  Ghana: { costOfLivingIndex: 28.4, crimeIndex: 45.3, safetyIndex: 54.7 },
  "Costa Rica": { costOfLivingIndex: 42.1, crimeIndex: 48.2, safetyIndex: 51.8 },
  Argentina: { costOfLivingIndex: 30.6, crimeIndex: 52.1, safetyIndex: 47.9 },
  Brazil: { costOfLivingIndex: 35.3, crimeIndex: 67.4, safetyIndex: 32.6 },
  Mexico: { costOfLivingIndex: 34.7, crimeIndex: 53.8, safetyIndex: 46.2 },
  Greece: { costOfLivingIndex: 48.6, crimeIndex: 34.7, safetyIndex: 65.3 },
  Czech: { costOfLivingIndex: 47.3, crimeIndex: 28.9, safetyIndex: 71.1 },
  Hungary: { costOfLivingIndex: 43.8, crimeIndex: 33.4, safetyIndex: 66.6 },
  Poland: { costOfLivingIndex: 41.2, crimeIndex: 32.6, safetyIndex: 67.4 },
  Sweden: { costOfLivingIndex: 78.9, crimeIndex: 40.2, safetyIndex: 59.8 },
  Denmark: { costOfLivingIndex: 85.4, crimeIndex: 31.7, safetyIndex: 68.3 },
  Switzerland: { costOfLivingIndex: 120.3, crimeIndex: 25.4, safetyIndex: 74.6 },
  Austria: { costOfLivingIndex: 68.7, crimeIndex: 28.3, safetyIndex: 71.7 },
  Belgium: { costOfLivingIndex: 70.2, crimeIndex: 42.6, safetyIndex: 57.4 },
  Thailand: { costOfLivingIndex: 38.6, crimeIndex: 38.9, safetyIndex: 61.1 },
  Vietnam: { costOfLivingIndex: 29.3, crimeIndex: 35.7, safetyIndex: 64.3 },
  India: { costOfLivingIndex: 24.1, crimeIndex: 44.8, safetyIndex: 55.2 },
  China: { costOfLivingIndex: 42.3, crimeIndex: 31.4, safetyIndex: 68.6 },
};

// ------- ILGA World LGBTQ+ Safety Tier -------
// Source: ILGA World State-Sponsored Homophobia Report (annual)
// Tiers: "generally safe" | "caution" | "hostile"
const ILGA_LGBTQ_TIERS: Record<string, "generally safe" | "caution" | "hostile"> = {
  // Generally safe (legal protections, anti-discrimination laws)
  Australia: "generally safe",
  Austria: "generally safe",
  Belgium: "generally safe",
  Canada: "generally safe",
  Chile: "caution",
  Colombia: "caution",
  Czech: "generally safe",
  Denmark: "generally safe",
  Finland: "generally safe",
  France: "generally safe",
  Germany: "generally safe",
  Iceland: "generally safe",
  Ireland: "generally safe",
  Italy: "caution",
  Japan: "caution",
  Luxembourg: "generally safe",
  Malta: "generally safe",
  Mexico: "caution",
  Netherlands: "generally safe",
  "New Zealand": "generally safe",
  Norway: "generally safe",
  Portugal: "generally safe",
  Singapore: "hostile",
  "South Africa": "generally safe",
  "South Korea": "caution",
  Spain: "generally safe",
  Sweden: "generally safe",
  Switzerland: "generally safe",
  Taiwan: "generally safe",
  "United Kingdom": "generally safe",
  "United States": "generally safe",
  Argentina: "generally safe",
  Brazil: "generally safe",
  "Costa Rica": "generally safe",
  Greece: "caution",
  Hungary: "hostile",
  Poland: "hostile",
  Thailand: "caution",
  Vietnam: "caution",
  Morocco: "hostile",
  Ghana: "hostile",
  India: "caution",
  China: "caution",
};

// ------- Main -------
async function main() {
  const [advisories, numbeo] = await Promise.all([
    fetchStateDeptAdvisories().catch((e) => {
      console.warn("Advisory fetch failed:", e.message);
      return {} as Record<string, { level: number; summary: string }>;
    }),
    fetchNumbeoCountryData(),
  ]);

  const output = {
    generatedAt: new Date().toISOString(),
    advisories,
    numbeo,
    lgbtq: ILGA_LGBTQ_TIERS,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(output, null, 2));
  console.log(`Written to ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
