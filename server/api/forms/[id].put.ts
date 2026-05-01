import type { FormSchema } from '~/types'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ title: string, description?: string, schema: FormSchema }>(event)
  const db = useDb()
  const exists = db.prepare('SELECT id FROM forms WHERE id = ?').get(id)
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  db.prepare(
    "UPDATE forms SET title = ?, description = ?, schema = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(body.title, body.description ?? null, JSON.stringify(body.schema), id)
  const row = db.prepare('SELECT * FROM forms WHERE id = ?').get(id)
  return rowToForm(row)
})
