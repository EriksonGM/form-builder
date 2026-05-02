import type { FormField, FormSchema, StoredFile } from '~/types'

export interface AttachedFile extends StoredFile {
  fieldPath: string
}

export function collectAttachedFiles(schema: FormSchema | null, data: Record<string, any>): AttachedFile[] {
  if (!schema) return []
  const out: AttachedFile[] = []
  walk(schema.fields, data, '', out)
  return out
}

function walk(fields: FormField[] | undefined, value: any, path: string, out: AttachedFile[]) {
  if (!fields || value == null) return
  for (const f of fields) {
    const v = value?.[f.name]
    const p = path ? `${path}.${f.displayName || f.name}` : (f.displayName || f.name)
    if (v == null) continue
    if (f.type === 'file' && Array.isArray(v)) {
      for (const file of v as StoredFile[]) {
        if (file?.dataUrl) out.push({ ...file, fieldPath: p })
      }
    } else if (f.type === 'object') {
      walk(f.fields, v, p, out)
    } else if (f.type === 'array' && Array.isArray(v)) {
      v.forEach((item, i) => walk(f.fields, item, `${p}[${i + 1}]`, out))
    }
  }
}
