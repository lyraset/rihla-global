import mongoose from 'mongoose'
import { applyToJSON, seoSchema, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

/** Freeform legal / info pages: privacy, terms, about, etc. */
const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true }, // 'privacy', 'terms', 'about'
    content: String, // sanitized HTML / markdown-ish text
    seo: seoSchema,
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

pageSchema.index({ isPublished: 1 })
applyToJSON(pageSchema)

export const Page = model('Page', pageSchema)
