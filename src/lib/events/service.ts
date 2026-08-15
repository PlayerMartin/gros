import type Database from "better-sqlite3";
import { getDb } from "../db";
import { insertEvent, listEventsByUser, getEventById, isVoided } from "./repository";
import { EventType, type EventRow, type NewEvent } from "./types";

export { listLiveTransactions } from "./repository";

export interface NewTransactionInput {
  userId: string;
  accountId: string;
  amount: number;
  direction: "in" | "out";
  tagId?: string | null;
  date: string; // ISO date (YYYY-MM-DD)
  note?: string | null;
}

/** Create a single manual transaction. */
export function createTransaction(
  db: Database.Database,
  input: NewTransactionInput
): EventRow {
  return insertEvent(db, {
    eventType: EventType.TransactionCreated,
    userId: input.userId,
    accountId: input.accountId,
    amount: Math.abs(input.amount),
    direction: input.direction,
    tagId: input.tagId ?? null,
    date: input.date,
    note: input.note ?? null,
  });
}

/**
 * Void an existing transaction. Enforces ownership and that the target is a
 * transaction event which has not already been voided.
 */
export function voidTransaction(
  db: Database.Database,
  userId: string,
  originalEventId: string
): EventRow {
  const original = getEventById(db, originalEventId);
  if (!original || original.userId !== userId) {
    throw new Error("Transaction not found");
  }
  if (original.eventType !== EventType.TransactionCreated) {
    throw new Error("Event is not a transaction");
  }
  if (isVoided(db, originalEventId)) {
    throw new Error("Transaction already voided");
  }
  return insertEvent(db, {
    eventType: EventType.TransactionVoided,
    userId,
    accountId: original.accountId,
    date: original.date,
    originalEventId,
  });
}

/**
 * Edit strategy: atomic void + create inside a single DB transaction.
 * The user sees a simple edit; the audit trail records both events.
 */
export function editTransaction(
  db: Database.Database,
  userId: string,
  originalEventId: string,
  input: NewTransactionInput
): EventRow {
  const run = db.transaction(() => {
    voidTransaction(db, userId, originalEventId);
    return createTransaction(db, input);
  });
  return run();
}

export interface NewTransferInput {
  userId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  note?: string | null;
}

/**
 * Transfer between accounts, captured as two atomic events (debit + credit).
 * The debit event stores a negative signed amount; the credit event positive.
 */
export function createTransfer(
  db: Database.Database,
  input: NewTransferInput
): EventRow {
  const abs = Math.abs(input.amount);
  const run = db.transaction(() => {
    insertEvent(db, {
      eventType: EventType.TransferCreated,
      userId: input.userId,
      accountId: input.fromAccountId,
      amount: -abs,
      transferToAccountId: input.toAccountId,
      date: input.date,
      note: input.note ?? null,
    });
    return insertEvent(db, {
      eventType: EventType.TransferCreated,
      userId: input.userId,
      accountId: input.toAccountId,
      amount: abs,
      transferToAccountId: input.fromAccountId,
      date: input.date,
      note: input.note ?? null,
    });
  });
  return run();
}

/** All events for a user in sequence order (used for replay). */
export function listEventsForReplay(db: Database.Database, userId: string): EventRow[] {
  return listEventsByUser(db, userId);
}
