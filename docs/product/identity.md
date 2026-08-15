# Project identity

A self-hosted, open-source personal finance tracker that runs as a single
Next.js process backed by SQLite — zero external dependencies, one command to
deploy. It is the simplest possible alternative to overcomplicated solutions
like Firefly III and Actual Budget.

## Core design

- **One process, one database.** No containers, no orchestration, no external services.
- **Event sourcing.** Immutable transaction history, full audit trail, balance-at-any-point-in-time.
- **Multi-user with isolation.** Each user owns their accounts, tags, and transactions.
- **Multi-currency.** EUR and CZK with daily ECB exchange rates.
- **Manual entry.** No CSV import or bank sync — focused on deliberate, accurate tracking.
- **Mobile-first dark UI.** Tailwind + shadcn/ui + Recharts, dark mode as the only mode for MVP.

## Deployment model

```
git clone && pnpm install && pnpm start
```
