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

## Visual identity: gold-on-ink

- Warm near-black charcoal background (`#13110B`), warm ivory type, hairline ink rules.
- **Chrome is monochrome**: buttons, chips, cards, nav, filters never use gold.
- **Color is spent on money**: balance/income figures are gold (`#E3AB50`), outflows are ember (`#E07059`). The only other color is data-viz hue (tag palette, donut) where segments must be distinguishable.
- **Type**: Space Grotesk for UI text, IBM Plex Mono for every money figure (tabular, print-ledger feel). Fonts are vendored in the repo (`src/app/fonts`, full-coverage OFL TTFs from google/fonts, licenses alongside) and served via `next/font/local` — self-hosted, so the Docker build makes no outbound request for type. Full coverage matters: the CZK mark is `Kč` (latin-ext) and Czech tag/account names use ž/š/ř/ě/ů.
- **Layout**: mobile-first single column; expands to a 12-column grid at ≥`md` (accounts beside the balance chart, spending beside recent activity); bottom nav for all sizes. The main rail narrows to `max-w-md` on phones and widens to `lg:max-w-5xl` on desktop.
- Selection and keyboard focus are gold (highlight system); chrome never is.

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
- The centered Total figure sizes itself to the formatted length (mono advance
  ≈ 0.58em; 20px → 10.5px floor) and the hole grows from innerRadius 52 → 66 as
  a last resort, keeping a 12px clear zone between the figure and the ring so
  a large balance never slides under it.

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