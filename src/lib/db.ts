import { Database } from "bun:sqlite";
import fs from "fs";
import path from "path";

let db: Database | null = null;

/**
 * Switch a connection to WAL mode.
 *
 * SQLite does NOT honor the busy handler (busy_timeout) for the
 * `journal_mode = WAL` transition — if another connection currently holds the
 * old journal lock on a fresh file, it fails with SQLITE_BUSY immediately.
 * `next build` first-touches the database from 11 parallel worker processes,
 * so retry the transition briefly instead of relying on timing luck.
 */
function enableWAL(db: Database): void {
  for (let attempt = 0; ; attempt++) {
    try {
      db.exec("PRAGMA journal_mode = WAL");
      return;
    } catch (err) {
      const busy = (err as { code?: string })?.code === "SQLITE_BUSY";
      if (!busy || attempt >= 40) throw err; // ~2 s window
      Bun.sleepSync(50);
    }
  }
}

/**
 * SQLite connection with WAL mode, singleton pattern.
 *
 * The database file lives in `<project>/data/finance.db`. WAL mode gives us
 * concurrent-read safety while a single write transaction runs, which suits
 * the event-sourcing write pattern.
 */
export function getDb(): Database {
  if (!db) {
    const dir = path.join(process.cwd(), "data");
    fs.mkdirSync(dir, { recursive: true });
    db = new Database(path.join(dir, "finance.db"));
    // bun:sqlite has no default busy timeout (better-sqlite3 had 5s). Without it,
    // concurrent writers fail immediately with SQLITE_BUSY "database is locked".
    db.exec("PRAGMA busy_timeout = 5000");
    enableWAL(db);
    db.exec("PRAGMA foreign_keys = ON");
  }
  return db;
}

/** Fresh in-memory database for tests. Returns a throwaway connection. */
export function createMemoryDb(): Database {
  const memory = new Database(":memory:");
  memory.exec("PRAGMA busy_timeout = 5000");
  memory.exec("PRAGMA journal_mode = MEMORY");
  memory.exec("PRAGMA foreign_keys = ON");
  return memory;
}
