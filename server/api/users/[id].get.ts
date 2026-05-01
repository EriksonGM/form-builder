export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  return rowToUser(row)
})
