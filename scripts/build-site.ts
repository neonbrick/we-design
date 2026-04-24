#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { GeneratedListing } from "../src/listing.js";
import { renderSite } from "../src/renderSite.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

async function main(): Promise<void> {
  const slug = process.argv[2] ?? "default";
  const inPath = resolve(REPO_ROOT, "data", "listings", `${slug}.generated.json`);
  const outDir = resolve(REPO_ROOT, "dist");
  const outPath = resolve(outDir, "index.html");

  const generated = JSON.parse(await readFile(inPath, "utf8")) as GeneratedListing;
  const html = renderSite(generated);

  await mkdir(outDir, { recursive: true });
  await writeFile(outPath, html, "utf8");

  console.log(`[build-site] ${generated.listing.name} -> ${outPath} (${html.length} bytes)`);
}

main().catch((err: unknown) => {
  console.error("[build-site] failed:", err);
  process.exitCode = 1;
});
