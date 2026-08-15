import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { editTransaction, voidTransaction } from "@/lib/events/service";
import { listAccounts } from "@/lib/accounts/service";

interface Params {
  id: string;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<Params> }) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const db = getDb();
  const body = await req.json();
  const { accountId, amount, direction, tagId, date, note } = body;

  if (!accountId || amount == null || !direction || !date) {
    return NextResponse.json(
      { error: "accountId, amount, direction and date are required" },
      { status: 400 }
    );
  }
  if (!listAccounts(db, user.userId).some((a) => a.id === accountId && !a.closed)) {
    return NextResponse.json({ error: "Account not found" }, { status: 400 });
  }

  const ev = editTransaction(db, user.userId, id, {
    userId: user.userId,
    accountId,
    amount: Number(amount),
    direction,
    tagId: tagId || null,
    date,
    note: note || null,
  });
  return NextResponse.json({ id: id, replacedBy: ev.id });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<Params> }) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const db = getDb();
  voidTransaction(db, user.userId, id);
  return NextResponse.json({ ok: true });
}
