import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const countrySchema = new mongoose.Schema(
  {
    /**
     * Which page this item belongs to. Empty = shared by every page that
     * renders this section (the default, and how all existing rows behave).
     * Set it to make one page's wording independent of the others.
     */
    page: { type: String, default: '', index: true },
    /**
     * Optional custom URL segment. Blank derives one from `name` — see
     * lib/cms/country-url.js. Deliberately separate from `code`, which is the
     * ISO code the flag service requires and cannot double as a URL.
     */
    slug: { type: String, index: true },
    name: { type: String, required: true },
    code: { type: String, uppercase: true, trim: true }, // ISO-2 e.g. "GB"
    flag: { type: String, default: '' }, // emoji flag e.g. "🇬🇧"
    visaTypes: [String], // e.g. ['Student','Work','Tourist']
    blurb: String,
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

countrySchema.index({ isPublished: 1, order: 1 })
applyToJSON(countrySchema)

export const Country = model('Country', countrySchema)
