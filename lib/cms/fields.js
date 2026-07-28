import slugify from 'slugify'

/** FormData → plain doc, per the collection's field configs. */
export function parseFormData(fields, formData) {
  const doc = {}
  for (const f of fields) {
    switch (f.type) {
      case 'boolean':
        doc[f.name] = formData.get(f.name) === 'on' || formData.get(f.name) === 'true'
        break
      case 'number': {
        const v = formData.get(f.name)
        doc[f.name] = v === '' || v == null ? undefined : Number(v)
        break
      }
      case 'stringlist':
        doc[f.name] = String(formData.get(f.name) || '')
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
        break
      case 'tags':
        doc[f.name] = formData.getAll(f.name).filter(Boolean)
        break
      case 'image': {
        const url = String(formData.get(f.name) || '').trim()
        doc[f.name] = url ? { url, alt: '' } : undefined
        break
      }
      case 'slug': {
        let v = String(formData.get(f.name) || '').trim()
        if (!v && f.from) v = String(formData.get(f.from) || '')
        doc[f.name] = slugify(v, { lower: true, strict: true })
        break
      }
      default:
        doc[f.name] = String(formData.get(f.name) ?? '')
    }
  }
  return doc
}

/** Saved doc → values for form inputs (serializable, with defaults applied). */
export function docToFormValues(fields, doc = {}) {
  const values = {}
  for (const f of fields) {
    const v = doc[f.name]
    switch (f.type) {
      case 'boolean':
        values[f.name] = v == null ? f.default ?? false : Boolean(v)
        break
      case 'number':
        values[f.name] = v == null ? f.default ?? '' : v
        break
      case 'stringlist':
        values[f.name] = Array.isArray(v) ? v.join('\n') : ''
        break
      case 'tags':
        values[f.name] = Array.isArray(v) ? v : []
        break
      case 'image':
        values[f.name] = v?.url || ''
        break
      default:
        values[f.name] = v ?? f.default ?? ''
    }
  }
  return values
}

/** Minimal required-field validation → { field: message }. */
export function validateFields(fields, doc) {
  const errors = {}
  for (const f of fields) {
    if (!f.required) continue
    const v = doc[f.name]
    const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0)
    if (empty) errors[f.name] = `${f.label} is required`
  }
  return errors
}
