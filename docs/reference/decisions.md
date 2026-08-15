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

## Currency display conventions

- The currency mark always follows the amount (`1 000€`, `12.3k€`), never precedes it.
- Per-account totals always show in that account's own currency — the dashboard
  Accounts card and the settings list never convert them.
- The All view reports everything in the primary currency (converted).
  Filtering the dashboard to one account switches the header, charts and
  spending to that account's native currency with no FX conversion.
- Money figures are one type-scale step larger than labels everywhere, for
  mobile readability.

## Tag colors

- Deterministic per-tag color: hash of the tag id into a 10-color palette, so a
  tag's color never shifts when other tags or transactions are added.
- "Uncategorized" (seeded tag or null id) is locked to a fixed neutral gray in
  every view.
- Shared implementation in `lib/utils/colors.ts` so all colored views stay
  consistent.

## Whole-row transaction editing

- A transaction row is a real `<button>`; clicking anywhere opens the editor.
- Delete is available both from the edit dialog and via a compact ✕ on the row.
- Replaced the earlier per-row "Edit" button + confirm flow.

## Currency-change propagation

- API client fetches use `cache: no-store` so a stale merged response can never
  be served after a settings change.
- Settings dispatches a `finance:currency-changed` window event; dashboard and
  activity views listen and re-fetch in place — no refresh or navigation needed.

## Donut tooltip placement

- Donut charts pin the hover popup to the right of the ring via a fixed Recharts
  `position` (with `allowEscapeViewBox`), so the centered "Total" stays visible
  and the popup does not drift over content.

## Snapshots/caching: Postponed

- Replaying even 10k events is milliseconds in SQLite.
- Weekly snapshots are a future performance optimization.

## CSV import: Postponed

- Manual entry only for MVP.
- Per-bank CSV format parsing belongs in a future version.

→ [Tech stack](../technical/stack.md)
→ [Event sourcing implementation](../technical/event-sourcing.md)
→ [Auth configuration](../technical/auth.md)
→ [Feature behavior](../product/features.md)