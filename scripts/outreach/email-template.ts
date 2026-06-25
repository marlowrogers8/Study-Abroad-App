/**
 * Generates a personalized email for each advisor contact in advisor-contacts.csv.
 * Outputs: scripts/outreach/emails-to-send.json
 *
 * Run: npx tsx scripts/outreach/email-template.ts
 *
 * Each generated email is personalized with the advisor's name and school.
 * Send via Gmail API using your CMC account (zadinstephens@students.claremontmckenna.edu).
 * Rate-limit sends to 50–100/day spread across business hours.
 */

import fs from "fs";
import path from "path";

// Pull from both the curated scrape and the wide College-Scorecard scrape.
const CONTACTS_CSVS = [
  path.join(__dirname, "advisor-contacts.csv"),
  path.join(__dirname, "advisor-contacts-wide.csv"),
];
const OUT_JSON = path.join(__dirname, "emails-to-send.json");

type Contact = {
  school: string;
  type: string;
  name: string;
  email: string;
  title: string;
  kind: string; // "personal" | "office"
  sourceUrl: string;
};

// A single source page yielding more than this many emails is a campus-wide
// directory dump (entire faculty/staff), not a study abroad office. Drop those.
const DIRECTORY_DUMP_CAP = 60;

type EmailDraft = {
  to: string;
  subject: string;
  body: string;
  contact: Contact;
};

// ── Email template ────────────────────────────────────────────────────────────
// Principles:
//   - Short (under 200 words) — advisors are busy
//   - From a named student at a recognizable school — not a faceless company
//   - Specific ask, not open-ended — easier to respond to
//   - Plain text only — no HTML, no tracking, more likely to land in inbox
//   - 3 focused questions that map directly to our schema's advisor fields

function buildSubject(): string {
  return "Quick question from a CMC student building a study abroad transparency tool";
}

function buildBody(contact: Contact): string {
  const greeting = contact.name
    ? `Hi ${contact.name.split(" ")[0]},`
    : "Hi,";

  const schoolContext = contact.school
    ? ` at ${contact.school}`
    : "";

  return `${greeting}

My name is Zadin Stephens, and I'm a student at Claremont McKenna College building a study abroad platform called Abroadly. It's focused on something I've noticed is missing from the sites I've used: complete cost and safety transparency. Most sites show a program fee but hide housing, flights, visa costs, and insurance until students are already deep into the process.

As someone who advises students${schoolContext} on study abroad decisions, your perspective would be incredibly valuable to me. I have three quick questions:

1. Which programs do you most frequently recommend, and what makes them stand out? (Could be cost, credit transfer, support quality, anything.)

2. Are there programs you actively steer students away from, and if so, what's the reason? (No need to name names if you'd prefer not to.)

3. What information do current study abroad websites fail to show that you wish they did? Hidden costs, safety nuances, LGBTQ+ considerations, credit transfer realities, or anything students consistently underestimate.

Even a few sentences on any of these would help me a lot. I'm not selling anything or representing a company. This is a student project I'm building because I'm going abroad next year and found the existing tools frustrating.

Thank you for your time,

Zadin Stephens
Class of 2027, Claremont McKenna College
zadinstephens@students.claremontmckenna.edu`;
}

// ── CSV parser ────────────────────────────────────────────────────────────────
function parseCSV(filePath: string): Contact[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  const lines = raw.trim().split("\n");
  const headers = lines[0].split(",");

  return lines.slice(1).map((line) => {
    // Handle quoted fields
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());

    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h.trim()] = values[i] ?? ""));
    return obj as unknown as Contact;
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  const presentFiles = CONTACTS_CSVS.filter((f) => fs.existsSync(f));
  if (presentFiles.length === 0) {
    console.error(`No contacts files found (looked for: ${CONTACTS_CSVS.join(", ")})`);
    console.error("Run scrape-advisor-contacts.ts (and/or scrape-wide.ts) first.");
    process.exit(1);
  }

  const raw = presentFiles
    .flatMap((f) => parseCSV(f))
    .filter((c) => c.email && c.email.includes("@") && c.email.includes(".edu"));

  // Drop campus-directory dumps: any source page that yielded more than
  // DIRECTORY_DUMP_CAP emails is the whole university directory, not an office.
  const perPage = new Map<string, number>();
  for (const c of raw) perPage.set(c.sourceUrl, (perPage.get(c.sourceUrl) ?? 0) + 1);
  const dumpedPages = [...perPage].filter(([, n]) => n > DIRECTORY_DUMP_CAP);
  const droppedRows = dumpedPages.reduce((s, [, n]) => s + n, 0);
  const contacts = raw.filter((c) => (perPage.get(c.sourceUrl) ?? 0) <= DIRECTORY_DUMP_CAP);

  // Deduplicate by email
  const seen = new Set<string>();
  const deduped = contacts.filter((c) => {
    if (seen.has(c.email)) return false;
    seen.add(c.email);
    return true;
  });

  // By default keep only high-value tiers: named advisors + office inboxes.
  // Unnamed flast@ staff (no first name to personalise, lower response rate)
  // are excluded unless --include-unnamed is passed.
  const includeUnnamed = process.argv.includes("--include-unnamed");
  const isNamed = (c: Contact) => c.kind === "personal" && !!c.name;
  const isOffice = (c: Contact) => c.kind === "office";
  const unique = includeUnnamed
    ? deduped
    : deduped.filter((c) => isNamed(c) || isOffice(c));

  // Prioritise: named advisors first, then office inboxes, then unnamed staff —
  // so if you only send the first N, you hit the highest-value contacts.
  const rank = (c: Contact) => (isNamed(c) ? 0 : isOffice(c) ? 1 : 2);
  unique.sort((a, b) => rank(a) - rank(b));

  const drafts: EmailDraft[] = unique.map((contact) => ({
    to: contact.email,
    subject: buildSubject(),
    body: buildBody(contact),
    contact,
  }));

  fs.writeFileSync(OUT_JSON, JSON.stringify(drafts, null, 2));

  const named = unique.filter((c) => c.kind === "personal" && c.name).length;
  const office = unique.filter((c) => c.kind === "office").length;
  const unnamed = unique.length - named - office;

  console.log(`Generated ${drafts.length} email drafts → ${OUT_JSON}`);
  console.log(
    `  Filtered out ${droppedRows} rows from ${dumpedPages.length} campus-directory dump page(s).`
  );
  console.log(`  Queue order: ${named} named advisors → ${office} office inboxes → ${unnamed} unnamed staff.`);
  console.log("");
  console.log("Next steps:");
  console.log("  1. Review a sample: open emails-to-send.json and spot-check 5–10 entries");
  console.log("  2. Send via Gmail API using your CMC account at max 80/day (named first)");
  console.log("  3. Spread sends across 9am–4pm Mon–Thu for best open rates");
  console.log("  4. Feed replies through: npx tsx scripts/outreach/digest-response.ts");
  console.log("");
  console.log("Sample email:");
  console.log("─────────────────────────────────────");
  if (drafts[0]) {
    console.log(`TO: ${drafts[0].to}`);
    console.log(`SUBJECT: ${drafts[0].subject}`);
    console.log(`\n${drafts[0].body}`);
  }
}

main();
