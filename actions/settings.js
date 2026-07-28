'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '../lib/session.js'
import { SETTINGS_FIELDS } from '../lib/cms/settings-fields.js'
import { connectDB } from '../lib/db.js'
import { SiteSettings } from '../models/SiteSettings.js'
import { writeAudit } from '../services/audit.js'
import { revalidateTags, CACHE_TAGS } from '../lib/cache.js'

export async function saveSettingsAction(_prevState, formData) {
  const session = await requireRole(['superadmin', 'editor'])

  // Build a $set with dot-path keys straight onto the SiteSettings document.
  const set = { key: 'main' }
  for (const f of SETTINGS_FIELDS) {
    if (f.type === 'boolean') {
      set[f.name] = formData.get(f.name) === 'on'
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
    await SiteSettings.updateOne({ key: 'main' }, { $set: set }, { upsert: true })
    await writeAudit({ actor: session.user.id, action: 'update', model: 'SiteSettings' })
  } catch (err) {
    return { ok: false, error: err?.message || 'Could not save settings.' }
  }

  revalidateTags([CACHE_TAGS.settings])
  revalidatePath('/admin/settings')
  return { ok: true, savedAt: Date.now() }
}
