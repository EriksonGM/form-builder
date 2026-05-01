export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.prepare('SELECT * FROM users ORDER BY name ASC').all()
  return rows.map(rowToUser)
})
