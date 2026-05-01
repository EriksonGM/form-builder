import type { FormField, FormSchema } from '~/types'

export function validateField(field: FormField, value: any): string | null {
  const isEmpty = value === undefined || value === null || value === ''
    || (Array.isArray(value) && value.length === 0)

  if (field.required && isEmpty) return 'required'

  if (isEmpty) return null

  if (field.type === 'text' || field.type === 'textarea') {
    const s = String(value)
    if (field.min != null && s.length < field.min) return `min:${field.min}`
    if (field.max != null && s.length > field.max) return `max:${field.max}`
    if (field.pattern) {
      try {
        const re = new RegExp(field.pattern)
        if (!re.test(s)) return 'pattern'
      } catch {}
    }
  }
  if (field.type === 'number') {
    const n = Number(value)
    if (Number.isNaN(n)) return 'invalid'
    if (field.min != null && n < field.min) return `min:${field.min}`
    if (field.max != null && n > field.max) return `max:${field.max}`
  }
  if (field.type === 'array') {
    const arr = Array.isArray(value) ? value : []
    if (field.min != null && arr.length < field.min) return `min:${field.min}`
    if (field.max != null && arr.length > field.max) return `max:${field.max}`
    for (const item of arr) {
      for (const child of field.fields ?? []) {
        const e = validateField(child, item?.[child.name])
        if (e) return `child:${child.name}:${e}`
      }
    }
  }
  if (field.type === 'object') {
    const v = value ?? {}
    for (const child of field.fields ?? []) {
      const e = validateField(child, v?.[child.name])
      if (e) return `child:${child.name}:${e}`
    }
  }
  return null
}

export function validateSchema(schema: FormSchema, data: Record<string, any>): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const f of schema.fields) {
    const e = validateField(f, data[f.name])
    if (e) errors[f.name] = e
  }
  return errors
}
