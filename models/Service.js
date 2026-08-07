import mongoose from 'mongoose'
import { applyToJSON, mediaRefSchema, seoSchema, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const serviceSchema = new mongoose.Schema(
  {
    /**
     * Which page this item belongs to. Empty = shared by every page that
     * renders this section (the default, and how all existing rows behave).
     * Set it to make one page's wording independent of the others.
     */
    page: { type: String, default: '', index: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    shortDescription: String,
    description: String, // sanitized HTML
    icon: String, // lucide icon name
    image: mediaRefSchema,
    gallery: [mediaRefSchema],
    bullets: [String],
    priceFrom: Number,
    currency: { type: String, default: 'PKR' },
    duration: String,
    faqs: [{ question: String, answer: String }],
    seo: seoSchema,
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

serviceSchema.index({ isPublished: 1, order: 1 })
applyToJSON(serviceSchema)

export const Service = model('Service', serviceSchema)
