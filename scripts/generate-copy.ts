#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { GeneratedCopy, GeneratedListing, Listing } from "../src/listing.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:14b";

const SYSTEM_PROMPT = `You are a small-business copywriter for one-page websites.
You write plain, specific, trustworthy copy — the opposite of buzzword marketing.
You never invent facts that aren't in the listing. You never use em-dashes,
"synergy", "elevate", "unlock", or other marketing cliches. Keep the tone that
of a small business owner talking to a neighbor.

Return ONLY valid JSON matching this TypeScript type:
{
  "headline": string,          // 6-12 words, hook + what they do
  "subheadline": string,       // 1 sentence, ~18-28 words, who it's for + what they'll get
  "aboutParagraph": string,    // 2-3 sentences, credible and specific, no fluff
  "servicesIntro": string,     // 1 sentence leading into the services list
  "ctaHeadline": string,       // 5-9 words, a clear ask
  "ctaBody": string,           // 1-2 sentences, what happens when they click
  "trustLine": string          // 1 short sentence, risk reversal or proof
}

Do not wrap the JSON in markdown. Do not include any commentary. Output raw JSON only.`;

function buildUserPrompt(listing: Listing): string {
  return `Write website copy for this business. Use only the facts below.

NAME: ${listing.name}
CATEGORY: ${listing.category}
OWNER: ${listing.owner.firstName} ${listing.owner.lastName}, ${listing.owner.yearsExperience} years experience
LOCATION: ${listing.address.city}, ${listing.address.region}
SERVICE AREA: ${listing.address.serviceArea.join(", ")}
PHONE: ${listing.contact.phone}
TAGLINE (raw from listing): ${listing.tagline}

SERVICES:
${listing.services.map((s) => `- ${s}`).join("\n")}

HIGHLIGHTS / DIFFERENTIATORS:
${listing.highlights.map((h) => `- ${h}`).join("\n")}

REVIEWS: ${listing.reviews.rating.toFixed(1)}/5 from ${listing.reviews.count} Google reviews.
SAMPLE REVIEW QUOTES:
${listing.reviews.snippets.map((q) => `- "${q}"`).join("\n")}

The CTA is a $499 flat-rate offer to build this website for the business
("we've already built it, want to buy it?"). The ctaBody and trustLine should
acknowledge that specific offer in plain language a small business owner would
trust.

Output the JSON object now.`;
}

interface OllamaChatResponse {
  message?: { content?: string };
  error?: string;
}

async function callOllama(listing: Listing): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: "json",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(listing) },
      ],
      options: { temperature: 0.4 },
    }),
  });
  if (!res.ok) {
    throw new Error(`Ollama returned HTTP ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as OllamaChatResponse;
  if (data.error) throw new Error(`Ollama error: ${data.error}`);
  const content = data.message?.content?.trim();
  if (!content) throw new Error("Ollama returned empty content");
  return content;
}

function parseCopy(raw: string): GeneratedCopy {
  const parsed = JSON.parse(raw) as Partial<GeneratedCopy>;
  const required: (keyof GeneratedCopy)[] = [
    "headline",
    "subheadline",
    "aboutParagraph",
    "servicesIntro",
    "ctaHeadline",
    "ctaBody",
    "trustLine",
  ];
  for (const key of required) {
    const value = parsed[key];
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Generated copy missing required field: ${key}`);
    }
  }
  return parsed as GeneratedCopy;
}

async function main(): Promise<void> {
  const slug = process.argv[2] ?? "default";
  const inPath = resolve(REPO_ROOT, "data", "listings", `${slug}.json`);
  const outPath = resolve(REPO_ROOT, "data", "listings", `${slug}.generated.json`);

  const listing = JSON.parse(await readFile(inPath, "utf8")) as Listing;

  console.log(`[generate-copy] listing: ${listing.name} (${listing.slug})`);
  console.log(`[generate-copy] model:   ${OLLAMA_MODEL} @ ${OLLAMA_URL}`);

  const rawJson = await callOllama(listing);
  const copy = parseCopy(rawJson);

  const generated: GeneratedListing = {
    listing,
    copy,
    generatedAt: new Date().toISOString(),
    model: OLLAMA_MODEL,
  };

  await writeFile(outPath, JSON.stringify(generated, null, 2) + "\n", "utf8");
  console.log(`[generate-copy] wrote  ${outPath}`);
  console.log(`[generate-copy] headline: ${copy.headline}`);
}

main().catch((err: unknown) => {
  console.error("[generate-copy] failed:", err);
  process.exitCode = 1;
});
