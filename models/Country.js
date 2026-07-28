import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const countrySchema = new mongoose.Schema(
  {
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
