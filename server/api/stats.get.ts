
export default defineEventHandler(() => {
  const db = useDb()
  const totalForms = (db.prepare('SELECT COUNT(*) as c FROM forms').get() as any).c
  const totalSubmissions = (db.prepare('SELECT COUNT(*) as c FROM submissions').get() as any).c
  const rows = db.prepare('SELECT schema FROM forms').all() as any[]
  let totalFields = 0
  const countFields = (fields: any[]) => {
    if (!Array.isArray(fields)) return
    for (const f of fields) {
      totalFields++
      if (f?.fields) countFields(f.fields)
    }
  }
  for (const r of rows) {
    try {
      const s = JSON.parse(r.schema)
      countFields(s?.fields ?? [])
    } catch {}
  }
  return { totalForms, totalSubmissions, totalFields }
})
