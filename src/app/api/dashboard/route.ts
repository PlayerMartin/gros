import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { listAccounts } from "@/lib/accounts/service";
import { computeBalance } from "@/lib/accounts/service";
import { spendingByTag, balanceHistory } from "@/lib/analytics/service";
import { getPrimaryCurrency } from "@/lib/settings";
import { convertCurrency } from "@/lib/exchange-rates/service";

/**
 * Dashboard aggregate: accounts with balances, spending by tag, and balance
 * history, all converted to the user's primary currency.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();

  const accountId = req.nextUrl.searchParams.get("accountId") || null;
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const primary = getPrimaryCurrency(db, user.userId);

  const accounts = listAccounts(db, user.userId);
  const balances = computeBalance(db, user.userId, accountId);

  const accountsWithBalance = accounts.map((a) => {
    const raw = balances.perAccount[a.id] ?? 0;
    const converted = convertCurrency(db, raw, a.currency, primary);
    return {
      id: a.id,
      name: a.name,
      currency: a.currency,
      balance: Math.round(raw * 100) / 100,
      balancePrimary: Math.round(converted * 100) / 100,
      closed: a.closed,
    };
  });

  const filters = { accountId, from, to };
  const spending = spendingByTag(db, user.userId, filters);
  const history = balanceHistory(db, user.userId, filters);

  const totalPrimary = accountsWithBalance
    .filter((a) => !a.closed)
    .reduce((s, a) => s + a.balancePrimary, 0);

  return NextResponse.json({
    accounts: accountsWithBalance,
    spending,
    history,
    primary,
    totalBalance: Math.round(totalPrimary * 100) / 100,
  });
}
