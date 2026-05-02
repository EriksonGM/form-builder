import type { FormSchema } from '~/types'

export function validateSteps(schema: FormSchema | undefined | null) {
  const steps = schema?.steps ?? []
  for (const s of steps) {
    if (!s.name?.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'each step must have a name' })
    }
    if (s.mode !== 'all' && s.mode !== 'any') {
      throw createError({ statusCode: 400, statusMessage: 'invalid step mode' })
    }
    const userCount = Array.isArray(s.userIds) ? s.userIds.length : 0
    const groupCount = Array.isArray(s.groupIds) ? s.groupIds.length : 0
    if (userCount + groupCount === 0) {
      throw createError({ statusCode: 400, statusMessage: `step "${s.name}" must have at least one user or group` })
    }
  }
}
