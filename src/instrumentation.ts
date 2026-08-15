/**
 * Next.js runtime instrumentation. `register()` runs once when the server
 * starts — here we kick off the daily ECB exchange-rate scheduler.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startDailyRates } = await import("./lib/exchange-rates/schedule");
    startDailyRates();
  }
}
