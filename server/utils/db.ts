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
    CREATE TABLE IF NOT EXISTS processes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      form_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      documents TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'in_progress',
      current_step_id TEXT,
      steps TEXT NOT NULL DEFAULT '[]',
      approvals TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      photo TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS group_members (
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      PRIMARY KEY (group_id, user_id),
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)
  // Migration: ensure new columns exist on legacy `processes` rows
  const cols = (_db.prepare('PRAGMA table_info(processes)').all() as any[]).map(c => c.name)
  const ensure = (name: string, ddl: string) => {
    if (!cols.includes(name)) _db!.exec(`ALTER TABLE processes ADD COLUMN ${ddl}`)
  }
  ensure('status', "status TEXT NOT NULL DEFAULT 'in_progress'")
  ensure('current_step_id', 'current_step_id TEXT')
  ensure('steps', "steps TEXT NOT NULL DEFAULT '[]'")
  ensure('approvals', "approvals TEXT NOT NULL DEFAULT '[]'")
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

export function rowToProcess(r: any) {
  return {
    id: r.id,
    code: r.code,
    formId: r.form_id,
    data: JSON.parse(r.data),
    documents: JSON.parse(r.documents ?? '[]'),
    status: r.status ?? 'in_progress',
    currentStepId: r.current_step_id ?? null,
    steps: JSON.parse(r.steps ?? '[]'),
    approvals: JSON.parse(r.approvals ?? '[]'),
    createdAt: r.created_at
  }
}

export function generateProcessCode() {
  const d = new Date()
  const ymd = `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`
  const rand = Math.random().toString(16).slice(2, 8).toUpperCase()
  return `PROC-${ymd}-${rand}`
}

export function rowToGroup(r: any, userIds: number[] = []) {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    userIds,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }
}

export function getGroupMemberIds(groupId: number): number[] {
  const db = useDb()
  return (db.prepare('SELECT user_id FROM group_members WHERE group_id = ?').all(groupId) as any[])
    .map(r => r.user_id)
}

export function expandGroupsToUserIds(groupIds: number[]): number[] {
  if (!groupIds.length) return []
  const db = useDb()
  const placeholders = groupIds.map(() => '?').join(',')
  const rows = db.prepare(
    `SELECT DISTINCT user_id FROM group_members WHERE group_id IN (${placeholders})`
  ).all(...groupIds) as any[]
  return rows.map(r => r.user_id)
}

export function rowToUser(r: any) {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    photo: r.photo ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }
}
