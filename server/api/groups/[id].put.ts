export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ name: string, description?: string, userIds?: number[] }>(event)
  if (!body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }
  const db = useDb()
  const exists = db.prepare('SELECT id FROM groups WHERE id = ?').get(id)
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Group not found' })
  const userIds = Array.from(new Set(body.userIds ?? []))
  try {
    db.transaction(() => {
      db.prepare(
        "UPDATE groups SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?"
      ).run(body.name, body.description ?? null, id)
      db.prepare('DELETE FROM group_members WHERE group_id = ?').run(id)
      const ins = db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)')
      for (const uid of userIds) ins.run(id, uid)
    })()
  } catch (e: any) {
    if (String(e?.message ?? '').includes('UNIQUE')) {
      throw createError({ statusCode: 409, statusMessage: 'group name already in use' })
    }
    throw e
  }
  const row = db.prepare('SELECT * FROM groups WHERE id = ?').get(id)
  return rowToGroup(row, getGroupMemberIds(id))
})
