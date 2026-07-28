'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireRole } from '../lib/session.js'
import { getLeadById, updateLeadById, addNote, deleteLeadById } from '../services/leads.js'
import { writeAudit } from '../services/audit.js'
import { revalidateTags, CACHE_TAGS } from '../lib/cache.js'

const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost', 'spam']

export async function setLeadStatus(id, status) {
  const session = await requireRole(['superadmin', 'editor'])
  if (!STATUSES.includes(status)) return { ok: false, error: 'Invalid status' }
  const before = await getLeadById(id)
  const after = await updateLeadById(id, { status })
  if (!after) return { ok: false, error: 'Lead not found' }
  await writeAudit({
    actor: session.user.id,
    action: 'update',
    model: 'Lead',
    docId: id,
    before: { status: before?.status },
    after: { status },
  })
  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${id}`)
  revalidateTags([CACHE_TAGS.leads])
  return { ok: true }
}

export async function addLeadNote(id, body) {
  const session = await requireRole(['superadmin', 'editor'])
  const parsed = z.string().trim().min(1).max(2000).safeParse(body)
  if (!parsed.success) return { ok: false, error: 'Note cannot be empty' }
  await addNote(id, { body: parsed.data, author: session.user.id, createdAt: new Date() })
  await writeAudit({ actor: session.user.id, action: 'note', model: 'Lead', docId: id })
  revalidatePath(`/admin/leads/${id}`)
  return { ok: true }
}

export async function toggleLeadRead(id, isRead) {
  await requireRole(['superadmin', 'editor'])
  await updateLeadById(id, { isRead })
  revalidatePath('/admin/leads')
  revalidatePath(`/admin/leads/${id}`)
  return { ok: true }
}

export async function deleteLead(id) {
  const session = await requireRole(['superadmin', 'editor'])
  const before = await getLeadById(id)
  await deleteLeadById(id)
  await writeAudit({
    actor: session.user.id,
    action: 'delete',
    model: 'Lead',
    docId: id,
    before: before?.toJSON?.(),
  })
  revalidatePath('/admin/leads')
  revalidateTags([CACHE_TAGS.leads])
  return { ok: true }
}
