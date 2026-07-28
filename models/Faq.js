import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: String, // sanitized HTML
    category: String,
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

faqSchema.index({ isPublished: 1, order: 1 })
applyToJSON(faqSchema)

export const Faq = model('Faq', faqSchema)
