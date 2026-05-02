export default defineEventHandler(() => {
  const db = useDb()
  const rows = db.prepare(`
    SELECT p.*, f.title AS form_title
    FROM processes p
    LEFT JOIN forms f ON f.id = p.form_id
    ORDER BY p.created_at DESC
  `).all() as any[]
  return rows.map(r => ({ ...rowToProcess(r), formTitle: r.form_title }))
})
