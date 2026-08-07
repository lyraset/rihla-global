import mongoose from 'mongoose'
import { applyToJSON, mediaRefSchema, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const testimonialSchema = new mongoose.Schema(
  {
    /**
     * Which page this item belongs to. Empty = shared by every page that
     * renders this section (the default, and how all existing rows behave).
     * Set it to make one page's wording independent of the others.
     */
    page: { type: String, default: '', index: true },
    name: { type: String, required: true },
    quote: { type: String, required: true },
    destination: String, // e.g. "UK Student Visa"
    rating: { type: Number, min: 1, max: 5, default: 5 },
    photo: mediaRefSchema,
    videoUrl: mediaRefSchema,
    company: String,
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

testimonialSchema.index({ isPublished: 1, order: 1 })
applyToJSON(testimonialSchema)

export const Testimonial = model('Testimonial', testimonialSchema)
