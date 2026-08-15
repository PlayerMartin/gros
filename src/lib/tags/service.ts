import { randomUUID } from "crypto";
import type { Database } from "bun:sqlite";
import { getDb } from "../db";
import { insertEvent } from "../events/repository";
import { EventType } from "../events/types";
import {
  listTags,
  getTag,
  getTagByName,
  insertTag,
  renameTag as renameRow,
  deleteTagRow,
  countTransactionsForTag,
  type TagRow,
} from "./repository";

export const DEFAULT_TAG = "Uncategorized";

/** Seed the default "Uncategorized" tag on registration (idempotent). */
export function seedDefaultTag(
  db: Database,
  userId: string
): TagRow {
  const existing = getTagByName(db, userId, DEFAULT_TAG);
  if (existing) return existing;
  return createTag(db, userId, DEFAULT_TAG);
}

/** Create a tag (validates name + uniqueness), appending a tag_created event. */
export function createTag(
  db: Database,
  userId: string,
  name: string
): TagRow {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name is required");
  if (getTagByName(db, userId, trimmed)) {
    throw new Error("A tag with this name already exists");
  }
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  insertEvent(db, {
    eventType: EventType.TagCreated,
    userId,
    tagId: id,
    payload: { name: trimmed },
  });
  insertTag(db, { id, userId, name: trimmed, createdAt });
  return getTag(db, id)!;
}

export function listTagsForUser(
  db: Database,
  userId: string
): TagRow[] {
  return listTags(db, userId);
}

export function renameTag(
  db: Database,
  userId: string,
  tagId: string,
  newName: string
): TagRow {
  const tag = getTag(db, tagId);
  if (!tag || tag.userId !== userId) throw new Error("Tag not found");
  const trimmed = newName.trim();
  if (!trimmed) throw new Error("Tag name is required");
  const clash = getTagByName(db, userId, trimmed);
  if (clash && clash.id !== tagId) {
    throw new Error("A tag with this name already exists");
  }
  renameRow(db, tagId, trimmed);
  return getTag(db, tagId)!;
}

/**
 * Delete a tag. Blocked if it is the default tag or referenced by any live
 * transaction.
 */
export function deleteTag(
  db: Database,
  userId: string,
  tagId: string
): void {
  const tag = getTag(db, tagId);
  if (!tag || tag.userId !== userId) throw new Error("Tag not found");
  if (tag.name === DEFAULT_TAG) {
    throw new Error("The default tag cannot be deleted");
  }
  const referenced = countTransactionsForTag(db, userId, tagId);
  if (referenced > 0) {
    throw new Error("Tag is in use by transactions and cannot be deleted");
  }
  deleteTagRow(db, tagId);
}
