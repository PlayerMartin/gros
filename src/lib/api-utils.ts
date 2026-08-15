import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { Database } from "bun:sqlite";

/**
 * Resolve the authenticated user for an API route. Returns null on
 * unauthorized. Callers should `return unauthorized()`.
 */
export async function requireUser(
  headers: Headers
): Promise<{ userId: string; email: string } | null> {
  return getSessionUser(headers);
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function notFound(message = "Not found"): NextResponse {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function serverError(error: unknown): NextResponse {
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ error: message }, { status: 500 });
}

export type Authed<H> = H & { db: Database; userId: string };

/** Wraps a route handler with auth + db, mapping thrown errors to responses. */
export function withAuth<A, Args extends any[], H>(
  fn: (args: A, ctx: { db: Database; userId: string; params: H }) => Promise<NextResponse> | NextResponse
): (args: A, ctx: { params: Promise<H> }) => Promise<NextResponse> {
  return async (args, rawCtx) => {
    const user = await getSessionUser(
      args instanceof Request ? args.headers : (args as any).headers
    );
    if (!user) return unauthorized();
    try {
      const params = (await rawCtx?.params) ?? ({} as H);
      return await fn(args, {
        db: getDb(),
        userId: user.userId,
        params,
      });
    } catch (e) {
      return serverError(e);
    }
  };
}
