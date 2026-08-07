import mongoose from 'mongoose'
import { applyToJSON, mediaRefSchema, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const processStepSchema = new mongoose.Schema(
  {
    /**
     * Which page this item belongs to. Empty = shared by every page that
     * renders this section (the default, and how all existing rows behave).
     * Set it to make one page's wording independent of the others.
     */
    page: { type: String, default: '', index: true },
    stepNumber: { type: Number, default: 0 },
    title: { type: String, required: true },
    description: String,
    icon: String, // lucide icon name
    image: mediaRefSchema,
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

processStepSchema.index({ isPublished: 1, order: 1 })
applyToJSON(processStepSchema)

export const ProcessStep = model('ProcessStep', processStepSchema)
