import type { FormSchema } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ title: string, description?: string, schema: FormSchema }>(event)
  if (!body?.title || !body?.schema) {
    throw createError({ statusCode: 400, statusMessage: 'title and schema are required' })
  }
  const db = useDb()
  const stmt = db.prepare(
    'INSERT INTO forms (title, description, schema) VALUES (?, ?, ?)'
  )
  const info = stmt.run(body.title, body.description ?? null, JSON.stringify(body.schema))
  const row = db.prepare('SELECT * FROM forms WHERE id = ?').get(info.lastInsertRowid)
  return rowToForm(row)
})
