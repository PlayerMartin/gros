# AGENTS.md — Finance Analysis Tool

Self-hosted personal finance tracker: Next.js app router + better-sqlite3 + Better Auth, event sourcing with SQLite, one-command deploy.

## How to use

Read this manifest to understand the project's shape. Then open only the docs
whose tags match your current task. Never load all docs.

## Doc index

| File | Tags |
|---|---|
| `docs/product/identity.md` | identity, value-proposition, overview |
| `docs/product/features.md` | features, mvp-scope, roadmap, out-of-scope |
| `docs/product/data-model.md` | data-model, event-sourcing, schema, tables, query-strategy |
| `docs/technical/architecture.md` | architecture, lib-structure, separation-of-concerns, runtime |
| `docs/technical/auth.md` | auth, better-auth, middleware, registration |
| `docs/technical/event-sourcing.md` | event-sourcing, event-types, replay, edits, snapshots |
| `docs/technical/exchange-rates.md` | exchange-rates, ecb, currency, eur, czk |
| `docs/technical/stack.md` | stack, dependencies, nextjs, sqlite, tailwind, shadcn, recharts |
| `docs/technical/setup.md` | setup, scaffold, deploy, npm, dependencies |
| `docs/reference/decisions.md` | decisions, rationale, tradeoffs |
| `docs/reference/roadmap.md` | roadmap, next-steps, implementation-order |

## Maintenance rules

- **New doc:** Add its row to the index table with relevant tags. Place under
  the matching subdirectory.
- **Split doc:** When a doc crosses ~150 lines or covers 3+ distinct topics,
  split it into atomic files and update the index table.
- **Deleted doc:** Remove its row from the index. Check all other docs for stale
  cross-references to the deleted file.
- **Renamed/moved doc:** Update the path in the index and every cross-reference
  pointing to it.
- **Code changed significantly:** Review docs in the same bucket for staleness.
  Gotchas and reference docs are the most rot-prone.
- **Cross-reference format:** `→ [short description](../path)` — keep it
  compact and scannable.
