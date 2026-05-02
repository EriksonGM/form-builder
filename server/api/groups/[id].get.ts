export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  const row = db.prepare('SELECT * FROM groups WHERE id = ?').get(id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Group not found' })
  return rowToGroup(row, getGroupMemberIds(id))
})
