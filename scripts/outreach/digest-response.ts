/**
 * Digests advisor email replies into structured JSON using Claude API.
 * Merges extracted data into src/lib/data/programs.json.
 *
 * Usage:
 *   Single reply (pipe from stdin) — recommended for agent integration:
 *     echo "$replyBody" | npx tsx scripts/outreach/digest-response.ts --school "University of Iowa"
 *
 *   Batch file of replies (one per line, separated by "---"):
 *     npx tsx scripts/outreach/digest-response.ts --file replies.txt
 *
 *   Interactive mode:
 *     npx tsx scripts/outreach/digest-response.ts --interactive
 *
 * Requires: ANTHROPIC_API_KEY environment variable
 */

import fs from "fs";
import path from "path";
import readline from "readline";

const PROGRAMS_PATH = path.join(__dirname, "../../src/lib/data/programs.json");
const DIGESTED_LOG = path.join(__dirname, "digested-responses.json");

// ── Claude API call ────────────────────────────────────────────────────────────
async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY environment variable is not set.\n" +
      "Get one at https://console.anthropic.com and run:\n" +
      "  export ANTHROPIC_API_KEY=sk-ant-..."
    );
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001", // cheapest — $0.001/reply at this length
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      system: `You are a data extraction assistant for a study abroad platform called Abroadly.
Your job is to read an email reply from a university study abroad advisor and extract structured information.
Always respond with valid JSON only — no prose, no markdown fences.
If the advisor didn't mention something, omit that field rather than guessing.`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const json = (await res.json()) as { content: { text: string }[] };
  return json.content[0]?.text ?? "{}";
}

// ── Extraction prompt ─────────────────────────────────────────────────────────
function buildExtractionPrompt(
  replyText: string,
  advisorSchool: string
): string {
  return `An advisor at ${advisorSchool} sent this reply to a study abroad transparency survey:

---
${replyText}
---

Extract any of the following information they provided. Return a JSON object with only the fields you found — skip fields they didn't mention.

{
  "recommendedPrograms": [
    {
      "programName": "string — exact name if given, or best match",
      "providerOrCity": "string — provider (CIEE, IES, SIT) or city",
      "country": "string",
      "whyRecommended": "string — advisor's reason in their words",
      "creditTransferRate": "number 0-100 if mentioned",
      "highlights": ["array of specific strengths mentioned"]
    }
  ],
  "warnAgainstPrograms": [
    {
      "programName": "string or null if they didn't name it",
      "providerOrCity": "string",
      "country": "string",
      "redFlags": ["array of specific issues mentioned"],
      "generalWarning": "string — their words"
    }
  ],
  "hiddenCosts": [
    {
      "programName": "string or 'general' if not program-specific",
      "costs": ["array of undisclosed costs they mentioned"]
    }
  ],
  "whatWebsitesMiss": ["array of data points or features advisors wish existed"],
  "lgbtqNotes": "string — any LGBTQ+ specific advice they gave",
  "soloFemaleNotes": "string — any solo female safety advice",
  "financialAidNotes": "string — any Pell grant or aid eligibility info they mentioned",
  "generalInsights": "string — any other valuable perspective they shared",
  "advisorSentiment": "positive | neutral | negative — their overall tone about current study abroad options"
}`;
}

// ── Merge into programs.json ──────────────────────────────────────────────────
type DigestedData = {
  recommendedPrograms?: {
    programName: string;
    providerOrCity?: string;
    country?: string;
    whyRecommended?: string;
    creditTransferRate?: number;
    highlights?: string[];
  }[];
  warnAgainstPrograms?: {
    programName?: string;
    redFlags?: string[];
    generalWarning?: string;
  }[];
  hiddenCosts?: { programName: string; costs: string[] }[];
  whatWebsitesMiss?: string[];
  lgbtqNotes?: string;
  soloFemaleNotes?: string;
  financialAidNotes?: string;
  generalInsights?: string;
};

