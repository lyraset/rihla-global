import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const featureSchema = new mongoose.Schema(
  {
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
