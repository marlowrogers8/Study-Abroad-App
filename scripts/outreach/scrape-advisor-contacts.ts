/**
 * Scrapes study abroad advisor contact info from university study abroad office pages.
 * Outputs: scripts/outreach/advisor-contacts.csv
 *
 * Run:        npx tsx scripts/outreach/scrape-advisor-contacts.ts
 * Sample:     npx tsx scripts/outreach/scrape-advisor-contacts.ts --limit=10
 * Resume:     npx tsx scripts/outreach/scrape-advisor-contacts.ts --start=50
 *
 * For each school this crawls the seed contact page PLUS:
 *   - common staff/directory paths derived from the site origin
 *   - same-domain links on the contact page whose text/href looks like a
 *     staff, team, people, directory, or advisor listing
 * It deobfuscates "name [at] school [dot] edu" style addresses and pairs each
 * email with the nearest preceding name + title using text proximity.
 *
 * Rate-limited to ~1 request / 1.2s to be respectful to university servers.
 * Expect roughly 1–3 hours for the full seed list (multiple pages per school).
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { SCHOOL_SEEDS, type SchoolSeed } from "./advisor-seed-list";

const OUT_CSV = path.join(__dirname, "advisor-contacts.csv");
const DELAY_MS = 1200;
const REQUEST_TIMEOUT_MS = 12000;
const MAX_PAGES_PER_SCHOOL = 8;

export type Contact = {
  school: string;
  type: string;
  name: string;
  email: string;
  title: string;
  kind: "personal" | "office";
  sourceUrl: string;
};

// ── Email detection ─────────────────────────────────────────────────────────
const EMAIL_RE = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
const MAILTO_RE = /mailto:([A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,})/gi;

// Deobfuscated forms: "jane [at] school [dot] edu", "jane (at) school (dot) edu",
// "jane AT school DOT edu"
const OBFUSCATED_RE =
  /([A-Za-z0-9._%+\-]+)\s*(?:\[at\]|\(at\)|\s+at\s+|&#64;|&commat;)\s*([A-Za-z0-9.\-]+)\s*(?:\[dot\]|\(dot\)|\s+dot\s+)\s*(edu|com|org|net)/gi;

// Role/system accounts we never want to cold-email. Distinctive substrings
// (>=5 chars, unambiguous) matched anywhere; short generic words matched only
// as whole tokens so we don't nuke real names (e.g. "hr" inside "schrepfe").
const DENY_RE =
  /(no-?reply|donotreply|do-not-reply|postmaster|mailer-daemon|hostmaster|abuse|privacy|givetob|giveto|giving|donat|gift|alumni|peacecorps|passport|hotline|emergency|fulbright|scholarship|outreach|communications|finaid|registrar|agreement|travelaid|creeca|seasia|southasia|eastasia|mideast|webmaster|helpdesk)/;
const DENY_TOKENS = new Set([
  "europe", "asia", "africa", "info", "news", "media", "events", "event",
  "jobs", "job", "hr", "it", "library", "housing", "reslife", "parking",
  "bursar", "payroll", "facilities", "admin", "test", "support", "careers",
  "career", "recruiting", "marketing", "sales", "billing", "accounting",
  "accounts", "root", "mail",
]);

// Legit study-abroad office inboxes worth keeping (flagged as "office").
const OFFICE_KEEP = [
  "studyabroad", "study-abroad", "educationabroad", "education-abroad",
  "goabroad", "go-abroad", "studyaway", "study-away", "abroad", "global",
  "globaled", "international", "oip", "oie", "ois", "overseas", "exchange",
];

// ── Name + title detection ──────────────────────────────────────────────────
const TITLE_KEYWORDS =
  "(?:Study Abroad|Education Abroad|Study Away|International|Global|Overseas|Off-Campus|Off Campus|Exchange)";
const ROLE_KEYWORDS =
  "(?:Advisor|Adviser|Coordinator|Director|Manager|Specialist|Counselor|Officer|Assistant|Associate|Dean|Liaison)";

// "Senior Study Abroad Advisor", "Director of Education Abroad", "Global Programs Coordinator"
const TITLE_RE = new RegExp(
  `((?:Senior |Assistant |Associate |Lead |Principal |Peer )?` +
  `(?:${TITLE_KEYWORDS}[A-Za-z ]{0,30})?${ROLE_KEYWORDS}` +
  `(?: (?:of|for|,) [A-Za-z ]{0,40})?)`,
  "gi"
);

// Two or three capitalized words = a likely person name
const NAME_RE = /\b([A-Z][a-z'’\-]{1,20}(?:\s[A-Z]\.?)?\s[A-Z][a-z'’\-]{1,25})\b/g;

// Strings that look like names but aren't people
const NAME_STOPLIST = new Set([
  "Study Abroad", "Education Abroad", "Study Away", "Global Programs",
  "International Programs", "International Education", "Read More", "Learn More",
  "Contact Us", "Meet The", "Our Team", "Our Staff", "Get Started", "Apply Now",
  "Privacy Policy", "Terms Of", "Site Map", "Office Of", "Center For",
  "United States", "New York", "Find Programs", "View All", "Program Search",
  "Financial Aid", "Course Equivalencies", "Health And", "Safety And",
]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── HTTP via curl (node fetch is blocked in this sandbox) ───────────────────
export function fetchPage(url: string): string | null {
  try {
    const html = execSync(
      `curl -s -L --compressed --max-time ${REQUEST_TIMEOUT_MS / 1000} ` +
        `-A "Mozilla/5.0 (compatible; AbroadlyResearch/1.0; +student research project)" ` +
        `"${url.replace(/"/g, '\\"')}"`,
      { timeout: REQUEST_TIMEOUT_MS + 2000, maxBuffer: 8 * 1024 * 1024 }
    ).toString();
    return html.length > 200 ? html : null;
  } catch {
    return null;
  }
}

// ── URL helpers ─────────────────────────────────────────────────────────────
function originOf(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "";
  }
}

// Candidate staff/directory paths to try beyond the seed URL
const STAFF_PATHS = [
  "/staff", "/our-staff", "/staff/", "/people", "/our-people", "/team",
  "/our-team", "/meet-the-team", "/meet-our-staff", "/directory", "/advisors",
  "/our-advisors", "/about/staff", "/about/our-team", "/about/people",
  "/contact/staff", "/staff-directory", "/who-we-are",
];

const STAFF_LINK_RE =
  /href=["']([^"'#?]+)["'][^>]*>([^<]{0,60})/gi;
const STAFF_LINK_KEYWORDS =
  /(staff|people|team|directory|advisor|adviser|our-?team|meet|who-we-are|contact)/i;

function discoverStaffLinks(html: string, origin: string): string[] {
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  STAFF_LINK_RE.lastIndex = 0;
  while ((m = STAFF_LINK_RE.exec(html)) !== null) {
    const href = m[1];
    const text = m[2];
    if (!STAFF_LINK_KEYWORDS.test(href) && !STAFF_LINK_KEYWORDS.test(text)) continue;
    let abs: string;
    if (href.startsWith("http")) {
      abs = href;
    } else if (href.startsWith("/")) {
      abs = origin + href;
    } else {
      continue;
    }
    // Same-origin only
    if (abs.startsWith(origin)) found.add(abs);
  }
  return [...found];
}

// ── Extraction ──────────────────────────────────────────────────────────────
// Registrable domain of the school, e.g. "wisc.edu" — used to drop third-party
// vendor emails (oncallinternational.com etc.) that appear on these pages.
function registrableDomain(url: string): string {
  try {
    return new URL(url).host.toLowerCase().split(".").slice(-2).join(".");
  } catch {
    return "";
  }
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const OFFICE_KEEP_SET = new Set(OFFICE_KEEP);
// Words that look like a name part but signal a dept/role inbox, not a person.
const ROLE_WORDS = new Set([
  "exchange", "summer", "seminar", "associate", "academic", "program",
  "programs", "office", "advising", "services", "center", "fellowship",
  "fellowships", "scholars", "honors", "department", "faculty", "coordinator",
  "director", "advisor", "adviser", "manager", "specialist",
]);
const isNonNameWord = (w: string) => OFFICE_KEEP_SET.has(w) || ROLE_WORDS.has(w);

// "lesley.bartlett" -> "Lesley Bartlett". The most reliable name source.
// Rejects dept inboxes like "faa-abroad" or "las-exchange".
function nameFromLocal(local: string): string {
  const base = local.replace(/\d+$/, "");
  const m = base.match(/^([a-z]+)[._\-]([a-z]+)$/);
  if (!m) return "";
  const [, a, b] = m;
  if (a.length < 2 || b.length < 2) return "";
  if (isNonNameWord(a) || isNonNameWord(b)) return "";
  return `${cap(a)} ${cap(b)}`;
}

function denyLocal(local: string): boolean {
  if (DENY_RE.test(local)) return true;
  return local.split(/[._\-]/).some((t) => DENY_TOKENS.has(t));
}

// Validate an HTML-proximity name against the email local part: the person's
// first or last name should actually appear in their address. Kills false
// pairings like "Berkeley Summer" next to summerabroad@.
function htmlNameMatchesLocal(name: string, local: string): boolean {
  const la = local.replace(/[^a-z]/g, "");
  const w = name.toLowerCase().split(/\s+/);
  const first = w[0] ?? "";
  const last = w[w.length - 1] ?? "";
  if (last.length >= 4 && la.includes(last)) return true;
  if (first.length >= 4 && la.includes(first)) return true;
  if (first[0] && la === first[0] + last) return true; // flast
  if (last[0] && la === last + first[0]) return true;
  return false;
}

type Classified = { kind: "personal" | "office"; name: string } | null;

function classifyEmail(email: string, htmlName: string, regDomain: string): Classified {
  const [local, domain] = email.toLowerCase().split("@");
  if (!domain || !regDomain || !domain.endsWith(regDomain)) return null; // off-domain vendor
  if (denyLocal(local)) return null;

  // 1. Name embedded in the address itself — highest confidence
  const sep = nameFromLocal(local);
  if (sep) return { kind: "personal", name: sep };

  // 2. Legit office inbox
  if (
    OFFICE_KEEP.some(
      (o) =>
        local === o ||
        local.split(/[._\-]/).includes(o) ||
        (o.length >= 6 && local.includes(o))
    )
  ) {
    return { kind: "office", name: "" };
  }

  // 3. Single-token address with a validated nearby name
  if (htmlName && isValidName(htmlName) && htmlNameMatchesLocal(htmlName, local)) {
    return { kind: "personal", name: htmlName };
  }

  // 4. Bare staffer address (flast style) with no usable name
  if (/^[a-z]+\d?$/.test(local) && local.length >= 4 && local.length <= 14) {
    return { kind: "personal", name: "" };
  }

  return null;
}

// Pull all candidate emails out of raw HTML (mailto + plaintext + obfuscated)
function harvestEmails(html: string): string[] {
  const found = new Set<string>();
  let m: RegExpExecArray | null;

  MAILTO_RE.lastIndex = 0;
  while ((m = MAILTO_RE.exec(html)) !== null) found.add(m[1].toLowerCase());

  OBFUSCATED_RE.lastIndex = 0;
  while ((m = OBFUSCATED_RE.exec(html)) !== null) {
    found.add(`${m[1]}@${m[2]}.${m[3]}`.toLowerCase());
  }

  EMAIL_RE.lastIndex = 0;
  while ((m = EMAIL_RE.exec(html)) !== null) {
    const e = m[0].toLowerCase();
    if (!e.includes("@2x") && !e.endsWith(".png") && !e.endsWith(".jpg")) {
      found.add(e);
    }
  }
  return [...found];
}

// Convert HTML to inline text where mailto addresses appear next to their label,
// so proximity pairing works.
function htmlToText(html: string): string {
  return html
    // surface mailto target right after the link label
    .replace(
      /<a[^>]*href=["']mailto:([^"'?]+)[^>]*>(.*?)<\/a>/gi,
      (_, email, label) => ` ${label} ${email} `
    )
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ");
}

function isValidName(name: string): boolean {
  if (NAME_STOPLIST.has(name)) return false;
  // Reject if any word is an obvious non-name keyword
  if (/\b(University|College|Office|Center|Program|Programs|Department|Abroad|Global|International|Education|Study|Campus|Email|Phone|Apply|Search|Contact|Exchange|Associate|Academic|Seminar|Services|Fellowship|Scholars|Honors|Advising|Adviser|Advisor|Coordinator|Director|Summer|Faculty)\b/.test(name)) {
    return false;
  }
  return true;
}

// For an email at position `idx` in `text`, find the nearest preceding name and title
function pairNearestNameTitle(
  text: string,
  email: string
): { name: string; title: string } {
  const idx = text.toLowerCase().indexOf(email.toLowerCase());
  if (idx < 0) return { name: "", title: "" };

  // Window: 240 chars before the email captures the typical staff-card layout
  const start = Math.max(0, idx - 240);
  const windowText = text.slice(start, idx + 10);

  // Nearest name = last name match in the window (closest to the email)
  let name = "";
  let m: RegExpExecArray | null;
  NAME_RE.lastIndex = 0;
  while ((m = NAME_RE.exec(windowText)) !== null) {
    if (isValidName(m[1])) name = m[1].replace(/[’']/g, "'");
  }

  // Title = first title-pattern match in the window
  let title = "";
  TITLE_RE.lastIndex = 0;
  const tm = TITLE_RE.exec(windowText);
  if (tm) title = tm[1].replace(/\s+/g, " ").trim();

  return { name, title };
}

function extractContacts(
  html: string,
  seed: SchoolSeed,
  sourceUrl: string,
  regDomain: string
): Contact[] {
  const text = htmlToText(html);
  const emails = harvestEmails(html);
  const out: Contact[] = [];

  for (const email of emails) {
    const { name: htmlName, title } = pairNearestNameTitle(text, email);
    const classified = classifyEmail(email, htmlName, regDomain);
    if (!classified) continue;

    out.push({
      school: seed.school,
      type: seed.type,
      // Prefer the address-derived name; fall back to a validated HTML name
      name: classified.name,
      email,
      title:
        title ||
        (classified.kind === "office" ? "Study Abroad Office" : "Study Abroad Advisor"),
      kind: classified.kind,
      sourceUrl,
    });
  }
  return out;
}

// ── CSV helpers ─────────────────────────────────────────────────────────────
function escapeCSV(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
export function toCSVRow(c: Contact): string {
  return [c.school, c.type, c.name, c.email, c.title, c.kind, c.sourceUrl]
    .map(escapeCSV)
    .join(",");
}

export const CSV_HEADER = "school,type,name,email,title,kind,sourceUrl\n";

// ── Crawl one school: seed page + staff paths + discovered links ────────────
export async function crawlSchool(seed: SchoolSeed): Promise<Contact[]> {
  const origin = originOf(seed.studyAbroadUrl);
  const regDomain = registrableDomain(seed.studyAbroadUrl);
  const pages = new Set<string>([seed.studyAbroadUrl]);

  // 1. Fetch the seed page first to discover staff links
  const seedHtml = fetchPage(seed.studyAbroadUrl);
  const schoolEmails = new Map<string, Contact>(); // dedup by email, prefer richer record

  function absorb(contacts: Contact[]) {
    for (const c of contacts) {
      const existing = schoolEmails.get(c.email);
      // Prefer the record that has a real person name
      if (!existing || (!existing.name && c.name)) {
        schoolEmails.set(c.email, c);
      }
    }
  }

  if (seedHtml) {
    absorb(extractContacts(seedHtml, seed, seed.studyAbroadUrl, regDomain));
    for (const link of discoverStaffLinks(seedHtml, origin)) pages.add(link);
  }

  // 2. Add common staff paths derived from origin
  if (origin) {
    for (const p of STAFF_PATHS) pages.add(origin + p);
  }

  // 3. Fetch the rest (cap total pages per school)
  const toFetch = [...pages].filter((u) => u !== seed.studyAbroadUrl).slice(0, MAX_PAGES_PER_SCHOOL - 1);
  for (const url of toFetch) {
    await sleep(DELAY_MS);
    const html = fetchPage(url);
    if (html) absorb(extractContacts(html, seed, url, regDomain));
  }

  return [...schoolEmails.values()];
}

// ── Main ────────────────────────────────────────────────────────────────────
function argNum(flag: string, fallback: number): number {
  const a = process.argv.find((x) => x.startsWith(`${flag}=`));
  return a ? parseInt(a.split("=")[1]) || fallback : fallback;
}

async function main() {
  const start = argNum("--start", 0);
  const limit = argNum("--limit", SCHOOL_SEEDS.length);
  const seeds = SCHOOL_SEEDS.slice(start, start + limit);

  // Append mode if resuming, else fresh header
  if (start === 0 || !fs.existsSync(OUT_CSV)) {
    fs.writeFileSync(OUT_CSV, CSV_HEADER);
  }

  console.log(`Crawling ${seeds.length} schools (start=${start})...`);
  let totalPersonal = 0;
  let totalOffice = 0;
  let i = 0;

  for (const seed of seeds) {
    process.stdout.write(`[${++i}/${seeds.length}] ${seed.school}... `);
    let contacts: Contact[] = [];
    try {
      contacts = await crawlSchool(seed);
    } catch {
      console.log("error");
      await sleep(DELAY_MS);
      continue;
    }

    const personal = contacts.filter((c) => c.kind === "personal");
    const office = contacts.filter((c) => c.kind === "office");
    totalPersonal += personal.length;
    totalOffice += office.length;

    for (const c of contacts) fs.appendFileSync(OUT_CSV, toCSVRow(c) + "\n");

    if (contacts.length) {
      const named = personal.filter((c) => c.name).length;
      console.log(`OK — ${personal.length} personal (${named} named), ${office.length} office`);
    } else {
      console.log("no contacts");
    }

    await sleep(DELAY_MS);
  }

  console.log(
    `\nDone. ${totalPersonal} personal + ${totalOffice} office contacts → ${OUT_CSV}`
  );
  console.log("Review the CSV; 'personal' rows with a name get the best response rates.");
}

// Only run when invoked directly — allows other scripts to import crawlSchool.
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
