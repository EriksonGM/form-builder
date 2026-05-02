export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  const row = db.prepare(`
    SELECT p.*, f.title AS form_title, f.schema AS form_schema
    FROM processes p
    LEFT JOIN forms f ON f.id = p.form_id
    WHERE p.id = ?
  `).get(id) as any
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Process not found' })
  return {
    ...rowToProcess(row),
    formTitle: row.form_title,
    formSchema: row.form_schema ? JSON.parse(row.form_schema) : null
  }
})
