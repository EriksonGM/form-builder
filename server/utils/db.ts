import Database from 'better-sqlite3'
import { mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

let _db: Database.Database | null = null

export function useDb() {
  if (_db) return _db
  const file = resolve(process.cwd(), 'data', 'kayla-flow.sqlite')
  if (!existsSync(dirname(file))) mkdirSync(dirname(file), { recursive: true })
  _db = new Database(file)
  _db.pragma('journal_mode = WAL')
  _db.exec(`
    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      schema TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    );
  `)
  return _db
}

export function rowToForm(r: any) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    schema: JSON.parse(r.schema),
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }
}

export function rowToSubmission(r: any) {
  return {
    id: r.id,
    formId: r.form_id,
    data: JSON.parse(r.data),
    createdAt: r.created_at
  }
}
