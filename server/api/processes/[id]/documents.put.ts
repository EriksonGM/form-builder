import type { StoredFile } from '~/types'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ documents: StoredFile[] }>(event)
  if (!Array.isArray(body?.documents)) {
    throw createError({ statusCode: 400, statusMessage: 'documents array is required' })
  }
  const db = useDb()
  const exists = db.prepare('SELECT id FROM processes WHERE id = ?').get(id)
  if (!exists) throw createError({ statusCode: 404, statusMessage: 'Process not found' })
  db.prepare('UPDATE processes SET documents = ? WHERE id = ?')
    .run(JSON.stringify(body.documents), id)
  const row = db.prepare('SELECT * FROM processes WHERE id = ?').get(id)
  return rowToProcess(row)
})
