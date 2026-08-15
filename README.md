# Fold · Personal Finance

A self-hosted, open-source personal finance tracker. Single Next.js process,
one SQLite database — no containers, no external services.

Built on **event sourcing**: every mutation is an immutable event, and balances
and reports are derived by replay. Multi-account, multi-currency (EUR/CZK with
daily ECB rates), multi-user with full isolation.

## Stack

- **Next.js** 16 (app router) + **TypeScript** + **Tailwind** v4
- **better-sqlite3** (WAL mode) — event sourcing with a wide typed `events` table
- **Better Auth** — email/password, SQLite backend
- **Recharts** — pie + line charts

## Getting started

Uses **pnpm** exclusively.

```bash
pnpm install

# optional: set a real auth secret (see .env.example)
cp .env.example .env

pnpm dev      # http://localhost:3000
```

The database is created automatically at `data/finance.db` on first run
(app tables + Better Auth tables + the default "Uncategorized" tag).

> **Native module note:** `better-sqlite3` needs its prebuilt binary. The
> `onlyBuiltDependencies` entry in `pnpm-workspace.yaml` makes pnpm fetch it on
> install. See `docs/technical/setup.md` if it ever goes missing.

## Production

```bash
pnpm build
pnpm start
```

Set a real `BETTER_AUTH_SECRET` in production.

## Features

- Email/password auth, registration seeds a default tag
- Multi-account with initial balance, create/close lifecycle
- Manual transactions (in/out, tag, note) and account transfers
- Edits recorded as atomic void + create events (full audit trail)
- Entity purchase analysis: spending pie by tag, balance-over-time chart
- Settings: tag manager, primary currency selector

## Docs

See [`docs/`](docs) — product specs, technical architecture, and decisions.
Start with [`AGENTS.md`](AGENTS.md).
