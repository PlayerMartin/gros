# Tech stack

## Runtime

- **Next.js** (app router) — single process, API routes, React server components.
- **TypeScript** — type safety across the stack.

## Database

- **better-sqlite3** — synchronous SQLite access, WAL mode. Fast and appropriate
  for personal-scale workloads. No ORM, no connection pooling, no external
  database server.

## Auth

- **Better Auth** — native SQLite adapter, email/password provider, CLI
  migrations. Chosen over Auth.js for simpler SQLite integration.

## UI

- **Tailwind CSS** — utility-first styling.
- **shadcn/ui** — accessible component primitives (buttons, dialogs, forms).
- **Recharts** — pie chart (spending by tag) and line chart (balance over time).

## Package manager

pnpm only — see → [setup](../technical/setup.md) for native-module caveats (`onlyBuiltDependencies` in `pnpm-workspace.yaml`).

## Design principles

- **Dark mode only** for MVP — no light mode toggle.
- **Mobile-first** — bottom navigation bar, touch-friendly transaction entry.

→ [Architecture](architecture.md)
→ [Auth decisions](../reference/decisions.md)