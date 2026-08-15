# Key decisions

## Stack: Next.js app router + better-sqlite3 + Better Auth

Single process, one file database, no containers or orchestration.
Deployment: `git clone && npm install && npm start`.

## Auth library: Better Auth (not Auth.js)

- Native SQLite adapter — `new Database("file.db")`.
- ~10 lines for email/password setup.
- CLI migrations direct to SQLite.
- Auth.js has awkward SQLite support and widely-reported documentation pain.

## Data model: Event sourcing with wide typed columns

- Immutable transaction history, full audit trail.
- Balance-at-any-point-in-time via event replay.
- Wide table (not pure JSON payload) keeps queries indexable and type-safe.
- Typed columns for common fields, nullable where not applicable.

## Edits: Atomic void + create in a DB transaction

- UI presents a simple edit form.
- Business logic atomically appends `TRANSACTION_VOIDED` + new `TRANSACTION_CREATED`.
- User never sees the complexity.

## Sequence numbering: Global auto-increment

- Single timeline across all events.
- Per-account sequences would make cross-account queries (total net worth)
  inconsistent during replay.

## Exchange rates: ECB daily XML feed

- Free, no API key, covers EUR/CZK.
- Fetched once per day, stored in database.

## Multi-user: Separate profiles, fully isolated data

- Each user owns their own accounts, tags, and transactions.
- Better Auth handles authentication, userId scopes all queries.

## Tags: Single tag per transaction, predefined set per user

- "Uncategorized" tag seeded on registration, cannot be deleted.
- Tag deletion prevented if referenced by existing transactions (DB constraint +
  UI restriction).

## UI: Mobile-first dark mode, Tailwind + shadcn/ui + Recharts

- Dark mode as default and only mode for MVP.
- shadcn/ui for accessible component primitives.
- Recharts for pie and line charts.

## Snapshots/caching: Postponed

- Replaying even 10k events is milliseconds in SQLite.
- Weekly snapshots are a future performance optimization.

## CSV import: Postponed

- Manual entry only for MVP.
- Per-bank CSV format parsing belongs in a future version.

→ [Tech stack](../technical/stack.md)
→ [Event sourcing implementation](../technical/event-sourcing.md)
→ [Auth configuration](../technical/auth.md)