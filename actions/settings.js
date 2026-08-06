'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '../lib/session.js'
import { resolveSettingsFields } from '../lib/cms/settings-fields.js'
import { connectDB } from '../lib/db.js'
import { SiteSettings } from '../models/SiteSettings.js'
import { writeAudit } from '../services/audit.js'
import { revalidateTags, CACHE_TAGS } from '../lib/cache.js'

export async function saveSettingsAction(_prevState, formData) {
  const session = await requireRole(['superadmin', 'editor'])

  // A scoped editor (e.g. Content → Home hero) submits only its own group. Save
  // must then touch only those fields — iterating every field would read the
  // absent inputs as empty strings and wipe unrelated settings.
  const fields = resolveSettingsFields(String(formData.get('__section') || ''))
  if (!fields) return { ok: false, error: 'Unknown settings section.' }

  // Build a $set with dot-path keys straight onto the SiteSettings document.
  const set = { key: 'main' }
  const unset = {}
  for (const f of fields) {
    if (f.type === 'boolean') {
      set[f.name] = formData.get(f.name) === 'on'
    } else if (f.type === 'image') {
      // Stored as a media subdocument to match mediaRefSchema. Clearing the box
      // must $unset the subdoc — a $set of undefined is dropped by Mongoose and
      // would silently leave the previous image in place.
      const url = String(formData.get(f.name) || '').trim()
      if (url) set[f.name] = { url }
      else unset[f.name] = ''
    } else if (f.type === 'stringlist') {
      set[f.name] = String(formData.get(f.name) || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
    } else {
      set[f.name] = String(formData.get(f.name) ?? '')
    }
  }

  try {
    await connectDB()
    const update = { $set: set }
    if (Object.keys(unset).length) update.$unset = unset
    await SiteSettings.updateOne({ key: 'main' }, update, { upsert: true })
    await writeAudit({ actor: session.user.id, action: 'update', model: 'SiteSettings' })
  } catch (err) {
    return { ok: false, error: err?.message || 'Could not save settings.' }
  }

  revalidateTags([CACHE_TAGS.settings])
  revalidatePath('/admin/settings')
  revalidatePath('/admin/content/hero')
  return { ok: true, savedAt: Date.now() }
}
