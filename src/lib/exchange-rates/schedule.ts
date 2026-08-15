import { getDb } from "../db";
import { migrate } from "../schema";
import { fetchDailyRates, hasTodayRate } from "./service";

let started = false;

/**
 * Start the exchange-rate scheduler: fetch on server start (if today's rate is
 * missing) and re-fetch every 24h at the configured local hour (default 03:00).
 *
 * Guarded so it only runs once per process even across dev hot-reloads.
 */
export function startDailyRates(hour = 3): void {
  if (started) return;
  started = true;

  // Ensure tables exist before any rate query.
  migrate(getDb());

  runFetch("startup", { quiet: true });
  scheduleNext(hour);
}

async function runFetch(source: string, opts: { quiet?: boolean } = {}): Promise<void> {
  const db = getDb();
  // Quick path: skip a redundant fetch if a rate for today is already stored.
  if (opts.quiet && hasTodayRate(db)) {
    console.log(`[exchange-rates] today's rate already stored; skipped ${source} fetch`);
    return;
  }
  try {
    const info = await fetchDailyRates(db);
    if (info) {
      console.log(
        `[exchange-rates] fetched ${info.count} rates for ${info.date} (${source})`
      );
    }
  } catch (e) {
    // Non-fatal: conversion falls back to same-currency data when offline.
    console.error(
      `[exchange-rates] ${source} fetch failed:`,
      e instanceof Error ? e.message : e
    );
  }
}

function scheduleNext(hour: number): void {
  const timer = setTimeout(() => {
    runFetch("daily");
    scheduleNext(hour);
  }, msUntil(hour));
  timer.unref?.();
}

/** Milliseconds until the next occurrence of `hour` (00-23) local time. */
function msUntil(hour: number): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(hour, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime() - now.getTime();
}
