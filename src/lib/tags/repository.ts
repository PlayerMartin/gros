import type { Database } from "bun:sqlite";
import { EventType } from "../events/types";

export interface TagRow {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}

export function listTags(db: Database, userId: string): TagRow[] {
  const rows = db
    .prepare("SELECT * FROM tags WHERE userId = ? ORDER BY name ASC")
    .all(userId);
  return rows as TagRow[];
}

export function getTag(db: Database, id: string): TagRow | null {
  return (db.prepare("SELECT * FROM tags WHERE id = ?").get(id) as TagRow) ?? null;
}

export function getTagByName(
  db: Database,
  userId: string,
  name: string
): TagRow | null {
  return (
    (db.prepare("SELECT * FROM tags WHERE userId = ? AND name = ?").get(userId, name) as TagRow) ??
    null
  );
}

export function insertTag(db: Database, tag: TagRow): void {
  db.prepare("INSERT INTO tags (id, userId, name, createdAt) VALUES (?, ?, ?, ?)").run(
    tag.id,
    tag.userId,
    tag.name,
    tag.createdAt
  );
}

export function renameTag(
  db: Database,
  id: string,
  name: string
): void {
  db.prepare("UPDATE tags SET name = ? WHERE id = ?").run(name, id);
}

export function deleteTagRow(db: Database, id: string): void {
  db.prepare("DELETE FROM tags WHERE id = ?").run(id);
}

/** Number of live transactions referencing a tag (voided ones excluded). */
export function countTransactionsForTag(
  db: Database,
  userId: string,
  tagId: string
): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM events e
       WHERE e.userId = ? AND e.eventType = ? AND e.tagId = ?
         AND NOT EXISTS (
           SELECT 1 FROM events v
           WHERE v.originalEventId = e.id AND v.eventType = ?
         )`
    )
    .get(userId, EventType.TransactionCreated, tagId, EventType.TransactionVoided) as {
    n: number;
  };
  return row.n;
}
