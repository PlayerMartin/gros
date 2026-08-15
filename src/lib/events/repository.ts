import { randomUUID } from "crypto";
import type { Database } from "bun:sqlite";
import { getDb } from "../db";
import { EventType, type Direction, type EventRow, type NewEvent } from "./types";

const COLS =
  "id, sequenceNumber, userId, eventType, accountId, amount, direction, tagId, date, transferToAccountId, note, originalEventId, payload, createdAt";

function toRow(r: any): EventRow {
  return {
    id: r.id,
    sequenceNumber: r.sequenceNumber,
    userId: r.userId,
    eventType: r.eventType as EventType,
    accountId: r.accountId,
    amount: r.amount,
    direction: r.direction as Direction | null,
    tagId: r.tagId,
    date: r.date,
    transferToAccountId: r.transferToAccountId,
    note: r.note,
    originalEventId: r.originalEventId,
    payload: r.payload,
    createdAt: r.createdAt,
  };
}

function nextSequence(db: Database): number {
  const row = db
    .prepare(
      "SELECT COALESCE(MAX(sequenceNumber), 0) AS max FROM events"
    )
    .get() as { max: number };
  return row.max + 1;
}

/**
 * Insert an event, assigning the next global sequence number.
 * A payload object is serialized to JSON.
 * Returns the full stored row.
 */
export function insertEvent(db: Database, e: NewEvent): EventRow {
  const id = e.id ?? randomUUID();
  const sequenceNumber = nextSequence(db);
  const createdAt = new Date().toISOString();
  db.prepare(
    `INSERT INTO events (${COLS}) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )`
  ).run(
    id,
    sequenceNumber,
    e.userId,
    e.eventType,
    e.accountId ?? null,
    e.amount ?? null,
    e.direction ?? null,
    e.tagId ?? null,
    e.date ?? null,
    e.transferToAccountId ?? null,
    e.note ?? null,
    e.originalEventId ?? null,
    e.payload ? JSON.stringify(e.payload) : null,
    createdAt,
  );
  return getEventById(db, id)!;
}

export function getEventById(db: Database, id: string): EventRow | null {
  const row = db.prepare(`SELECT ${COLS} FROM events WHERE id = ?`).get(id);
  return row ? toRow(row) : null;
}

/** All events for a user, ordered by sequence. */
export function listEventsByUser(db: Database, userId: string): EventRow[] {
  const rows = db
    .prepare(`SELECT ${COLS} FROM events WHERE userId = ? ORDER BY sequenceNumber ASC`)
    .all(userId);
  return rows.map(toRow);
}

/** Returns true if the given event id has been voided. */
export function isVoided(db: Database, eventId: string): boolean {
  const row = db
    .prepare(
      "SELECT 1 AS x FROM events WHERE originalEventId = ? AND eventType = ?"
    )
    .get(eventId, EventType.TransactionVoided);
  return !!row;
}

/**
 * Live (non-voided) transaction events for a user.
 * Excludes events that have a matching TRANSACTION_VOIDED row via
 * WHERE NOT EXISTS subquery.
 */
export function listLiveTransactions(
  db: Database,
  userId: string
): EventRow[] {
  const rows = db
    .prepare(
      `SELECT e.*
       FROM events e
       WHERE e.userId = ? AND e.eventType = ?
         AND NOT EXISTS (
           SELECT 1 FROM events v
           WHERE v.originalEventId = e.id AND v.eventType = ?
         )
       ORDER BY e.date DESC, e.sequenceNumber ASC`
    )
    .all(userId, EventType.TransactionCreated, EventType.TransactionVoided);
  return rows.map(toRow);
}

export { nextSequence };
