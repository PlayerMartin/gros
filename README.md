# Groš · Personal Finance

A self-hosted, open-source personal finance tracker. Single Next.js process
running on the **Bun runtime**, one SQLite database (`bun:sqlite`), deployed
with Docker in one command.

Built on **event sourcing**: every mutation is an immutable event, and balances
and reports are derived by replay. Multi-account, multi-currency (EUR/CZK with
daily ECB rates), multi-user with full isolation.

The name comes from the **groš**, the small silver coin of the medieval Czech
lands — a deliberate record of modest, well-kept amounts. No subscriptions,
no sync, no noise.

## Stack

- **Bun** runtime (dev, build, start) + **Next.js** 16 (app router) + **TypeScript** + **Tailwind** v4
- **bun:sqlite** (WAL mode, built into the runtime) — no native modules at all
- **Better Auth** — email/password, SQLite backend
- **Recharts** — pie + line charts

## Getting started

**pnpm** installs, **Bun** runs.

```bash
pnpm install

# optional: set a real auth secret (see .env.example)
cp .env.example .env

pnpm dev      # Bun runtime on http://localhost:3000
```

The database is created automatically at `data/finance.db` on first run
(app tables + Better Auth tables + the default "Uncategorized" tag).

## Production with Docker

One command:

```bash
docker compose up -d --build
```

- Listens on port 3000, keeps data in `./data` (bind mount).
- Requires `BETTER_AUTH_SECRET` in `.env` for production.
- Container runs as non-root (uid 1000); on Linux hosts run
  `chown -R 1000:1000 ./data` once.

The multi-stage image installs with pnpm and runs Next.js on Bun — the
container idles at ~115 MB RSS.

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
