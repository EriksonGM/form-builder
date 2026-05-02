import type { FormStep, ProcessApproval } from '~/types'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ userId: number }>(event)
  if (!body?.userId) {
    throw createError({ statusCode: 400, statusMessage: 'userId is required' })
  }
  const db = useDb()
  const row = db.prepare('SELECT * FROM processes WHERE id = ?').get(id) as any
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Process not found' })

  const proc = rowToProcess(row)
  if (proc.status !== 'in_progress') {
    throw createError({ statusCode: 409, statusMessage: 'Process is not in progress' })
  }

  const steps = proc.steps as FormStep[]
  const idx = steps.findIndex(s => s.id === proc.currentStepId)
  if (idx < 0) throw createError({ statusCode: 409, statusMessage: 'Current step not found' })
  const step = steps[idx]!

  if (!step.userIds.includes(body.userId)) {
    throw createError({ statusCode: 403, statusMessage: 'User is not assigned to current step' })
  }

  const approvals = proc.approvals as ProcessApproval[]
  const already = approvals.find(a => a.stepId === step.id && a.userId === body.userId)
  if (already) {
    throw createError({ statusCode: 409, statusMessage: 'User has already approved this step' })
  }

  approvals.push({ stepId: step.id, userId: body.userId, at: new Date().toISOString() })

  const stepApprovers = approvals.filter(a => a.stepId === step.id).map(a => a.userId)
  const advance = step.mode === 'any'
    ? true
    : step.userIds.every(uid => stepApprovers.includes(uid))

  let nextStepId = proc.currentStepId
  let nextStatus = proc.status as string
  if (advance) {
    const next = steps[idx + 1]
    if (next) {
      nextStepId = next.id
    } else {
      nextStepId = null
      nextStatus = 'finalized'
    }
  }

  db.prepare(`
    UPDATE processes SET approvals = ?, current_step_id = ?, status = ? WHERE id = ?
  `).run(JSON.stringify(approvals), nextStepId, nextStatus, id)

  const updated = db.prepare('SELECT * FROM processes WHERE id = ?').get(id)
  return rowToProcess(updated)
})
