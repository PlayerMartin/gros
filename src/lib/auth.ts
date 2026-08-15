import { betterAuth } from "better-auth";
import { getDb } from "./db";
import { migrate } from "./schema";
import { seedDefaultTag } from "./tags/service";
import { ensureSettings } from "./settings";

// Ensure base + auth tables exist before the auth instance uses the DB.
migrate(getDb());

export const auth = betterAuth({
  // bun:sqlite is supported natively — pass the Database instance directly.
  database: getDb(),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "http://192.168.1.*:3000",
    "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // On registration: seed the default tag + settings row.
          seedDefaultTag(getDb(), user.id);
          ensureSettings(getDb(), user.id);
        },
      },
    },
  }
});

/** Require an authenticated user, returning the session or null. */
export async function getSessionUser(
  headers: Headers
): Promise<{ userId: string; email: string } | null> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) return null;
  return { userId: session.user.id, email: session.user.email ?? "" };
}
