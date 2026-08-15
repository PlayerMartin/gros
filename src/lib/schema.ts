import type { Database } from "bun:sqlite";
import { getDb } from "./db";

/**
 * Table creation & migrations.
 *
 * Event sourcing with a wide typed events table (columns for all common
 * fields, nullable where not applicable) plus three supporting tables:
 * tags, exchange_rates, and settings.
 */
export function migrate(db: Database = getDb()): void {
  // First-run schema creation can race from several processes concurrently
  // (e.g. `next build` collects page data with worker processes). Run the DDL
  // inside one transaction so readers never observe a partial schema, and rely
  // on the connection's busy_timeout to serialize concurrent writers.
  db.exec("BEGIN");
  try {
    db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id                  TEXT PRIMARY KEY,
      sequenceNumber      INTEGER NOT NULL,
      userId              TEXT NOT NULL,
      eventType           TEXT NOT NULL,
      accountId           TEXT,
      amount              REAL,
      direction           TEXT,
      tagId               TEXT,
      date                TEXT,
      transferToAccountId TEXT,
      note                TEXT,
      originalEventId     TEXT,
      payload             TEXT,
      createdAt           TEXT NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_events_sequence ON events(sequenceNumber);
    CREATE INDEX IF NOT EXISTS idx_events_user_type ON events(userId, eventType);
    CREATE INDEX IF NOT EXISTS idx_events_user_account ON events(userId, accountId);
    CREATE INDEX IF NOT EXISTS idx_events_user_date ON events(userId, date);

    CREATE TABLE IF NOT EXISTS tags (
      id        TEXT PRIMARY KEY,
      userId    TEXT NOT NULL,
      name      TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      UNIQUE (userId, name)
    );

    CREATE TABLE IF NOT EXISTS exchange_rates (
      date         TEXT NOT NULL,
      fromCurrency TEXT NOT NULL,
      toCurrency   TEXT NOT NULL,
      rate         REAL NOT NULL,
      PRIMARY KEY (date, fromCurrency, toCurrency)
    );

    CREATE TABLE IF NOT EXISTS settings (
      userId          TEXT PRIMARY KEY,
      primaryCurrency TEXT NOT NULL DEFAULT 'EUR',
      updatedAt       TEXT NOT NULL
    );

    -- Better Auth tables (email/password provider).
    -- "user" and "session" are SQLite keywords, hence quoted.
    CREATE TABLE IF NOT EXISTS "user" (
      id            TEXT NOT NULL PRIMARY KEY,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE,
      emailVerified INTEGER NOT NULL,
      image         TEXT,
      createdAt     TIMESTAMP NOT NULL,
      updatedAt     TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS session (
      id          TEXT NOT NULL PRIMARY KEY,
      expiresAt   TIMESTAMP NOT NULL,
      token       TEXT NOT NULL UNIQUE,
      createdAt   TIMESTAMP NOT NULL,
      updatedAt   TIMESTAMP NOT NULL,
      ipAddress   TEXT,
      userAgent   TEXT,
      "userId"    TEXT NOT NULL REFERENCES "user"(id)
    );

    CREATE TABLE IF NOT EXISTS account (
      id                    TEXT NOT NULL PRIMARY KEY,
      accountId             TEXT NOT NULL,
      providerId            TEXT NOT NULL,
      "userId"              TEXT NOT NULL REFERENCES "user"(id),
      accessToken           TEXT,
      refreshToken          TEXT,
      idToken               TEXT,
      accessTokenExpiresAt  TIMESTAMP,
      refreshTokenExpiresAt TIMESTAMP,
      scope                 TEXT,
      password              TEXT,
      createdAt             TIMESTAMP NOT NULL,
      updatedAt             TIMESTAMP NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification (
      id         TEXT NOT NULL PRIMARY KEY,
      identifier TEXT NOT NULL,
      value      TEXT NOT NULL,
      expiresAt  TIMESTAMP NOT NULL,
      createdAt  TIMESTAMP,
      updatedAt  TIMESTAMP
    );
  `);
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}
