# MVP features and scope

## Core features

- **Multi-user:** separate profiles, email/password auth.
- **Multi-account:** multiple bank accounts per user, initial balance on creation, create and close lifecycle.
- **Multi-currency:** EUR and CZK, daily ECB exchange rates, user sets primary currency in settings.
- **Manual transactions:** amount, direction (in/out), date, single tag, account, optional note.
- **Transfers between accounts:** captured as two atomic events (debit + credit).
- **Tags:** predefined set per user, managed in settings. "Uncategorized" default tag seeded on registration, cannot be deleted.
- **Onboarding:** create-account dialog presented on first login.

## Analysis views

- **Spending pie chart:** total spending by tag for a time period, per-account or all-accounts filter, amounts converted to user's primary currency.
- **Transaction list:** all transactions showing tag and direction, filterable by account, ordered by date.
- **Balance line graph:** account balance over time, per-account or all-accounts view, converted to primary currency.

## Settings

- Tag management — create, rename, delete (blocked if referenced by transactions).
- Primary currency selection — EUR or CZK.

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