export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  const row = db.prepare('SELECT * FROM processes WHERE id = ?').get(id) as any
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Process not found' })
  if (row.status !== 'in_progress') {
    throw createError({ statusCode: 409, statusMessage: 'Process is not in progress' })
  }
  db.prepare("UPDATE processes SET status = 'cancelled', current_step_id = NULL WHERE id = ?").run(id)
  const updated = db.prepare('SELECT * FROM processes WHERE id = ?').get(id)
  return rowToProcess(updated)
})
