import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

let db: Database.Database | null = null;

/**
 * SQLite connection with WAL mode, singleton pattern.
 *
 * The database file lives in `<project>/data/finance.db`. WAL mode gives us
 * concurrent-read safety while a single write transaction runs, which suits
 * the event-sourcing write pattern.
 */
export function getDb(): Database.Database {
  if (!db) {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    db = new Database(path.join(dir, "finance.db"));
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
  }
  return db;
}

/** Fresh in-memory database for tests. Returns a throwaway connection. */
export function createMemoryDb(): Database.Database {
  const memory = new Database(":memory:");
  memory.pragma("journal_mode = MEMORY");
  memory.pragma("foreign_keys = ON");
  return memory;
}
