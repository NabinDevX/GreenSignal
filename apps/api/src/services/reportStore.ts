import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { SavedReport, SavedReportSchema } from '@groundsignal/shared';
import { config } from '../config';

let database: Database | undefined;

function getDatabase(): Database {
  if (!database) {
    mkdirSync(path.dirname(config.databasePath), { recursive: true });
    database = new Database(config.databasePath);
    database.run(`
      CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
  }
  return database;
}

export function listReports(): SavedReport[] {
  const rows = getDatabase()
    .query('SELECT payload FROM reports ORDER BY created_at DESC')
    .all() as Array<{ payload: string }>;

  return rows.flatMap((row) => {
    const result = SavedReportSchema.safeParse(JSON.parse(row.payload));
    return result.success ? [result.data] : [];
  });
}

export function upsertReport(report: SavedReport): SavedReport {
  const validated = SavedReportSchema.parse(report);
  getDatabase()
    .query(`
      INSERT INTO reports (id, payload, created_at, updated_at)
      VALUES ($id, $payload, $createdAt, $updatedAt)
      ON CONFLICT(id) DO UPDATE SET
        payload = excluded.payload,
        updated_at = excluded.updated_at
    `)
    .run({
      $id: validated.id,
      $payload: JSON.stringify(validated),
      $createdAt: validated.createdAt,
      $updatedAt: validated.updatedAt,
    });
  return validated;
}

export function removeReport(id: string): boolean {
  const result = getDatabase().query('DELETE FROM reports WHERE id = $id').run({ $id: id });
  return result.changes > 0;
}
