import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId, Mixed } = mongoose.Schema.Types

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: ObjectId, ref: 'AdminUser' },
    action: { type: String, required: true }, // 'create' | 'update' | 'delete' | 'login' | ...
    model: String,
    docId: ObjectId,
    before: Mixed,
    after: Mixed,
    ip: String,
  },
  { timestamps: true },
)

auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ model: 1, docId: 1 })
applyToJSON(auditLogSchema)

export const AuditLog = model('AuditLog', auditLogSchema)
