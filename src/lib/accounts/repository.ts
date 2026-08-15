import type Database from "better-sqlite3";
import { EventType, type EventRow } from "../events/types";

/** Raw account_created events for a user, in creation order. */
export function getAccountCreatedEvents(
  db: Database.Database,
  userId: string
): EventRow[] {
  const rows = db
    .prepare(
      "SELECT * FROM events WHERE userId = ? AND eventType = ? ORDER BY sequenceNumber ASC"
    )
    .all(userId, EventType.AccountCreated);
  return rows as EventRow[];
}

/** Raw account_closed events for a user, in creation order. */
export function getAccountClosedEvents(
  db: Database.Database,
  userId: string
): EventRow[] {
  const rows = db
    .prepare(
      "SELECT * FROM events WHERE userId = ? AND eventType = ? ORDER BY sequenceNumber ASC"
    )
    .all(userId, EventType.AccountClosed);
  return rows as EventRow[];
}

/** Transfer events affecting a given account. */
export function getTransfersForAccount(
  db: Database.Database,
  userId: string,
  accountId: string
): EventRow[] {
  const rows = db
    .prepare(
      "SELECT * FROM events WHERE userId = ? AND eventType = ? AND accountId = ? ORDER BY sequenceNumber ASC"
    )
    .all(userId, EventType.TransferCreated, accountId);
  return rows as EventRow[];
}
