# Event sourcing

Immutable transaction history with full audit trail and time-travel queries.
All mutations are events; current state is derived by replay.

## Event types

Defined in `lib/events/types.ts`. See the data model doc for the full events
table schema.

| Type | Payload fields |
|---|---|
| `transaction_created` | accountId, amount, direction, tagId, date, note |
| `transaction_voided` | originalEventId |
| `transfer_created` | accountId, transferToAccountId, amount, date |
| `account_created` | accountId, amount (initial balance) |
| `account_closed` | accountId |
| `tag_created` | tagId |

## Edit strategy

An edit is an atomic void + create inside a single DB transaction:
1. Append a `transaction_voided` event referencing the original.
2. Append a new `transaction_created` event with the corrected data.

The user sees a simple edit form. The void + create pattern is invisible in the
UI.

## Sequence numbering

Global auto-increment across all events — a single timeline. Per-account
sequences would make cross-account queries (total net worth) inconsistent during
replay.

## Replay strategy

- **Current balance:** replay all events from sequence 0.
- **Historical balance:** replay events up to the target date, using exchange
  rates closest to that date.
- **Performance:** replaying even 10k events is milliseconds in SQLite with WAL
  mode. No snapshot/caching system needed for MVP.

## Snapshots

Postponed. Weekly snapshots are a future performance optimization, not a
day-one necessity at personal-scale workloads.

→ [Data model schema](../product/data-model.md)
→ [Architecture and lib/ structure](architecture.md)