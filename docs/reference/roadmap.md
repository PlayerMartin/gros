# Implementation roadmap

Ordered by priority — the MVP build sequence. All steps below are implemented
and shipped.

1. Scaffold Next.js project with TypeScript, Tailwind, and app router
2. Install dependencies: better-sqlite3, better-auth, recharts, shadcn/ui
3. Set up SQLite schema — create events, tags, and exchange_rates tables in `lib/schema.ts`
4. Set up database connection — `lib/db.ts` with WAL mode and singleton pattern
5. Configure Better Auth — `lib/auth.ts` with email/password provider and SQLite adapter
6. Build event sourcing layer — `lib/events/types.ts`, then `repository.ts`, then `service.ts`
7. Build account and tag services — `lib/accounts/`, `lib/tags/`
8. Build exchange rate service — `lib/exchange-rates/` with ECB fetch and conversion helpers
9. Implement API routes — transactions CRUD, account management, tag management, dashboard data endpoints
10. Build auth pages — login and register
11. Build UI shell — root layout, bottom navigation, onboarding create-account dialog
12. Build dashboard — spending pie chart, balance line graph, transaction list
13. Build transaction form — manual entry with tag selection and transfer support
14. Build settings — tag manager and primary currency selector

## Post-MVP view iteration — implemented

View/UX additions built after the initial dashboard, driven by the product's
ideas list:

- Dashboard accounts card with per-account totals in native currency; header
  total in the default currency.
- Currency symbol after the amount; larger money figures on all views.
- Inline tag creation from the transaction form (auto-selected on save).
- Clickable transaction rows (whole row = edit) and delete from the edit dialog.
- Transaction sorting (default newest) and filters (dates, amount, account) on
  the Activity page.
- Stable per-tag colors with "Uncategorized" fixed to gray.
- Side-anchored donut tooltip (center "Total" never covered).
- Primary currency change propagates to all open views instantly.
- Filtered dashboard view shows values in the account's own currency.
- Balance chart date-axis robustness (no `Invalid Date`).

## Open ideas — next

- Evaluate a Bun runtime vs the current Next.js server.
- More views (beyond Home, Activity, Settings).
- Per-view filter rows — control account/all scope and currency per view.

→ [Project setup](../technical/setup.md)
→ [MVP features](../product/features.md)
