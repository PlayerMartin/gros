import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { createAccount, listAccounts } from "@/lib/accounts/service";
import { convertCurrency } from "@/lib/exchange-rates/service";
import { getPrimaryCurrency } from "@/lib/settings";
import { computeBalance } from "@/lib/accounts/service";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const primary = getPrimaryCurrency(db, user.userId);
  const balances = computeBalance(db, user.userId);
  const accounts = listAccounts(db, user.userId).map((a) => {
    const raw = balances.perAccount[a.id] ?? 0;
    return {
      id: a.id,
      name: a.name,
      currency: a.currency,
      balance: Math.round(raw * 100) / 100,
      balancePrimary: Math.round(convertCurrency(db, raw, a.currency, primary) * 100) / 100,
      initialBalance: a.initialBalance,
      createdAt: a.createdAt,
      closed: a.closed,
    };
  });
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const body = await req.json();
  const { name, currency, initialBalance } = body;
  if (!name || !currency) {
    return NextResponse.json({ error: "name and currency are required" }, { status: 400 });
  }
  if (currency !== "EUR" && currency !== "CZK") {
    return NextResponse.json({ error: "currency must be EUR or CZK" }, { status: 400 });
  }
  const account = createAccount(db, {
    userId: user.userId,
    name: String(name).trim(),
    currency,
    initialBalance: initialBalance ? Number(initialBalance) : 0,
  });
  return NextResponse.json({ account }, { status: 201 });
}

