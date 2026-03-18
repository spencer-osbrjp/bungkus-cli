# bungkus-cli

A CLI tool to quickly scaffold frontend projects with pre-configured tooling. Stop wasting time on boilerplate setup — just run one command and start building.

## Usage

```bash
npm create bungkus
# or
bun create bungkus
```

## Why

Setting up a new frontend project means configuring the same tools over and over: CSS frameworks, linters, formatters, deployment tools. `bungkus-cli` bundles all of that into a single command so you can go from zero to a fully configured project in seconds.

## Tech Stack

- **TypeScript** — type safety, better DX
- **clack** (`@clack/prompts`) — interactive CLI prompts
- **commander** — command and argument parsing
- **giget** — download templates from git repos
- **picocolors** — terminal colors
- **magicast** — programmatically modify JS/TS config files
- **tsup** — bundle the CLI for distribution

## Roadmap

### v1 — Astro

- Astro project scaffolding
- Frontend tooling: Tailwind CSS, vanilla CSS, shadcn, Prettier, Biome, ESLint
- Cloudflare Wrangler integration

### v2 — Frameworks

- Vue (Nuxt) and React (Next.js) project bases
- AI-assisted development with Claude MD

### v3 — Full Stack

- Backend integration to support full-stack project scaffolding
