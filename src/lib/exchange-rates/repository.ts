import type { Database } from "bun:sqlite";

export interface RateRow {
  date: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
}

/** Upsert a rate (PK on date/from/to). */
export function upsertRate(
  db: Database,
  rate: RateRow
): void {
  db.prepare(
    `INSERT INTO exchange_rates (date, fromCurrency, toCurrency, rate)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(date, fromCurrency, toCurrency) DO UPDATE SET rate = excluded.rate`
  ).run(rate.date, rate.fromCurrency, rate.toCurrency, rate.rate);
}

/** Rates between two currencies on or before a date (closest in time). */
export function getClosestRateOnOrBefore(
  db: Database,
  from: string,
  to: string,
  date: string
): RateRow | null {
  const row = db
    .prepare(
      `SELECT * FROM exchange_rates
       WHERE fromCurrency = ? AND toCurrency = ? AND date <= ?
       ORDER BY date DESC LIMIT 1`
    )
    .get(from, to, date) as RateRow | undefined;
  return row ?? null;
}

/** The most recent stored rate for a currency pair. */
export function getLatestRate(
  db: Database,
  from: string,
  to: string
): RateRow | null {
  const row = db
    .prepare(
      `SELECT * FROM exchange_rates
       WHERE fromCurrency = ? AND toCurrency = ?
       ORDER BY date DESC LIMIT 1`
    )
    .get(from, to) as RateRow | undefined;
  return row ?? null;
}
