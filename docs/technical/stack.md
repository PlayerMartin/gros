# Tech stack

## Runtime

- **Bun** — runtime for all `next` invocations (dev, build, start). Since Bun
  ships its own SQLite driver, there are **zero native modules** in this
  project — nothing to compile, no ABI issues across machines/containers.
- **Next.js** (app router) — single process, API routes, React server components.
- **TypeScript** — type safety across the stack.

## Database

- **bun:sqlite** — synchronous SQLite access built into the Bun runtime, WAL
  mode. API is modeled on better-sqlite3 (prepare/get/all/run/transaction), so
  the migration was a near drop-in. Requires `PRAGMA busy_timeout` (bun:sqlite
  lacks better-sqlite3's built-in 5 s busy timeout). No ORM, no external server.

## Auth

- **Better Auth** — native `bun:sqlite` dialect (auto-detected via the kysely
  adapter), email/password provider. Chosen over Auth.js for simpler SQLite
  integration.

## UI

- **Tailwind CSS** — utility-first styling.
- **shadcn/ui** — accessible component primitives (buttons, dialogs, forms).
- **Recharts** — pie chart (spending by tag) and line chart (balance over time).

## Package manager & runtime split

- **pnpm** installs dependencies (lockfile: `pnpm-lock.yaml`).
- **Bun** executes them: scripts in `package.json` are prefixed `bun --bun`, so
  `pnpm dev`, `pnpm build`, `pnpm start` all drive Next.js on the Bun runtime.
- No `onlyBuiltDependencies` approvals needed — there are no dependency build
  scripts to run. (`pnpm install` may print an *Ignored build scripts* warning
  for `sharp`/`unrs-resolver`; benign — both ship prebuilt binaries via
  optional dependencies.)

## Deployment

Docker, one command — see → [setup](../technical/setup.md#deployment). The image
builds with pnpm and runs the app on Bun.

## Design principles

- **Dark mode only** for MVP — no light mode toggle.
- **Mobile-first** — bottom navigation bar, touch-friendly transaction entry.

→ [Architecture](architecture.md)
→ [Auth decisions](../reference/decisions.md)