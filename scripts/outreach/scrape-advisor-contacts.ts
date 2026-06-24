/**
 * Scrapes study abroad advisor contact info from university study abroad office pages.
 * Outputs: scripts/outreach/advisor-contacts.csv
 *
 * Run: npx tsx scripts/outreach/scrape-advisor-contacts.ts
 *
 * Rate-limited to 1 request/2s to be respectful to university servers.
 * Expect 2–4 hours to process the full seed list.
 * For a quick sample run: npx tsx scripts/outreach/scrape-advisor-contacts.ts --limit 20
 */

import fs from "fs";
import path from "path";
import { SCHOOL_SEEDS, type SchoolSeed } from "./advisor-seed-list";

const OUT_CSV = path.join(__dirname, "advisor-contacts.csv");
const DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 10000;

type Contact = {
  school: string;
  type: string;
  name: string;
  email: string;
  title: string;
  sourceUrl: string;
};

// Email regex — matches most university email formats
const EMAIL_RE = /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g;

// Name + title patterns commonly found on university staff pages
const NAME_TITLE_PATTERNS = [
  // "Jane Smith, Study Abroad Advisor"
  /([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?),\s*((?:Study Abroad|International|Education Abroad|Global)[^<\n,]{0,60})/gi,
  // "Director: Jane Smith"
  /(?:Director|Advisor|Coordinator|Manager|Assistant Director)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)/gi,
];

import { execSync } from "child_process";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchPage(url: string): string | null {
  try {
    const html = execSync(
      `curl -s -L --max-time ${REQUEST_TIMEOUT_MS / 1000} -A "Mozilla/5.0 (compatible; AbroadlyResearch/1.0; student project)" "${url}"`,
      { timeout: REQUEST_TIMEOUT_MS + 2000, maxBuffer: 5 * 1024 * 1024 }
    ).toString();
    return html.length > 200 ? html : null;
  } catch {
    return null;
  }
}

function extractEmails(html: string): string[] {
  // Also decode mailto: links which universities often use
  const mailtoRe = /mailto:([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})/gi;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = mailtoRe.exec(html)) !== null) found.add(m[1].toLowerCase());
  while ((m = EMAIL_RE.exec(html)) !== null) {
    const email = m[0].toLowerCase();
    // Filter out common false positives
    if (!email.includes("example") && !email.includes("@2x")) {
      found.add(email);
    }
  }
  return [...found];
}

function extractNames(html: string): { name: string; title: string }[] {
  // Strip HTML tags for text extraction
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const results: { name: string; title: string }[] = [];
  for (const re of NAME_TITLE_PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      if (m[1] && m[2]) {
        results.push({ name: m[1].trim(), title: m[2].trim() });
      } else if (m[1]) {
        results.push({ name: m[1].trim(), title: "" });
      }
    }
  }
  return results;
}

function pairEmailsWithNames(
  emails: string[],
  names: { name: string; title: string }[],
  school: SchoolSeed
): Contact[] {
  if (emails.length === 0) return [];

  if (names.length > 0 && names.length <= emails.length) {
    // Best case: we have name/email pairs we can zip
    return names.slice(0, emails.length).map((n, i) => ({
      school: school.school,
      type: school.type,
      name: n.name,
      email: emails[i] ?? emails[0],
      title: n.title,
      sourceUrl: school.studyAbroadUrl,
    }));
  }

  // Fallback: return all emails with unknown names
  return emails.map((email) => ({
    school: school.school,
    type: school.type,
    name: "",
    email,
    title: "Study Abroad Advisor",
    sourceUrl: school.studyAbroadUrl,
  }));
}

function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function toCSVRow(c: Contact): string {
  return [c.school, c.type, c.name, c.email, c.title, c.sourceUrl]
    .map(escapeCSV)
    .join(",");
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find((a) => a.startsWith("--limit=") || a === "--limit");
  const limit = limitArg
    ? parseInt(args[args.indexOf(limitArg) + (limitArg === "--limit" ? 1 : 0)]?.replace("--limit=", "") ?? "999")
    : SCHOOL_SEEDS.length;

  const seeds = SCHOOL_SEEDS.slice(0, limit);
  const allContacts: Contact[] = [];

  // Write CSV header
  fs.writeFileSync(OUT_CSV, "school,type,name,email,title,sourceUrl\n");

  console.log(`Scraping ${seeds.length} schools...`);
  let scraped = 0;
  let found = 0;

  for (const seed of seeds) {
    process.stdout.write(`[${++scraped}/${seeds.length}] ${seed.school}... `);
    const html = fetchPage(seed.studyAbroadUrl);

    if (!html) {
      console.log("FAILED (no response)");
      await sleep(DELAY_MS);
      continue;
    }

    const emails = extractEmails(html);
    const names = extractNames(html);
    const contacts = pairEmailsWithNames(emails, names, seed);

    if (contacts.length > 0) {
      allContacts.push(...contacts);
      for (const c of contacts) {
        fs.appendFileSync(OUT_CSV, toCSVRow(c) + "\n");
      }
      found += contacts.length;
      console.log(`OK — ${contacts.length} contact(s)`);
    } else {
      console.log("no emails found");
    }

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. ${found} contacts from ${scraped} schools → ${OUT_CSV}`);
  console.log("Tip: review the CSV and remove any non-advisor emails (IT, admissions, etc.) before sending.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
