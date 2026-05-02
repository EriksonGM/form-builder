export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = useDb()
  db.prepare('DELETE FROM groups WHERE id = ?').run(id)
  return { ok: true }
})
