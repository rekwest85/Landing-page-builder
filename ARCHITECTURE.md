# Forge — Architecture

## The Block Tree (the heart of everything)

```
Page
 └─ Block[]   (linear children — flat list, easy to drag/reorder)
      ├─ id (nanoid)
      ├─ type (hero | features | pricing | ...)
      ├─ props (type-specific data)
      ├─ style (padding, background, color)
      └─ children? (for section/columns containers)
```

Every page is just this. Stored as JSONB in Postgres. One row per page.

```sql
pages (
  id text pk,
  tree jsonb,          -- Block[]
  status text,         -- DRAFT | PUBLISHED
  workspace_id text,
  ...
)
```

## The 3 Consumers

```
                 ┌─ Editor (live preview, click-to-edit)
                 │
Block Tree ─────┼─ AI (reads → generates / edits / improves)
                 │
                 └─ Renderer (server-renders to HTML for /p/[slug])
```

Same data, three different views.

## AI Pipeline (3 stages, parallel where possible)

```
Brief: "AI landing page builder for SaaS founders"
       │
       ▼
[1] EXTRACT INTENT       (cheap model, JSON mode)
    { offer, audience, tone, industry, benefits }
       │
       ▼
[2] STRUCTURE PAGE       (medium model, JSON mode)
    [ { type: "hero" }, { type: "features" }, ... ]
       │
       ▼
[3] FILL COPY (parallel) (best model, per-block prompt)
    ┌─ hero copy    ─┐
    ├─ features copy ─┤  →  Promise.all
    ├─ pricing copy  ─┤
    └─ cta copy     ─┘
       │
       ▼
Block[]  →  inserted into editor
```

Why three stages?
- Stage 1 gives global context once (one model call)
- Stage 2 just decides structure (cheap)
- Stage 3 is the expensive call but runs in parallel for each block
- Each stage can use a different model — fast/cheap for structure, best for copy

## Subdomain Routing

```
acme.forge.so/foo  →  proxy.ts rewrites to  /_serve/acme?path=foo
                                  ↓
                    /_serve/[subdomain]/page.tsx resolves:
                      workspace = lookup by subdomain slug
                      page = lookup by (workspace, slug)
                      ↓
                    RenderTree(blocks)
```

Single Next.js app, no separate stack for published pages. Wildcard DNS at the edge handles the routing.

## File Map

```
src/
├─ app/
│  ├─ layout.tsx              # Root layout + Sonner toaster
│  ├─ globals.css             # Dark theme + utilities
│  ├─ page.tsx                # Marketing landing
│  ├─ dashboard/page.tsx      # List of pages
│  ├─ editor/[pageId]/page.tsx# Editor entry — loads page from DB
│  ├─ p/[slug]/page.tsx       # Local preview
│  ├─ _serve/[subdomain]/...  # Subdomain serve handler
│  └─ api/                    # CRUD + AI routes
├─ components/
│  ├─ ui/                     # Button, Dialog, Input, Tooltip
│  └─ editor/                 # Editor-specific
│     ├─ Editor.tsx           # Main shell (top bar + 3 panels + canvas)
│     ├─ EditorTopBar.tsx
│     ├─ BlockLibrary.tsx     # Left rail
│     ├─ EditorCanvas.tsx     # Center
│     ├─ BlockOutline.tsx     # Hover/select outlines
│     ├─ PropertyPanel.tsx    # Right: Design tab
│     ├─ StylePanel.tsx       # Right: Style tab
│     ├─ AIPanel.tsx          # Right: AI tab
│     └─ RightPanel.tsx       # Right panel switcher
├─ lib/
│  ├─ blocks/
│  │  ├─ types.ts             # Block schema + 15 block definitions
│  │  └─ renderer.tsx         # Block → React (server-renderable)
│  ├─ ai/
│  │  ├─ client.ts            # OpenAI-compatible wrapper
│  │  ├─ prompts.ts           # Stage 1/2/3 prompts
│  │  └─ generate.ts          # Orchestration
│  ├─ db.ts                   # Prisma + Neon
│  └─ utils.ts                # cn(), formatters
├─ stores/
│  └─ editor.ts               # Zustand store
└─ proxy.ts                   # Wildcard subdomain routing
```

## Why this architecture

| Decision | Rationale |
|----------|-----------|
| Block tree in JSONB | Single source of truth. Easy to version, diff, A/B test. Queryable inside with `jsonb_path_query`. |
| Server-render blocks | Zero JS shipped to visitors. Lighthouse-friendly. Instant page loads. |
| Stage-3 parallel copy | Fast AI generation (2-4s for full page) vs. 15-30s for sequential. |
| Subdomain via proxy.ts | No second app to deploy/maintain. One Vercel project, one Neon DB. |
| Zustand for editor state | Simple, fast, no boilerplate. Real-time updates without re-render storms. |
| Block library = registry pattern | Adding a new block = add to `BLOCK_DEFINITIONS` + renderer. That's it. |

## Next milestones

1. Voice memo → page (Whisper transcription + same pipeline)
2. Inline text editing on canvas (click-to-edit without opening panel)
3. Conversion score predictor (pre-publish)
4. Analytics tracker + AI auto-rewrite weak sections
5. Custom domain support with auto-SSL
6. White-label for agencies
