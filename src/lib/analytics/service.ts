import type Database from "better-sqlite3";
import { getDb } from "../db";
import { listEventsForReplay } from "../events/service";
import { EventType, type EventRow } from "../events/types";
import { computeBalance, listAccounts } from "../accounts/service";
import { convertCurrency } from "../exchange-rates/service";
import { getPrimaryCurrency } from "../settings";

export interface SpendingBucket {
  tagId: string | null;
  tagName: string;
  amount: number;
  currency: string;
}

export interface DashboardFilters {
  accountId?: string | null;
  from?: string | null;
  to?: string | null;
}

function isVoided(events: EventRow[], eventId: string): boolean {
  return events.some(
    (v) =>
      v.eventType === EventType.TransactionVoided &&
      v.originalEventId === eventId
  );
}

/**
 * Total spending (out transactions) by tag over a period, converted to the
 * user's primary currency.
 */
export function spendingByTag(
  db: Database.Database,
  userId: string,
  filters: DashboardFilters = {}
): SpendingBucket[] {
  const events = listEventsForReplay(db, userId);
  const primary = getPrimaryCurrency(db, userId);
  const accounts = new Map(listAccounts(db, userId).map((a) => [a.id, a]));

  const byTag = new Map<string | null, number>();

  for (const e of events) {
    if (e.eventType !== EventType.TransactionCreated) continue;
    if (isVoided(events, e.id)) continue;
    if (e.direction !== "out") continue;
    if (filters.accountId && e.accountId !== filters.accountId) continue;
    if (filters.from && e.date && e.date < filters.from) continue;
    if (filters.to && e.date && e.date > filters.to) continue;
    if (!e.accountId) continue;

    const account = accounts.get(e.accountId);
    const value = convertCurrency(
      db,
      e.amount ?? 0,
      account?.currency ?? primary,
      primary,
      e.date
    );
    const key = e.tagId ?? null;
    byTag.set(key, (byTag.get(key) ?? 0) + value);
  }

  const buckets: SpendingBucket[] = [];
  for (const [tagId, amount] of byTag) {
    if (amount <= 0) continue;
    const row = tagId
      ? (db.prepare("SELECT name FROM tags WHERE id = ?").get(tagId) as
          | { name: string }
          | undefined)
      : undefined;
    buckets.push({
      tagId,
      tagName: row?.name ?? "Uncategorized",
      amount,
      currency: primary,
    });
  }
  return buckets.sort((a, b) => b.amount - a.amount);
}

export interface BalancePoint {
  date: string;
  value: number;
}

/**
 * Balance over time, converted to primary currency, for a single account or
 * all accounts combined (net worth).
 */
export function balanceHistory(
  db: Database.Database,
  userId: string,
  filters: DashboardFilters = {}
): BalancePoint[] {
  const events = listEventsForReplay(db, userId);
  const accountId = filters.accountId ?? null;
  const primary = getPrimaryCurrency(db, userId);
  const accounts = listAccounts(db, userId);
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  const dateSet = new Set<string>();
  for (const e of events) {
    if (e.date) dateSet.add(e.date);
  }
  const dates = Array.from(dateSet).sort();

  const points: BalancePoint[] = [];
  for (const date of dates) {
    const { perAccount } = computeBalance(db, userId, accountId, date);
    let total = 0;
    if (accountId) {
      const acct = accountMap.get(accountId);
      total = convertCurrency(
        db,
        perAccount[accountId] ?? 0,
        acct?.currency ?? primary,
        primary,
        date
      );
    } else {
      for (const acct of accounts) {
        total += convertCurrency(
          db,
          perAccount[acct.id] ?? 0,
          acct.currency,
          primary,
          date
        );
      }
    }
    points.push({ date, value: Math.round(total * 100) / 100 });
  }
  return points;
}
