import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { fetchDailyRates } from "@/lib/exchange-rates/service";

/** POST /api/exchange-rates/refresh — fetch and store today's ECB rates. */
export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  try {
    const info = await fetchDailyRates(db);
    return NextResponse.json({ ok: true, ...info });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to fetch rates";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
