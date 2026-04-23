# We design

Foundation repo for the **We design** company. This is the placeholder app
that lets us prove out the dev loop, CI, and deploy path before product scope
locks. Real product code lands once
[WED-2](../../WED/issues/WED-2) clarifies what we're building and
[WED-4](../../WED/issues/WED-4) ships the first vertical slice.

## Stack

- **Vite + TypeScript (vanilla)** — no framework lock-in yet.
- **Vitest** for unit tests.
- **ESLint (flat config) + Prettier** for lint/format.
- **GitHub Actions** for CI (lint, format check, typecheck, test, build).
- **GitHub Pages** as the placeholder deploy target ($0/month).

Choices are intentionally cheap and reversible. Swap React/Svelte/Solid in by
adding the plugin later; swap Pages for Cloudflare/Netlify by changing the
deploy workflow.

## Requirements

- **Node 22.x** (see `.nvmrc`). Anything 20+ should work, but CI pins to
  `.nvmrc`.
- **npm 10+** (ships with Node 22).
- **git**, plus **gh** if you want to use the GitHub repo flow.

## Fresh-clone quickstart

```sh
git clone https://github.com/neonbrick/we-design.git
cd we-design
nvm use            # optional, picks up .nvmrc
npm install
npm run dev        # http://localhost:5173
```

Target: clone → running app in well under 15 minutes.

## Daily commands

| Task           | Command                |
| -------------- | ---------------------- |
| Dev server     | `npm run dev`          |
| Unit tests     | `npm run test`         |
| Test (watch)   | `npm run test:watch`   |
| Lint           | `npm run lint`         |
| Lint (autofix) | `npm run lint:fix`     |
| Format         | `npm run format`       |
| Format check   | `npm run format:check` |
| Typecheck      | `npm run typecheck`    |
| Build          | `npm run build`        |
| Preview build  | `npm run preview`      |

CI runs `lint`, `format:check`, `typecheck`, `test`, `build` on every push and
pull request to `main`. See `.github/workflows/ci.yml`.

## Layout

```
.
├── index.html              # Vite entry
├── src/
│   ├── main.ts             # App bootstrap
│   ├── greet.ts            # Sample module (placeholder)
│   └── greet.test.ts       # Sample Vitest test
├── eslint.config.js        # ESLint flat config
├── vite.config.ts          # Vite build config
├── vitest.config.ts        # Vitest test config
├── tsconfig.json           # Strict TS config
└── .github/workflows/
    ├── ci.yml              # Lint + typecheck + test + build
    └── deploy.yml          # Build + publish to GitHub Pages
```

## Deploy

Production deploys are automatic on push to `main` via
`.github/workflows/deploy.yml`. The workflow builds the site and publishes
the `dist/` output to the **`gh-pages`** branch using
[`peaceiris/actions-gh-pages`](https://github.com/peaceiris/actions-gh-pages);
**GitHub Pages** then serves that branch.

We use this branch-based path (rather than the newer
`actions/deploy-pages` Pages-deployments pipeline) because it is the
simplest fully-free option that doesn't get wedged on first-time
provisioning. The deploy job uses only `GITHUB_TOKEN` — no extra secrets.

One-time setup (first push only):

1. Push the repo to GitHub.
2. In the repo settings → **Pages**, set **Source** to **Deploy from a
   branch** and pick **`gh-pages`** / `/ (root)`.
   (Already configured for `neonbrick/we-design`.)
3. Push to `main` (or use **Run workflow** on the _Deploy to GitHub Pages_
   action).

The workflow sets `VITE_BASE_PATH=/<repo-name>/` so asset URLs resolve
correctly under the Pages subpath. If we move the deploy target later
(custom domain, Cloudflare Pages, Netlify, Fly, etc.), update
`vite.config.ts` and the `deploy.yml` workflow — no app code changes
required.

Manual deploy:

```sh
# Trigger the deploy workflow without pushing a commit:
gh workflow run "Deploy to GitHub Pages"
```

Live URL: <https://neonbrick.github.io/we-design/> — published by the
_Deploy to GitHub Pages_ job (see the
[deploy workflow runs](https://github.com/neonbrick/we-design/actions/workflows/deploy.yml)).

## Roadmap pointers

- Foundation: [WED-3](../../WED/issues/WED-3) (this repo).
- Product scope: [WED-2](../../WED/issues/WED-2) (CEO, in progress).
- First vertical slice: [WED-4](../../WED/issues/WED-4) (CTO, blocked on
  WED-2 + WED-3).
