import type Database from "better-sqlite3";
import { randomUUID } from "crypto";
import { getDb } from "../db";
import { insertEvent } from "../events/repository";
import { EventType, type AccountPayload, type EventRow } from "../events/types";
import { listEventsForReplay } from "../events/service";
import {
  getAccountCreatedEvents,
  getAccountClosedEvents,
} from "./repository";

export interface Account {
  id: string;
  name: string;
  currency: string;
  userId: string;
  initialBalance: number;
  createdAt: string;
  closed: boolean;
  closedAt: string | null;
}

export interface NewAccountInput {
  userId: string;
  name: string;
  currency: string;
  initialBalance?: number;
  date?: string; // ISO date of creation, defaults to today
}

const today = () => new Date().toISOString().slice(0, 10);

/** Create a bank account via an account_created event. */
export function createAccount(
  db: Database.Database,
  input: NewAccountInput
): Account {
  const payload: AccountPayload = {
    name: input.name,
    currency: input.currency,
  };
  // The account id equals its account_created event id.
  const accountId = randomUUID();
  const event = insertEvent(db, {
    id: accountId,
    accountId,
    eventType: EventType.AccountCreated,
    userId: input.userId,
    date: input.date ?? today(),
    amount: input.initialBalance ?? 0,
    note: null,
    payload,
  });
  return resolveAccount(event, false);
}

/** Close an account via an account_closed event. */
export function closeAccount(
  db: Database.Database,
  userId: string,
  accountId: string
): void {
  insertEvent(db, {
    eventType: EventType.AccountClosed,
    userId,
    accountId,
    date: today(),
  });
}

/** Derive the full account list for a user from account lifecycle events. */
export function listAccounts(db: Database.Database, userId: string): Account[] {
  const created = getAccountCreatedEvents(db, userId);
  const closed = getAccountClosedEvents(db, userId);
  const closedById = new Map(closed.map((c) => [c.accountId, c]));

  return created
    .filter((e) => e.accountId !== null)
    .map((e) => resolveAccount(e, closedById.has(e.accountId!)));
}

function resolveAccount(createdEvent: EventRow, closed: boolean): Account {
  const payload = (createdEvent.payload
    ? JSON.parse(createdEvent.payload)
    : {}) as Partial<AccountPayload>;
  return {
    id: createdEvent.accountId!,
    name: payload.name ?? "Unnamed account",
    currency: payload.currency ?? "EUR",
    userId: createdEvent.userId,
    initialBalance: createdEvent.amount ?? 0,
    createdAt: createdEvent.date ?? createdEvent.createdAt,
    closed,
    closedAt: createdEvent.date ?? null,
  };
}

/**
 * Replay events to compute balances.
 *
 * - accountId given: balance of a single account.
 * - accountId null: total across every account the user has (net worth).
 * - date given: historical balance, considering only events on/before that date.
 */
export function computeBalance(
  db: Database.Database,
  userId: string,
  accountId: string | null = null,
  date: string | null = null
): { perAccount: Record<string, number>; total: number } {
  const events = listEventsForReplay(db, userId);
  const balances: Record<string, number> = {};

  for (const e of events) {
    if (date && e.date && e.date > date) continue;
    if (accountId && e.accountId !== accountId) continue;
    if (!e.accountId) continue;

    switch (e.eventType) {
      case EventType.AccountCreated:
        balances[e.accountId] = (balances[e.accountId] ?? 0) + (e.amount ?? 0);
        break;
      case EventType.TransactionCreated: {
        // skip voided transactions
        const voided = events.some(
          (v) =>
            v.eventType === EventType.TransactionVoided &&
            v.originalEventId === e.id
        );
        if (voided) break;
        const delta = e.direction === "in" ? e.amount ?? 0 : -(e.amount ?? 0);
        balances[e.accountId] = (balances[e.accountId] ?? 0) + delta;
        break;
      }
      case EventType.TransferCreated:
        // amount is already signed (+credit / -debit)
        balances[e.accountId] =
          (balances[e.accountId] ?? 0) + (e.amount ?? 0);
        break;
      default:
        break;
    }
  }

  const total = Object.values(balances).reduce((s, v) => s + v, 0);
  return { perAccount: balances, total };
}
