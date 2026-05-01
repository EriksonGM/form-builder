
export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.prepare('SELECT * FROM forms ORDER BY updated_at DESC').all()
  return rows.map(rowToForm)
})
