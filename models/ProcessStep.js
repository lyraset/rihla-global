import mongoose from 'mongoose'
import { applyToJSON, mediaRefSchema, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const processStepSchema = new mongoose.Schema(
  {
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
