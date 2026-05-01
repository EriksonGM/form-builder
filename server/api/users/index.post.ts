export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string, email: string, photo?: string | null }>(event)
  if (!body?.name || !body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'name and email are required' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid email' })
  }
  const db = useDb()
  try {
    const info = db.prepare(
      'INSERT INTO users (name, email, photo) VALUES (?, ?, ?)'
    ).run(body.name, body.email, body.photo ?? null)
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid)
    return rowToUser(row)
  } catch (e: any) {
    if (String(e?.message ?? '').includes('UNIQUE')) {
      throw createError({ statusCode: 409, statusMessage: 'email already in use' })
    }
    throw e
  }
})
