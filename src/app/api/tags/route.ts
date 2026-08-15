import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { listTagsForUser, createTag } from "@/lib/tags/service";

export async function GET(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  return NextResponse.json({ tags: listTagsForUser(db, user.userId) });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req.headers);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  const body = await req.json();
  const { name } = body;
  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  try {
    const tag = createTag(db, user.userId, String(name));
    return NextResponse.json({ tag }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create tag";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
