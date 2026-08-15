import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { getPrimaryCurrency, setPrimaryCurrency } from "@/lib/settings";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  return NextResponse.json({ primaryCurrency: getPrimaryCurrency(db, user.userId) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const body = await req.json();
  const { primaryCurrency } = body;
  if (primaryCurrency !== "EUR" && primaryCurrency !== "CZK") {
    return NextResponse.json({ error: "primaryCurrency must be EUR or CZK" }, { status: 400 });
  }
  setPrimaryCurrency(db, user.userId, primaryCurrency);
  return NextResponse.json({ primaryCurrency });
}
