'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireRole } from '../lib/session.js'
import { getCollection } from '../lib/cms/collections.js'
import { parseFormData, validateFields } from '../lib/cms/fields.js'
import * as cms from '../services/cms.js'
import { writeAudit } from '../services/audit.js'
import { revalidateTags } from '../lib/cache.js'

export async function saveEntityAction(_prevState, formData) {
  const session = await requireRole(['superadmin', 'editor'])
  const key = formData.get('__collection')
  const id = formData.get('__id')
  const col = getCollection(key)
  if (!col) return { ok: false, error: 'Unknown collection' }

  const doc = parseFormData(col.fields, formData)
  const errors = validateFields(col.fields, doc)
  if (Object.keys(errors).length) return { ok: false, errors }
  doc.updatedBy = session.user.id

  try {
    if (id && id !== 'new') {
      await cms.updateEntity(col.model, id, doc)
      await writeAudit({ actor: session.user.id, action: 'update', model: col.model.modelName, docId: id, after: doc })
    } else {
      const created = await cms.createEntity(col.model, doc)
      await writeAudit({ actor: session.user.id, action: 'create', model: col.model.modelName, docId: created?.id })
    }
  } catch (err) {
    if (err?.code === 11000) return { ok: false, error: 'A record with that slug/identifier already exists.' }
    return { ok: false, error: err?.message || 'Could not save.' }
  }

  revalidateTags([col.tag])
  revalidatePath(`/admin/content/${key}`)
  redirect(`/admin/content/${key}`)
}

export async function deleteEntityAction(key, id) {
  const session = await requireRole(['superadmin', 'editor'])
  const col = getCollection(key)
  if (!col) return { ok: false }
  await cms.deleteEntity(col.model, id)
  await writeAudit({ actor: session.user.id, action: 'delete', model: col.model.modelName, docId: id })
  revalidateTags([col.tag])
  revalidatePath(`/admin/content/${key}`)
  return { ok: true }
}

export async function reorderEntityAction(key, id, direction) {
  await requireRole(['superadmin', 'editor'])
  const col = getCollection(key)
  if (!col) return
  await cms.reorderEntity(col.model, id, direction)
  revalidateTags([col.tag])
  revalidatePath(`/admin/content/${key}`)
}
