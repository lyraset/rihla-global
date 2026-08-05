import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

/**
 * Editable heading copy for a named site section (services, faqs, cta, …).
 *
 * The items inside each section already live in their own collections; this
 * holds only the wrapper copy that was previously hardcoded in SiteContent.
 * `key` ties a row to a render site, so it is unique and drawn from a fixed
 * list — a row with an unrecognised key is simply ignored.
 */
const pageSectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    eyebrow: String,
    title: String,
    subtitle: String,
    isVisible: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

applyToJSON(pageSectionSchema)

export const PageSection = model('PageSection', pageSectionSchema)