function mergeIntoPrograms(digested: DigestedData, advisorSchool: string) {
  const data = JSON.parse(fs.readFileSync(PROGRAMS_PATH, "utf-8")) as {
    programs: {
      id: string;
      name: string;
      provider: string;
      city: string;
      country: string;
      advisorRecommendationRate: number | null;
      advisorRedFlags: string[];
      advisorHighlights: string[];
      hiddenCosts: string[];
      creditTransferRate: number;
    }[];
  };

  let changed = 0;

  for (const program of data.programs) {
    // Match recommended programs
    const rec = digested.recommendedPrograms?.find(
      (r) =>
        program.name.toLowerCase().includes(r.programName?.toLowerCase() ?? "____") ||
        program.city.toLowerCase().includes(r.providerOrCity?.toLowerCase() ?? "____") ||
        (r.country && program.country.toLowerCase() === r.country.toLowerCase())
    );

    if (rec) {
      if (rec.highlights?.length) {
        program.advisorHighlights = [
          ...new Set([...program.advisorHighlights, ...rec.highlights]),
        ];
      }
      if (rec.creditTransferRate && rec.creditTransferRate > 0) {
        // Average with existing rate
        program.creditTransferRate = Math.round(
          (program.creditTransferRate + rec.creditTransferRate) / 2
        );
      }
      changed++;
    }

    // Match warned-against programs
    const warn = digested.warnAgainstPrograms?.find(
      (w) =>
        w.programName &&
        program.name.toLowerCase().includes(w.programName.toLowerCase())
    );
    if (warn?.redFlags?.length) {
      program.advisorRedFlags = [
        ...new Set([...program.advisorRedFlags, ...warn.redFlags]),
      ];
      changed++;
    }

    // Match hidden costs
    const costs = digested.hiddenCosts?.find(
      (h) =>
        h.programName === "general" ||
        program.name.toLowerCase().includes(h.programName?.toLowerCase() ?? "____")
    );
    if (costs?.costs?.length) {
      program.hiddenCosts = [
        ...new Set([...program.hiddenCosts, ...costs.costs]),
      ];
      changed++;
    }
  }

  if (changed > 0) {
    fs.writeFileSync(PROGRAMS_PATH, JSON.stringify(data, null, 2));
    console.log(`  Merged data into ${changed} program(s) in programs.json`);
  } else {
    console.log(`  No direct program matches found — logged for manual review`);
  }

  return data;
}

// ── Log digested responses ────────────────────────────────────────────────────
function logDigested(
  replyText: string,
  advisorSchool: string,
  extracted: DigestedData
) {
  const log = fs.existsSync(DIGESTED_LOG)
    ? JSON.parse(fs.readFileSync(DIGESTED_LOG, "utf-8"))
    : [];
  log.push({
    digestedAt: new Date().toISOString(),
    advisorSchool,
    rawReply: replyText,
    extracted,
  });
  fs.writeFileSync(DIGESTED_LOG, JSON.stringify(log, null, 2));
}

// ── Process one reply ─────────────────────────────────────────────────────────
async function processReply(replyText: string, advisorSchool = "Unknown School") {
  console.log(`\nDigesting reply from ${advisorSchool}...`);
  const prompt = buildExtractionPrompt(replyText, advisorSchool);
  const raw = await callClaude(prompt);

  let extracted: DigestedData;
  try {
    extracted = JSON.parse(raw);
  } catch {
    console.error("Claude returned invalid JSON:", raw);
    return;
  }

  console.log("  Extracted:");
  if (extracted.recommendedPrograms?.length)
    console.log(`    ${extracted.recommendedPrograms.length} recommended program(s)`);
  if (extracted.warnAgainstPrograms?.length)
    console.log(`    ${extracted.warnAgainstPrograms.length} warned-against program(s)`);
  if (extracted.whatWebsitesMiss?.length)
    console.log(`    ${extracted.whatWebsitesMiss.length} "what websites miss" insight(s)`);
  if (extracted.generalInsights)
    console.log(`    General insight: ${extracted.generalInsights.slice(0, 80)}...`);

  mergeIntoPrograms(extracted, advisorSchool);
  logDigested(replyText, advisorSchool, extracted);
  console.log(`  Logged to ${DIGESTED_LOG}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--interactive")) {
    // Interactive: prompt for school name then paste reply
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question("Advisor's school: ", async (school) => {
      console.log('Paste the email reply, then press Ctrl+D when done:');
      let reply = "";
      rl.on("line", (line) => (reply += line + "\n"));
      rl.on("close", async () => {
        await processReply(reply.trim(), school);
      });
    });
    return;
  }

  if (args.includes("--file")) {
    // Batch file: replies separated by "---" on its own line
    const filePath = args[args.indexOf("--file") + 1];
    if (!filePath || !fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      process.exit(1);
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    const replies = raw.split(/^---$/m).map((r) => r.trim()).filter(Boolean);
    console.log(`Processing ${replies.length} replies from ${filePath}...`);
    for (const reply of replies) {
      // First line may be "SCHOOL: University of Michigan"
      const schoolMatch = reply.match(/^SCHOOL:\s*(.+)/i);
      const school = schoolMatch ? schoolMatch[1].trim() : "Unknown School";
      const body = reply.replace(/^SCHOOL:.+\n?/i, "").trim();
      await processReply(body, school);
    }
    return;
  }

  // Default: read reply body from stdin. The agent passes the sender's school
  // via --school so each reply is attributed correctly, e.g.:
  //   echo "$replyBody" | npx tsx digest-response.ts --school "University of Iowa"
  const schoolFlag = args.indexOf("--school");
  const school = schoolFlag >= 0 ? args[schoolFlag + 1] ?? "Unknown School" : "Unknown School";

  let input = "";
  process.stdin.on("data", (chunk) => (input += chunk));
  process.stdin.on("end", async () => {
    await processReply(input.trim(), school);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
