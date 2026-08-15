import { getDb } from "../src/lib/db";
import { migrate } from "../src/lib/schema";

/**
 * Create the SQLite database + schema in a single process.
 *
 * Runs automatically before `build` (via the `prebuild` script). `next build`
 * then opens the database from 11 parallel worker processes; with the WAL
 * journal and all tables already established, those first-touches are
 * lock-free reads instead of a concurrent first-migration race.
 *
 * Safe to run repeatedly (all DDL is `IF NOT EXISTS`).
 */
migrate(getDb());
console.log("[init-db] schema ready");