import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const featureSchema = new mongoose.Schema(
  {
    /**
     * Which page this item belongs to. Empty = shared by every page that
     * renders this section (the default, and how all existing rows behave).
     * Set it to make one page's wording independent of the others.
     */
    page: { type: String, default: '', index: true },
    title: { type: String, required: true },
    description: String,
    icon: String, // lucide icon name
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

featureSchema.index({ isPublished: 1, order: 1 })
applyToJSON(featureSchema)

export const Feature = model('Feature', featureSchema)
