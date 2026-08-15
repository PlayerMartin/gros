# MVP features and scope

## Core features

- **Multi-user:** separate profiles, email/password auth.
- **Multi-account:** multiple bank accounts per user, initial balance on creation, create and close lifecycle.
- **Multi-currency:** EUR and CZK accounts, daily ECB rates, primary (default) currency per user. Display rules: each account's total shows in its own currency; the All view and its charts speak the primary currency; filtering the dashboard to a single account switches every shown value to that account's native currency.
- **Manual transactions:** amount, direction (in/out), date, single tag, account, optional note. Tags can be created inline from the transaction form.
- **Transfers between accounts:** captured as two atomic events (debit + credit); transfers are not listed in the activity feed (entries only).
- **Tags:** per-user set, managed in settings, renamed inline on the Activity list. "Uncategorized" is seeded on registration and cannot be deleted.
- **Onboarding:** create-account dialog presented on first login.

## Views

**Dashboard (home)**

- Total balance header: primary currency by default, the filtered account's currency when an account chip is selected.
- Accounts card: every open account's total in that account's own currency.
- Balance line chart and spending pie chart for the visible scope.
- Recent activity: the 5 latest transactions, newest first, respecting the account filter.

**Spending pie chart**

- Spending by tag for a time period, per-account or all-accounts filter.
- Hover popup pinned to the right of the donut so the center "Total" is never covered.
- Stable per-tag colors keyed by tag id; "Uncategorized" always the fixed gray.

**Transaction list (Activity)**

- Each row is a real button — click anywhere to edit; delete via the row ✕ or the edit dialog.
- Sort options: date newest/oldest, amount high/low; default newest first.
- Compact filter strip: account chips, from/to dates, min/max amount, reset when active.
- Empty state distinguishes "no transactions yet" from "no transactions match the filters".

**Balance line graph**

- Balance over time for a single account or all accounts, in the view's currency.
- Robust date labels — never renders `Invalid Date` on the x axis.

## Settings

- Tag management — create, rename, delete (blocked if referenced by transactions).
- Primary currency selection — EUR or CZK; a change instantly re-syncs every open view.

## Out of scope

- CSV/bank import — per-bank format complexity, future version.
- Budgeting / budget targets — different product category.
- Recurring transactions — scheduling complexity.
- Shared accounts between users — requires permissions model.
- Data export — nice-to-have, not core analysis.
- Light mode — dark mode only for MVP.
- Public API — internal Next.js routes only.
- Weekly snapshots / caching — performance optimization for later.
- Password reset flow — Better Auth supports adding later.
- OAuth / social login — email/password only for MVP.

→ [Identity and deployment model](identity.md)
→ [Event sourcing and data model](data-model.md)
→ [Key decisions behind the UI conventions](../reference/decisions.md)
→ [Completed and open roadmap items](../reference/roadmap.md)