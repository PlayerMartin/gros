import type Database from "better-sqlite3";
import { getDb } from "../db";
import {
  upsertRate,
  getClosestRateOnOrBefore,
  getLatestRate,
} from "./repository";

const ECB_URL = "https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml";
const today = () => new Date().toISOString().slice(0, 10);

export interface ParsedRate {
  currency: string;
  rate: number; // units of currency per 1 EUR
}

function parseEcbXml(xml: string): ParsedRate[] {
  const rates: ParsedRate[] = [];
  // <Cube currency="CZK" rate="25.123"/>
  const re = /currency=["']([A-Z]{3})["'][^>]*rate=["']([0-9.]+)["']/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    rates.push({ currency: m[1], rate: parseFloat(m[2]) });
  }
  return rates;
}

/**
 * Fetch the ECB daily XML and store the EUR/CZK (and other) rates for today.
 * ECB rates are EUR-base (1 EUR = rate units of the currency), which is stored
 * as fromCurrency EUR -> toCurrency <CCY>.
 */
export async function fetchDailyRates(
  db: Database.Database = getDb()
): Promise<RateInfo | null> {
  const res = await fetch(ECB_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`ECB fetch failed: ${res.status}`);
  }
  const xml = await res.text();
  const rates = parseEcbXml(xml);
  if (rates.length === 0) {
    throw new Error("No rates found in ECB feed");
  }
  const date = today();
  for (const r of rates) {
    upsertRate(db, {
      date,
      fromCurrency: "EUR",
      toCurrency: r.currency,
      rate: r.rate,
    });
  }
  return { date, count: rates.length };
}

export interface RateInfo {
  date: string;
  count: number;
}

/**
 * True if a rate is available for today; else false (callers may trigger a
 * refresh).
 */
export function hasTodayRate(db: Database.Database): boolean {
  return !!getLatestRate(db, "EUR", "CZK");
}

/**
 * Convert `amount` from one currency to another, using the closest rate on or
 * before `date` (or the latest stored rate if no date given / none found).
 * Handles EUR<->CZK and identity conversions; falls back to EUR pivot.
 */
export function convertCurrency(
  db: Database.Database,
  amount: number,
  from: string,
  to: string,
  date?: string | null
): number {
  if (from === to) return amount;
  const dateKey = date && date.length === 10 ? date : today();

  const factor = conversionFactor(db, from, to, dateKey);
  if (factor === null) {
    throw new Error(
      `No exchange rate available for ${from}->${to} on ${dateKey}`
    );
  }
  return amount * factor;
}

function conversionFactor(
  db: Database.Database,
  from: string,
  to: string,
  date: string
): number | null {
  // direct
  const d = getClosestRateOnOrBefore(db, from, to, date);
  if (d) return d.rate;
  // inverse
  const inv = getClosestRateOnOrBefore(db, to, from, date);
  if (inv) return 1 / inv.rate;
  // pivot through EUR
  const fromEur = getClosestRateOnOrBefore(db, from, "EUR", date);
  const toEur = getClosestRateOnOrBefore(db, to, "EUR", date);
  if (fromEur && toEur) return fromEur.rate / toEur.rate;
  return null;
}
