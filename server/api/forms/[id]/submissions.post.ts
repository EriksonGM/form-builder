
export default defineEventHandler(async (event) => {
  const formId = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ data: Record<string, any> }>(event)
  const db = useDb()
  const exists = db.prepare('SELECT id FROM forms WHERE id = ?').get(formId)
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  const info = db.prepare(
    'INSERT INTO submissions (form_id, data) VALUES (?, ?)'
  ).run(formId, JSON.stringify(body?.data ?? {}))
  const row = db.prepare('SELECT * FROM submissions WHERE id = ?').get(info.lastInsertRowid)
  return rowToSubmission(row)
})
