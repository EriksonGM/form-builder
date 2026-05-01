
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  const row = db.prepare('SELECT * FROM forms WHERE id = ?').get(id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Form not found' })
  return rowToForm(row)
})
