# Exchange rates

Daily ECB (European Central Bank) XML feed for EUR/CZK rates. Free, no API
key required.

## Fetch strategy

- **On server start:** `src/instrumentation.ts` `register()` fires once (Node runtime),
  calling `startDailyRates()` in `lib/exchange-rates/schedule.ts`. It fetches the ECB daily
  XML immediately (skipped if today's rate is already stored) and stores the EUR/CZK rate.
- **Re-fetch:** every 24h at **03:00** local time via a recurring timer in the same module.
- **Manual:** `POST /api/exchange-rates/refresh` forces a fetch on demand.
- **Non-fatal:** a failed fetch just logs; conversion gracefully falls back to
  same-currency displays rather than crashing.
- **Storage:** `exchange_rates` table — `date, fromCurrency, toCurrency, rate`.
  PRIMARY KEY on `(date, fromCurrency, toCurrency)`.

## Conversion queries

- **Display conversion:** lookup today's rate from `exchange_rates`.
- **Historical conversion:** lookup the closest rate on or before the target
  date.

## Implementation

Service layer at `lib/exchange-rates/service.ts`:
- `fetchDailyRates()` — fetch and parse ECB XML, store in DB.
- `convertCurrency(amount, from, to, date?)` — lookup rate and convert.

Repository at `lib/exchange-rates/repository.ts`:
- Rate storage and retrieval helpers.

→ [Architecture](architecture.md)
→ [Data model](../product/data-model.md)