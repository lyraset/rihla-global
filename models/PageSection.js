import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

/**
 * Editable heading copy for one section on one page.
 *
 * The items inside each section already live in their own collections; this
 * holds only the wrapper copy that was previously hardcoded in SiteContent.
 *
 * Scoped by `page` as well as `key` because the section components are shared —
 * the services block renders on both Home and Services, the CTA on nearly every
 * page. Keying on `key` alone meant editing Home's wording silently rewrote the
 * other pages too. The pair is unique; a row whose pair isn't rendered anywhere
 * is simply ignored.
 */
const pageSectionSchema = new mongoose.Schema(
  {
    page: { type: String, required: true, index: true },
    key: { type: String, required: true, index: true },
    eyebrow: String,
    title: String,
    subtitle: String,
    isVisible: { type: Boolean, default: true },
    // Which of the section's items this page shows. The items themselves stay
    // in one shared collection — only the selection is per-page, so a price or
    // wording fix is still made once.
    featuredOnly: { type: Boolean, default: false },
    maxItems: { type: Number }, // blank/0 = show all
    order: { type: Number, default: 0 },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

pageSectionSchema.index({ page: 1, key: 1 }, { unique: true })

applyToJSON(pageSectionSchema)

export const PageSection = model('PageSection', pageSectionSchema)
