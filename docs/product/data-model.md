# Data model

Event sourcing with a wide typed events table — columns for all common fields,
nullable where not applicable. Typed columns keep queries indexable and
type-safe without a separate read model.

## Events table

```
events:
  id                  TEXT PK
  sequenceNumber      INTEGER NOT NULL (global, auto-increment)
  userId              TEXT NOT NULL
  eventType           TEXT NOT NULL
  accountId           TEXT            -- nullable
  amount              REAL            -- nullable
  direction           TEXT            -- 'in' | 'out', nullable
  tagId               TEXT            -- nullable
  date                TEXT            -- nullable (ISO date)
  transferToAccountId TEXT            -- nullable
  note                TEXT            -- nullable
  originalEventId     TEXT            -- nullable (for void events)
  payload             TEXT            -- optional JSON for event-specific extras
  createdAt           TEXT NOT NULL
```

## Event types (MVP)

| Type | Purpose |
|---|---|
| `transaction_created` | A new transaction |
| `transaction_voided` | Reverses a previous transaction |
| `transfer_created` | A transfer between accounts |
| `account_created` | A new bank account |
| `account_closed` | Account closed (hidden from active views, history preserved) |
| `tag_created` | A new tag |

## Supporting tables

- **tags** — `id, userId, name, createdAt`. UNIQUE on `(userId, name)`.
- **exchange_rates** — `date, fromCurrency, toCurrency, rate`. PRIMARY KEY on `(date, fromCurrency, toCurrency)`.
- **settings** — `userId, primaryCurrency, updatedAt`. PRIMARY KEY on `userId`. Stores the user's
  display currency (EUR or CZK).
- **auth tables** — `user`, `session`, `account`, `verification` (Better Auth email/password). Created
  in `lib/schema.ts` alongside the app tables (`user`/`session` are SQLite keywords, so quoted).

## Query strategy

- **Current state queries** (transaction list, pie chart): query events with `eventType = 'transaction_created'` and a void-checking `WHERE NOT EXISTS` subquery. Typed columns are indexed for performance.
- **Balance computation:** replay relevant events from sequence 0 (or from the most recent snapshot once built).
- **Historical balance:** replay events up to the target date, using exchange rates closest to that date.
- **No separate read model for MVP:** the wide event table handles both event sourcing and efficient querying.

## Edits

Atomic void + create in a DB transaction. The UI presents a simple edit form.
Business logic appends a `transaction_voided` event + new `transaction_created`
event atomically. The user never sees the complexity.

→ [Event sourcing implementation](../technical/event-sourcing.md)
→ [Exchange rates](../technical/exchange-rates.md)