/**
 * Builds a wide list of US 4-year institutions from the US Dept. of Education
 * College Scorecard API. Outputs: scripts/outreach/generated-schools.json
 *
 * Each entry is { school, domain, type: "scorecard" } — domain only, no study
 * abroad URL. scrape-wide.ts discovers each school's study abroad office.
 *
 * Setup (one time, free):
 *   1. Get an API key at https://api.data.gov/signup/  (instant)
 *   2. export SCORECARD_API_KEY=your_key_here
 *
 * Run: npx tsx scripts/outreach/build-school-list.ts
 *
 * Pulls schools whose predominant degree is Bachelor's (3) or Graduate (4),
 * i.e. four-year colleges and research universities. ~2,000 schools.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const OUT_JSON = path.join(__dirname, "generated-schools.json");
const API = "https://api.data.gov/ed/collegescorecard/v1/schools";
const API_KEY = process.env.SCORECARD_API_KEY || "DEMO_KEY";
const PER_PAGE = 100;

// Predominant degree codes to include: 3 = Bachelor's, 4 = Graduate.
const PREDOMINANT_DEGREES = [3, 4];

// Exclude the 5C consortium (per project constraints) and obvious non-targets.
const EXCLUDE_NAME_RE =
  /(Pomona College|Harvey Mudd|Scripps College|Pitzer College|Claremont McKenna|Claremont Graduate)/i;

type GeneratedSchool = { school: string; domain: string; type: "scorecard" };

type ScorecardResult = {
  metadata: { total: number; page: number; per_page: number };
  results: {
    "school.name": string;
    "school.school_url": string | null;
    "school.state": string | null;
  }[];
};

function fetchJson(url: string): ScorecardResult {
  const out = execSync(`curl -s --max-time 40 "${url.replace(/"/g, '\\"')}"`, {
    maxBuffer: 64 * 1024 * 1024,
  }).toString();
  return JSON.parse(out) as ScorecardResult;
}

// "https://WWW.Berkeley.edu/admissions" -> "berkeley.edu"
function normalizeDomain(url: string | null): string {
  if (!url) return "";
  return url
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/\s+/g, "");
}

function buildUrl(predominant: number, page: number): string {
  const fields = [
    "school.name",
    "school.school_url",
    "school.state",
  ].join(",");
  const params = new URLSearchParams({
    api_key: API_KEY,
    fields,
    "school.degrees_awarded.predominant": String(predominant),
    "school.operating": "1",
    "school.main_campus": "1",
    per_page: String(PER_PAGE),
    page: String(page),
  });
  return `${API}?${params.toString()}`;
}

async function main() {
  if (API_KEY === "DEMO_KEY") {
    console.warn(
      "⚠ Using DEMO_KEY — heavily rate-limited. Get a free key at\n" +
        "  https://api.data.gov/signup/  then: export SCORECARD_API_KEY=...\n"
    );
  }

  const byDomain = new Map<string, GeneratedSchool>();

  for (const predominant of PREDOMINANT_DEGREES) {
    let page = 0;
    let total = Infinity;

    while (page * PER_PAGE < total) {
      let data: ScorecardResult;
      try {
        data = fetchJson(buildUrl(predominant, page));
      } catch (e) {
        console.error(`Fetch failed (degree ${predominant}, page ${page}):`, e);
        break;
      }

      total = data.metadata?.total ?? 0;
      const label = predominant === 3 ? "bachelor's" : "graduate";
      process.stdout.write(
        `[degree=${predominant} ${label}] page ${page + 1}/${Math.ceil(total / PER_PAGE)} — ${byDomain.size} unique so far\r`
      );

      for (const row of data.results ?? []) {
        const name = row["school.name"];
        const domain = normalizeDomain(row["school.school_url"]);
        if (!name || !domain) continue;
        if (EXCLUDE_NAME_RE.test(name)) continue;
        if (!byDomain.has(domain)) {
          byDomain.set(domain, { school: name, domain, type: "scorecard" });
        }
      }

      page++;
      // DEMO_KEY allows ~30/hr; a real key allows 1,000/hr. Small pause either way.
      await new Promise((r) => setTimeout(r, API_KEY === "DEMO_KEY" ? 2500 : 300));
    }
    console.log("");
  }

  const schools = [...byDomain.values()].sort((a, b) =>
    a.school.localeCompare(b.school)
  );
  fs.writeFileSync(OUT_JSON, JSON.stringify(schools, null, 2));
  console.log(`\nWrote ${schools.length} schools → ${OUT_JSON}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
