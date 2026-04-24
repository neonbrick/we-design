# We design

AI-generated one-page websites for small businesses who have a Google listing
but no website. We pitch the site to them at a flat **$499**. This repo is
the generation + deploy pipeline.

> First vertical slice lives at
> <https://neonbrick.github.io/we-design/> — one real listing,
> one AI-generated page, one mock $499 checkout.

## Pipeline

```
data/listings/<slug>.json             (raw listing — edit to swap businesses)
      │
      ▼  npm run generate              (LLM writes copy, local only)
data/listings/<slug>.generated.json    (listing + generated copy, committed)
      │
      ▼  npm run build                 (deterministic render, no network)
dist/index.html                        (published to gh-pages → GitHub Pages)
```

The JSON seam keeps three concerns independent: ingestion, copy generation,
and rendering. Swapping ingestion sources or the LLM provider doesn't touch
the renderer.

## Stack

- **TypeScript** (strict, `verbatimModuleSyntax`).
- **tsx** runs the build + generate scripts directly from TS, no bundler.
- **Vitest** for renderer + utility tests.
- **Local Ollama** (`qwen2.5:14b` by default) for copy generation — free, no
  API key needed, easy to swap for a hosted model later.
- **GitHub Actions** for CI (lint, format check, typecheck, test, build).
- **GitHub Pages** for hosting the generated static site.

All choices are cheap and reversible. Adding React/Svelte or swapping to
Cloudflare Pages / Netlify / Fly is a contained change.

## Requirements

- **Node 22.x** (see `.nvmrc`). npm 10+.
- **git**, plus **gh** for the GitHub flow.
- **Ollama** running locally if you want to regenerate copy
  (<https://ollama.com>). Pull a model: `ollama pull qwen2.5:14b`.

## Fresh-clone quickstart

```sh
git clone https://github.com/neonbrick/we-design.git
cd we-design
nvm use                # optional, picks up .nvmrc
npm install
npm run build          # builds dist/index.html from committed generated JSON
npm run preview        # serves dist/ at http://localhost:4173
```

Target: clone → deployed-quality page rendered locally in under 15 minutes.

## Regenerating the site copy

The committed `*.generated.json` files are the canonical output of the LLM
step; CI never calls the LLM. To refresh copy (or swap in a different
business), edit the raw listing JSON and re-run `npm run generate`:

```sh
# Edit data/listings/default.json with the new listing.
OLLAMA_MODEL=qwen2.5:14b npm run generate
npm run build
git diff data/listings/default.generated.json dist/index.html
```

Configuration via env vars (all optional):

| Var            | Default                  | Purpose                |
| -------------- | ------------------------ | ---------------------- |
| `OLLAMA_URL`   | `http://localhost:11434` | Ollama daemon base URL |
| `OLLAMA_MODEL` | `qwen2.5:14b`            | Chat model to use      |

## Daily commands

| Task           | Command                |
| -------------- | ---------------------- |
| Generate copy  | `npm run generate`     |
| Build site     | `npm run build`        |
| Preview build  | `npm run preview`      |
| Unit tests     | `npm run test`         |
| Test (watch)   | `npm run test:watch`   |
| Lint           | `npm run lint`         |
| Lint (autofix) | `npm run lint:fix`     |
| Format         | `npm run format`       |
| Format check   | `npm run format:check` |
| Typecheck      | `npm run typecheck`    |

CI runs `lint`, `format:check`, `typecheck`, `test`, `build` on every push
and pull request to `main`. See `.github/workflows/ci.yml`.

## Layout

```
.
├── data/
│   └── listings/
│       ├── default.json               # raw listing (input)
│       └── default.generated.json     # listing + AI-generated copy
├── scripts/
│   ├── generate-copy.ts               # LLM call, local only
│   └── build-site.ts                  # deterministic render → dist/
├── src/
│   ├── listing.ts                     # shared types + loaders
│   ├── renderSite.ts                  # pure (listing, copy) → HTML
│   └── renderSite.test.ts             # Vitest coverage
├── .github/workflows/
│   ├── ci.yml                         # lint + typecheck + test + build
│   └── deploy.yml                     # build + publish to gh-pages
├── eslint.config.js
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

## Deploy

Production deploys happen automatically on push to `main` via
`.github/workflows/deploy.yml`. The workflow builds the site and publishes
`dist/` to the **`gh-pages`** branch using
[`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages);
**GitHub Pages** then serves that branch. No secrets beyond `GITHUB_TOKEN`.

One-time setup (already configured for `neonbrick/we-design`):

1. Push the repo to GitHub.
2. In the repo settings → **Pages**, set **Source** to **Deploy from a
   branch** and pick **`gh-pages`** / `/ (root)`.
3. Push to `main` (or use **Run workflow** on the _Deploy to GitHub Pages_
   action).

Manual deploy:

```sh
gh workflow run "Deploy to GitHub Pages"
```

Live URL: <https://neonbrick.github.io/we-design/>.

## Roadmap pointers

- First vertical slice: [WED-4](../../WED/issues/WED-4).
- Product scope (locked): [WED-2](../../WED/issues/WED-2#document-scope).
- Repo foundation: [WED-3](../../WED/issues/WED-3).

## Follow-up slices (not in this one)

- Real Google Places / SerpAPI ingestion + "has a website?" filter.
- Swap Ollama for a hosted model once board spend is approved; the JSON
  seam means the renderer does not change.
- Stripe Checkout wired to the CTA button.
- Outbound email template that links to a generated preview.
