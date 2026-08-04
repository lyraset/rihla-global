'use server'

import { revalidatePath } from 'next/cache'
import { requireRole } from '../lib/session.js'
import { getManagedPaths } from '../lib/cms/routes.js'
import { parseSeoFormData } from '../lib/cms/seo-fields.js'
import { saveRouteSeo } from '../services/seo.js'
import { writeAudit } from '../services/audit.js'
import { revalidateTags, CACHE_TAGS } from '../lib/cache.js'

/**
 * Saves the whole SEO table in one submit.
 *
 * Only paths the site actually serves are accepted, so a crafted payload cannot
 * create SEO rows for arbitrary URLs.
 */
export async function saveSeoAction(_prevState, formData) {
  const session = await requireRole(['superadmin', 'editor'])

  const rows = parseSeoFormData(formData, await getManagedPaths())
  if (rows.length === 0) return { ok: false, error: 'Nothing to save.' }

  try {
    for (const { path, doc } of rows) {
      await saveRouteSeo(path, doc, session.user.id)
    }
    await writeAudit({ actor: session.user.id, action: 'update', model: 'RouteSeo' })
  } catch (err) {
    return { ok: false, error: err?.message || 'Could not save SEO settings.' }
  }

  revalidateTags([CACHE_TAGS.seo])
  // Public routes are force-dynamic, so their metadata rebuilds per request;
  // this only refreshes the admin screen itself.
  revalidatePath('/admin/seo')
  return { ok: true, saved: rows.length, savedAt: Date.now() }
}
