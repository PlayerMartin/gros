import type Database from "better-sqlite3";
import { getDb } from "./db";

export const DEFAULT_CURRENCY = "EUR";

/** Primary currency for a user (used to convert dashboard displays). */
export function getPrimaryCurrency(
  db: Database.Database,
  userId: string
): string {
  const row = db
    .prepare("SELECT primaryCurrency FROM settings WHERE userId = ?")
    .get(userId) as { primaryCurrency: string } | undefined;
  return row?.primaryCurrency ?? DEFAULT_CURRENCY;
}

export function setPrimaryCurrency(
  db: Database.Database,
  userId: string,
  currency: string
): void {
  const updatedAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO settings (userId, primaryCurrency, updatedAt) VALUES (?, ?, ?)
     ON CONFLICT(userId) DO UPDATE SET
       primaryCurrency = excluded.primaryCurrency,
       updatedAt = excluded.updatedAt`
  ).run(userId, currency, updatedAt);
}

/** Seed a user's settings row on registration (idempotent). */
export function ensureSettings(db: Database.Database, userId: string): void {
  const row = db
    .prepare("SELECT userId FROM settings WHERE userId = ?")
    .get(userId);
  if (!row) {
    setPrimaryCurrency(db, userId, DEFAULT_CURRENCY);
  }
}
