export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ name: string, email: string, photo?: string | null }>(event)
  if (!body?.name || !body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'name and email are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid email' })
  }
  const db = useDb()
  const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(id)
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'User not found' })
  try {
    db.prepare(
      "UPDATE users SET name = ?, email = ?, photo = ?, updated_at = datetime('now') WHERE id = ?"
    ).run(body.name, body.email, body.photo ?? null, id)
  } catch (e: any) {
    if (String(e?.message ?? '').includes('UNIQUE')) {
      throw createError({ statusCode: 409, statusMessage: 'email already in use' })
    }
    throw e
  }
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  return rowToUser(row)
})
