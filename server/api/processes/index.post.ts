import type { FormSchema, FormStep } from '~/types'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ formId: number, data: Record<string, any> }>(event)
  if (!body?.formId || !body?.data) {
    throw createError({ statusCode: 400, statusMessage: 'formId and data are required' })
  }
  const db = useDb()
  const formRow = db.prepare('SELECT * FROM forms WHERE id = ?').get(body.formId) as any
  if (!formRow) throw createError({ statusCode: 404, statusMessage: 'Process type not found' })

  const schema = JSON.parse(formRow.schema) as FormSchema
  const steps: FormStep[] = (schema.steps ?? []).map(s => {
    const fromGroups = expandGroupsToUserIds(s.groupIds ?? [])
    const userIds = Array.from(new Set([...(s.userIds ?? []), ...fromGroups]))
    return { id: s.id, name: s.name, mode: s.mode, userIds }
  })
  const status = steps.length ? 'in_progress' : 'finalized'
  const currentStepId = steps[0]?.id ?? null

  const code = generateProcessCode()
  const info = db.prepare(`
    INSERT INTO processes (code, form_id, data, documents, status, current_step_id, steps, approvals)
    VALUES (?, ?, ?, '[]', ?, ?, ?, '[]')
  `).run(code, body.formId, JSON.stringify(body.data), status, currentStepId, JSON.stringify(steps))
  const row = db.prepare('SELECT * FROM processes WHERE id = ?').get(info.lastInsertRowid)
  return rowToProcess(row)
})
