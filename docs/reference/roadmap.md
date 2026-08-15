# Implementation roadmap

Ordered by priority — each step builds on the previous.

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

→ [Project setup](../technical/setup.md)
→ [MVP features](../product/features.md)