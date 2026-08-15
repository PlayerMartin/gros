const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: "€",
  CZK: "Kč",
  USD: "$",
  GBP: "£",
  JPY: "¥",
};

/**
 * Format an amount for a currency with locale-aware grouping. Dark, compact
 * output used across the dashboard.
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
  return `${sign}${symbol}${formatted}`;
}

/** Short sign-aware formatter for axis labels and compact chips. */
export function compactCurrency(amount: number, currency = "EUR"): string {
  const symbol = CURRENCY_SYMBOL[currency] ?? `${currency} `;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}${symbol}${(abs / 1000).toFixed(1)}k`;
  }
  return `${sign}${symbol}${abs.toFixed(0)}`;
}
