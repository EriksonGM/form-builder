export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.prepare('SELECT * FROM groups ORDER BY name ASC').all() as any[]
  return rows.map(r => rowToGroup(r, getGroupMemberIds(r.id)))
})
