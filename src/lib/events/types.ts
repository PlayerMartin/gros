/**
 * Event type constants and TypeScript types.
 * Global immutable timeline of all domain events.
 */

export const EventType = {
  TransactionCreated: "transaction_created",
  TransactionVoided: "transaction_voided",
  TransferCreated: "transfer_created",
  AccountCreated: "account_created",
  AccountClosed: "account_closed",
  TagCreated: "tag_created",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export type Direction = "in" | "out";

/** A single stored row in the events table. */
export interface EventRow {
  id: string;
  sequenceNumber: number;
  userId: string;
  eventType: EventType;
  accountId: string | null;
  amount: number | null;
  direction: Direction | null;
  tagId: string | null;
  date: string | null;
  transferToAccountId: string | null;
  note: string | null;
  originalEventId: string | null;
  payload: string | null;
  createdAt: string;
}

/** Fields accepted when creating events — all optional except the base ones. */
export interface NewEvent {
  id?: string; // defaults to a generated UUID
  eventType: EventType;
  userId: string;
  accountId?: string | null;
  amount?: number | null;
  direction?: Direction | null;
  tagId?: string | null;
  date?: string | null;
  transferToAccountId?: string | null;
  note?: string | null;
  originalEventId?: string | null;
  payload?: object | null;
}

/** Account state carried in an account_created event payload. */
export interface AccountPayload {
  name: string;
  currency: string; // ISO code, e.g. "EUR" | "CZK"
}
