import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createTransfer } from "@/lib/events/service";
import { listAccounts } from "@/lib/accounts/service";

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const body = await req.json();
  const { fromAccountId, toAccountId, amount, date, note } = body;

  if (!fromAccountId || !toAccountId || amount == null || !date) {
    return NextResponse.json(
      { error: "fromAccountId, toAccountId, amount and date are required" },
      { status: 400 }
    );
  }
  if (fromAccountId === toAccountId) {
    return NextResponse.json(
      { error: "Source and destination must differ" },
      { status: 400 }
    );
  }
  const open = listAccounts(db, user.userId).filter((a) => !a.closed);
  if (!open.some((a) => a.id === fromAccountId) || !open.some((a) => a.id === toAccountId)) {
    return NextResponse.json({ error: "Account not found" }, { status: 400 });
  }

  const ev = createTransfer(db, {
    userId: user.userId,
    fromAccountId,
    toAccountId,
    amount: Number(amount),
    date,
    note: note || null,
  });
  return NextResponse.json({ transfer: ev }, { status: 201 });
}
