const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: "€",
  CZK: "Kč",
  USD: "$",
  GBP: "£",
  JPY: "¥",
};

/**
 * Format an amount for a currency with locale-aware grouping. Dark, compact
 * output used across the dashboard. The currency mark is placed after the
 * number (e.g. 1 000€, 1000Kč).
 */
export function formatCurrency(
  amount: number,
  currency = "EUR"
): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  const formatted = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${formatted}${symbol}`;
}

/** Short sign-aware formatter for axis labels and compact chips. */
export function compactCurrency(amount: number, currency = "EUR"): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}${(abs / 1000).toFixed(1)}k${symbol}`;
  }
  return `${sign}${abs.toFixed(0)}${symbol}`;
}
