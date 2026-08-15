# Architecture

Single Next.js process using the app router. Internal API routes handle data
operations. bun:sqlite (built into the Bun runtime) provides synchronous SQLite
access with WAL mode plus a 5 s busy timeout for concurrent read safety during
writes.

## Separation of concerns

Business logic lives in `lib/` as plain TypeScript modules with no dependency on
React, Next.js request/response objects, or UI frameworks. This keeps the door
open for future refactoring (extracting a separate API server) without rewriting
core logic.

## Library structure

```
lib/
├── auth.ts                  # Better Auth configuration (bun:sqlite dialect)
├── auth-client.ts           # Client-side Better Auth instance (`better-auth/react`)
├── api-utils.ts             # Auth + error helpers for API route handlers
├── db.ts                    # bun:sqlite connection (WAL, busy_timeout, singleton)
├── schema.ts                # Table creation & migrations (app + auth tables)
├── settings.ts              # Primary-currency settings helpers
├── events/
│   ├── types.ts             # Event type constants & TypeScript types
│   ├── repository.ts        # Insert & query events
│   └── service.ts           # createTransaction, voidTransaction, replayEvents
├── accounts/
│   ├── repository.ts        # Account query helpers
│   └── service.ts           # createAccount, closeAccount, computeBalance
├── tags/
│   ├── repository.ts        # Tag CRUD helpers
│   └── service.ts           # createTag, deleteTag (with constraint checks)
├── exchange-rates/
│   ├── repository.ts        # Rate storage & retrieval
│   ├── service.ts           # fetchDailyRates, convertCurrency
│   └── schedule.ts          # Server-start + daily 03:00 fetch scheduler
├── analytics/
│   └── service.ts           # spendingByTag, balanceHistory (dashboard queries;
│                            #   optional target currency → native filtered views)
└── utils/
    ├── currency.ts          # Amount + compact formatting (symbol after number)
    └── colors.ts            # Stable per-tag colors, fixed Uncategorized gray
```

→ [Stack and dependencies](stack.md)
→ [Event sourcing implementation](event-sourcing.md)
→ [Auth configuration](auth.md)
→ [Exchange rates](exchange-rates.md)