# Project setup

## Installation: pnpm + Bun runtime

**pnpm** installs dependencies; **Bun** executes them. Scripts in `package.json`
are prefixed `bun --bun`, so the Next.js CLI runs on the Bun runtime no matter
how it's invoked.

```bash
pnpm install
pnpm add <pkg>        # dependencies
pnpm add -D <pkg>     # dev dependencies
```

`pnpm install` may print an *Ignored build scripts* warning for
`sharp`/`unrs-resolver`. Benign: both ship prebuilt native binaries through
optional dependencies; their scripts only add validation. Do not add
`onlyBuiltDependencies` entries for them unless installs start failing.

## Native modules

None. The database driver is **bun:sqlite**, built into the Bun runtime — no
C++ compilation, no prebuilt binaries, no ABI compatibility issues across
machines or containers. `better-sqlite3` was removed because its native binary
crashes the Bun runtime.

### bun:sqlite gotchas (worth knowing)

1. **`db.pragma()` does not exist** — use `db.exec("PRAGMA ...")`.
2. **No default busy timeout** — `db.ts` sets `PRAGMA busy_timeout = 5000`
   explicitly. Without it, concurrent writers fail with `SQLITE_BUSY`.
3. **`PRAGMA journal_mode = WAL` ignores busy_timeout** — if another process
   first-touches the same fresh file, the second gets an immediate `SQLITE_BUSY`
   (the busy handler does not apply to journal-mode transitions). `next build`
   opens the DB from 11 parallel workers, so `db.ts` retries the transition and
   the `prebuild` script seeds the schema in a single process beforehand.
4. **Named-parameter object binding misaligns when a value is `null`** —
   the app binds positionally (`?`) everywhere instead.
5. Types come from `@types/bun` (which includes Node API types), hence no
   `@types/node` dependency.

## Scaffold

```
npx create-next-app@latest finance-analysys --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

## Dependencies

```bash
pnpm add better-auth recharts
pnpm add -D @types/bun
```

shadcn/ui components added incrementally via `npx shadcn-ui@latest add`.

## Database setup

1. Create `lib/db.ts` — bun:sqlite connection with WAL mode, busy_timeout, singleton pattern.
2. Create `lib/schema.ts` — events, tags, and exchange_rates table creation in one transaction.

## Development

```bash
cp .env.example .env    # optional: set a real auth secret
pnpm dev                # Bun runtime on http://localhost:3000
```

`pnpm build` first runs `prebuild` (`scripts/init-db.ts`), which creates the
SQLite schema in a single process — required before the parallel build workers
open the database (see the WAL gotcha above).

## Deployment

Docker, one command (uses pnpm to install, **Bun to run**):

```bash
docker compose up -d --build
```

- The app listens on port 3000; SQLite data persists in `./data` (bind mount).
- Set `BETTER_AUTH_SECRET` via `.env` (compose reads it with `env_file`).
- The container runs as non-root (`bun` user, uid 1000). On **Linux hosts**,
  ensure the bind mount is writable: `chown -R 1000:1000 ./data`.

The database and all tables are created automatically on first request — no
manual init step. See the [`Dockerfile`](../../Dockerfile) for the multi-stage
build (pnpm install → build on Bun → lean Bun runtime image).

## Implementation order

See the → [roadmap](../reference/roadmap.md) for the ordered build plan.

→ [Stack details](stack.md)
→ [Architecture](architecture.md)