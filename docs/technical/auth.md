# Authentication

Better Auth with native SQLite adapter and email/password provider.

## Configuration

Better Auth configured in `lib/auth.ts`. The better-sqlite3 integration needs **no separate
adapter package** — Better Auth supports the `Database` instance natively, so we pass it
straight to the `database` option:

```ts
import { betterAuth } from "better-auth";
import { getDb } from "./db";

export const auth = betterAuth({ database: getDb(), emailAndPassword: { enabled: true } });
```

Passing a raw `Database` instance does **not** auto-create the auth tables, so `lib/schema.ts`
creates `user`, `session`, `account`, and `verification` alongside the app tables (`user` and
`session` are SQLite keywords and must be quoted). Set `BETTER_AUTH_SECRET` in `.env` — see
`lib/auth.ts` for dev fallbacks and `.env.example`.

The auth instance trusts **every origin** by default (`trustedOrigins: ["*"]`) and resolves the
base URL from each incoming request. This lets login work from `localhost` and from any machine
on the LAN via its IP (e.g. `http://192.168.1.101:3000`) without reconfiguring. Do **not** hardcode
`BETTER_AUTH_URL=http://localhost:3000` in `.env` — that pins the origin to `localhost` and causes
"[Better Auth]: Invalid origin" when logging in from another machine. Only set `BETTER_AUTH_URL`
when serving from a single fixed public origin.

## Auth flow

- **Middleware** protects all routes except `/login` and `/register`.
- **On registration:** seed the "Uncategorized" tag for the new user.
- **On first login:** show the create-account onboarding dialog.

## Why Better Auth (not Auth.js)

- Native SQLite adapter — literal `new Database("file.db")`, no ORM wrappers.
- ~10 lines for email/password setup.
- CLI migrations direct to SQLite.
- Auth.js has awkward SQLite support and widely-reported documentation pain.

## Out of scope for MVP

- Password reset flow — Better Auth supports adding this later.
- OAuth / social login — email/password only.

→ [Architecture overview](architecture.md)
→ [Stack decisions](../reference/decisions.md)