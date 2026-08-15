import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import {
  createTransaction,
  listLiveTransactions,
} from "@/lib/events/service";
import { listAccounts } from "@/lib/accounts/service";
import type { EventRow } from "@/lib/events/types";

type DB = ReturnType<typeof getDb>;

function enrich(db: DB, userId: string, rows: EventRow[]) {
  const accounts = new Map(listAccounts(db, userId).map((a) => [a.id, a]));
  const tags = new Map(
    (
      db
        .prepare("SELECT id, name FROM tags WHERE userId = ?")
        .all(userId) as { id: string; name: string }[]
    ).map((t) => [t.id, t.name])
  );
  return rows.map((e) => ({
    id: e.id,
    accountId: e.accountId,
    accountName: e.accountId ? accounts.get(e.accountId)?.name ?? null : null,
    amount: e.amount,
    direction: e.direction,
    tagId: e.tagId,
    tagName: e.tagId ? tags.get(e.tagId) ?? null : null,
    date: e.date,
    note: e.note,
    createdAt: e.createdAt,
  }));
}

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const accountId = req.nextUrl.searchParams.get("accountId");
  let rows = listLiveTransactions(db, user.userId);
  if (accountId) rows = rows.filter((r) => r.accountId === accountId);
  return NextResponse.json({ transactions: enrich(db, user.userId, rows) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const body = await req.json();
  const { accountId, amount, direction, tagId, date, note } = body;

  if (!accountId || amount == null || !direction || !date) {
    return NextResponse.json(
      { error: "accountId, amount, direction and date are required" },
      { status: 400 }
    );
  }
  if (direction !== "in" && direction !== "out") {
    return NextResponse.json(
      { error: "direction must be 'in' or 'out'" },
      { status: 400 }
    );
  }
  const account = listAccounts(db, user.userId).find(
    (a) => a.id === accountId && !a.closed
  );
  if (!account)
    return NextResponse.json({ error: "Account not found" }, { status: 400 });

  const ev = createTransaction(db, {
    userId: user.userId,
    accountId,
    amount: Number(amount),
    direction,
    tagId: tagId || null,
    date,
    note: note || null,
  });
  return NextResponse.json(
    { transaction: enrich(db, user.userId, [ev])[0] },
    { status: 201 }
  );
}
