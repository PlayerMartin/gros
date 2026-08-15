# Project setup

## Package manager: pnpm

This project uses **pnpm** exclusively — never `npm install` or `yarn`.

```bash
pnpm install
pnpm add <pkg>        # dependencies
pnpm add -D <pkg>     # dev dependencies
```

### Native modules (better-sqlite3)

`better-sqlite3` ships a native binary. Two things keep it working:

1. **Approved build script** — `onlyBuiltDependencies: [better-sqlite3]` is set in `pnpm-workspace.yaml`. pnpm v10 blocks dependency build scripts by default; without this entry `pnpm install` silently skips fetching the prebuilt binary and `require('better-sqlite3')` fails with `MODULE_NOT_FOUND better_sqlite3.node`. If it ever breaks, fix with:
   ```bash
   cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3
   node <store>/prebuild-install@*/node_modules/prebuild-install/bin.js
   ```
2. **Prebuilt binary** is downloaded from GitHub releases — requires network on first install. If it fails, the above command retries the fetch without a full reinstall.

## Scaffold

```
npx create-next-app@latest finance-analysys --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

## Dependencies

```bash
pnpm add better-sqlite3 better-auth recharts
pnpm add -D @types/better-sqlite3   # optional stub; better-sqlite3 has built-in types
```

shadcn/ui components added incrementally via `npx shadcn-ui@latest add`.

## Database setup

1. Create `lib/db.ts` — SQLite connection with WAL mode, singleton pattern.
2. Create `lib/schema.ts` — events, tags, and exchange_rates table creation.

## Deployment

```
git clone <repo>
pnpm install
pnpm start
```

No containers, no orchestration, no external services. One command to deploy. (`pnpm install` requires the
`pnpm-workspace.yaml` approve-builds entry above or the native binary will be missing.)

## Implementation order

See the → [roadmap](../reference/roadmap.md) for the ordered build plan.

→ [Stack details](stack.md)
→ [Architecture](architecture.md)
