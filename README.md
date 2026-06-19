# Forge — AI-native landing page builder

The next-generation landing page builder. Better than Elementor. Better than Brizy.

**Core idea:** Every page is a tree of blocks. AI writes the trees. The editor edits the trees. The renderer renders the trees. One shape, three consumers.

## Status

🚧 Building the MVP. Currently functional end-to-end:

- ✅ Block schema (15 block types: hero, features, pricing, FAQ, CTA, form, etc.)
- ✅ Dark-mode editor (Figma × Linear × Framer feel)
  - Left rail: searchable block library
  - Center: live canvas with hover/select outlines
  - Right panel: design / style / AI tabs
- ✅ 3-stage AI generation pipeline (intent → structure → copy, parallel per block)
- ✅ Auto-save + manual publish flow
- ✅ Wildcard subdomain serving via Next.js 16 proxy.ts
- ✅ Database on Neon Postgres via Prisma 7
- 🚧 Auth (Clerk coming)
- 🚧 Analytics + conversion score

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Database | Neon Postgres + Prisma 7 |
| AI | OpenAI-compatible (works with OpenAI, DeepSeek, Kimi, etc.) |
| Styling | Tailwind 4 + custom dark theme |
| State | Zustand |
| Animations | Framer Motion |
| UI primitives | Radix UI |

## Setup

```bash
npm install
cp .env.example .env  # fill in DATABASE_URL from neon.tech
npx prisma db push
npm run dev
```

Optional: add `OPENAI_API_KEY` to `.env` to enable AI generation. Without it, a heuristic fallback generates a solid template page so the UI still works.

## Architecture

See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the deep-dive on the block tree model, AI pipeline, and rendering strategy.

## Deploy

Push to GitHub → import in Vercel → set `DATABASE_URL` + `OPENAI_API_KEY` env vars → deploy. Wildcard subdomains require DNS setup (`*.forge.so` → Vercel).
