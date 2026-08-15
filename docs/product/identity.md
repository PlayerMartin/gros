# Project identity

A self-hosted, open-source personal finance tracker that runs as a single
Next.js process backed by SQLite — zero external dependencies, one command to
deploy. It is the simplest possible alternative to overcomplicated solutions
like Firefly III and Actual Budget.

## Name

**Groš** (pron. *grosh*) is the small silver coin of the medieval Czech lands
(from Latin *grossus*, "thick coin"). The name is a promise: deliberate
entries, modest amounts, carefully kept — the opposite of an over-engineered
finance dashboard.

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
