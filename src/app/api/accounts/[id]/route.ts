import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { closeAccount } from "@/lib/accounts/service";

/** POST /api/accounts/[id] with { action: "close" } closes an account. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json().catch(() => ({}));
  if (body.action !== "close") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }
  closeAccount(db, user.userId, id);
  return NextResponse.json({ ok: true });
}
