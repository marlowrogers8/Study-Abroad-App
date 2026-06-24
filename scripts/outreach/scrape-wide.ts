/**
 * Wide scrape: for every school in generated-schools.json, auto-discovers the
 * study abroad office page from the school's domain, then reuses the crawler
 * from scrape-advisor-contacts.ts to extract advisor contacts.
 *
 * Outputs: scripts/outreach/advisor-contacts-wide.csv  (kept separate from the
 * curated advisor-contacts.csv so the two runs never clobber each other).
 *
 * Prereq: run build-school-list.ts first to generate generated-schools.json.
 *
 * Run:    npx tsx scripts/outreach/scrape-wide.ts
 * Sample: npx tsx scripts/outreach/scrape-wide.ts --limit=25
 * Resume: npx tsx scripts/outreach/scrape-wide.ts --start=500
 *
 * This is a long job — discovery + crawl across thousands of schools can run
 * many hours. It's resumable and appends as it goes, so Ctrl+C is safe.
 */

import fs from "fs";
import path from "path";
import {
  crawlSchool,
  fetchPage,
  toCSVRow,
  CSV_HEADER,
  type Contact,
} from "./scrape-advisor-contacts";
import type { SchoolSeed } from "./advisor-seed-list";

const SCHOOLS_JSON = path.join(__dirname, "generated-schools.json");
const OUT_CSV = path.join(__dirname, "advisor-contacts-wide.csv");
const DISCOVERY_DELAY_MS = 800;

type GeneratedSchool = { school: string; domain: string; type: "scorecard" };

// Lean discovery: homepage-link first (catches most), then a few cheap guesses.
const SUBDOMAIN_GUESSES = ["studyabroad", "global", "international"];
const PATH_GUESSES = ["/study-abroad", "/studyabroad", "/global/study-abroad"];

const SA_LINK_TEXT_RE = /study[\s-]?abroad|education abroad/i;
const SA_LINK_HREF_RE = /study-?abroad|education-?abroad|global|international/i;
const SA_PAGE_RE = /study\s*abroad|education\s*abroad/i;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Find a study abroad office URL from just the school's domain.
function discoverStudyAbroadUrl(domain: string): string | null {
  // 1. Homepage → first link that looks like the study abroad office
  const home = fetchPage(`https://www.${domain}/`) ?? fetchPage(`https://${domain}/`);
  if (home) {
    const linkRe = /href=["']([^"'#]+)["'][^>]*>([^<]{0,80})/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(home)) !== null) {
      const href = m[1];
      const text = m[2];
      if (SA_LINK_TEXT_RE.test(text) || (SA_LINK_HREF_RE.test(href) && /abroad/i.test(href))) {
        if (href.startsWith("http")) return href;
        if (href.startsWith("/")) return `https://www.${domain}${href}`;
      }
    }
  }

  // 2. Subdomain guesses (studyabroad.school.edu, etc.)
  for (const sub of SUBDOMAIN_GUESSES) {
    const url = `https://${sub}.${domain}/`;
    const html = fetchPage(url);
    if (html && SA_PAGE_RE.test(html)) return url;
  }

  // 3. Path guesses (www.school.edu/study-abroad, etc.)
  for (const p of PATH_GUESSES) {
    const url = `https://www.${domain}${p}`;
    const html = fetchPage(url);
    if (html && SA_PAGE_RE.test(html)) return url;
  }

  return null;
}

function argNum(flag: string, fallback: number): number {
  const a = process.argv.find((x) => x.startsWith(`${flag}=`));
  return a ? parseInt(a.split("=")[1]) || fallback : fallback;
}

async function main() {
  if (!fs.existsSync(SCHOOLS_JSON)) {
    console.error(`Missing ${SCHOOLS_JSON}. Run build-school-list.ts first.`);
    process.exit(1);
  }

  const schools = JSON.parse(fs.readFileSync(SCHOOLS_JSON, "utf-8")) as GeneratedSchool[];
  const start = argNum("--start", 0);
  const limit = argNum("--limit", schools.length);
  const batch = schools.slice(start, start + limit);

  if (start === 0 || !fs.existsSync(OUT_CSV)) {
    fs.writeFileSync(OUT_CSV, CSV_HEADER);
  }

  console.log(`Wide scrape: ${batch.length} schools (start=${start})`);
  let discovered = 0;
  let totalContacts = 0;
  let i = 0;

  for (const s of batch) {
    process.stdout.write(`[${start + ++i}/${schools.length}] ${s.school}... `);

    let url: string | null = null;
    try {
      url = discoverStudyAbroadUrl(s.domain);
    } catch {
      /* discovery failed, fall through */
    }

    if (!url) {
      console.log("no study abroad office found");
      await sleep(DISCOVERY_DELAY_MS);
      continue;
    }
    discovered++;

    const seed: SchoolSeed = { school: s.school, type: "scorecard", studyAbroadUrl: url };
    let contacts: Contact[] = [];
    try {
      contacts = await crawlSchool(seed);
    } catch {
      console.log("crawl error");
      await sleep(DISCOVERY_DELAY_MS);
      continue;
    }

    for (const c of contacts) fs.appendFileSync(OUT_CSV, toCSVRow(c) + "\n");
    totalContacts += contacts.length;

    const named = contacts.filter((c) => c.kind === "personal" && c.name).length;
    console.log(`OK — ${contacts.length} contacts (${named} named)`);
    await sleep(DISCOVERY_DELAY_MS);
  }

  console.log(
    `\nDone. Found offices for ${discovered}/${batch.length} schools, ` +
      `${totalContacts} contacts → ${OUT_CSV}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
