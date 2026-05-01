
export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  db.prepare('DELETE FROM submissions WHERE form_id = ?').run(id)
  db.prepare('DELETE FROM forms WHERE id = ?').run(id)
  return { ok: true }
})
