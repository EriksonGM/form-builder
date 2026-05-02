export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string, description?: string, userIds?: number[] }>(event)
  if (!body?.name) {
    throw createError({ statusCode: 400, statusMessage: 'name is required' })
  }
  const db = useDb()
  const userIds = Array.from(new Set(body.userIds ?? []))
  try {
    const info = db.transaction(() => {
      const result = db.prepare(
        'INSERT INTO groups (name, description) VALUES (?, ?)'
      ).run(body.name, body.description ?? null)
      const groupId = Number(result.lastInsertRowid)
      const ins = db.prepare('INSERT INTO group_members (group_id, user_id) VALUES (?, ?)')
      for (const uid of userIds) ins.run(groupId, uid)
      return result
    })()
    const id = Number(info.lastInsertRowid)
    const row = db.prepare('SELECT * FROM groups WHERE id = ?').get(id)
    return rowToGroup(row, getGroupMemberIds(id))
  } catch (e: any) {
    if (String(e?.message ?? '').includes('UNIQUE')) {
      throw createError({ statusCode: 409, statusMessage: 'group name already in use' })
    }
    throw e
  }
})
