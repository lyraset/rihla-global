import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId, Mixed } = mongoose.Schema.Types

const leadSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['consultation', 'contact', 'newsletter', 'custom'],
      required: true,
      index: true,
    },
    formSlug: String, // set when type === 'custom'
    name: String,
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    phone: String, // stored E.164-normalized
    visaType: { type: String, enum: ['Student', 'Work', 'Tourist', 'Business', null] },
    message: String,
    answers: { type: Map, of: Mixed }, // dynamic form-builder payload
    attachments: [
      { url: String, publicId: String, format: String, bytes: Number, originalName: String },
    ],
    status: {
      type: String,
      enum: ['new', 'contacted', 'in_progress', 'won', 'lost', 'spam'],
      default: 'new',
      index: true,
    },
    assignedTo: { type: ObjectId, ref: 'AdminUser' },
    notes: [{ body: String, author: { type: ObjectId, ref: 'AdminUser' }, createdAt: Date }],
    source: {
      page: String,
      referrer: String,
      utm: { source: String, medium: String, campaign: String, term: String, content: String },
    },
    meta: { ip: String, userAgent: String, country: String },
    // renamed from `email` sub-object in the spec to avoid colliding with the scalar `email`
    notifications: { emailSent: Boolean, emailSentAt: Date, autoRepliedAt: Date },
    whatsapp: { sent: Boolean, sentAt: Date, messageId: String, error: String, deepLink: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
)

leadSchema.index({ createdAt: -1 })
leadSchema.index({ type: 1, status: 1, createdAt: -1 })
leadSchema.index({ name: 'text', email: 'text', message: 'text' })

applyToJSON(leadSchema)

export const Lead = model('Lead', leadSchema)
