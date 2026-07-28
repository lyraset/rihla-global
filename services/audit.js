import { connectDB } from '../lib/db.js'
import { AuditLog } from '../models/AuditLog.js'
import { logger } from '../lib/logger.js'

/** Best-effort audit write — must never break the action it records. */
export async function writeAudit({ actor, action, model, docId, before, after, ip }) {
  try {
    await connectDB()
    await AuditLog.create({ actor, action, model, docId, before, after, ip })
  } catch (err) {
    logger.warn('audit write failed', { error: String(err) })
  }
}

export async function listAudit({ page = 1, limit = 50 } = {}) {
  await connectDB()
  const [items, total] = await Promise.all([
    AuditLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('actor', 'name email'),
    AuditLog.countDocuments(),
  ])
  return { items, total, page, limit }
}
