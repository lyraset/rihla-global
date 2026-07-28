import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const mediaSchema = new mongoose.Schema(
  {
    publicId: { type: String, unique: true, required: true },
    url: String,
    secureUrl: String,
    resourceType: { type: String, enum: ['image', 'video', 'raw'], default: 'image' },
    format: String,
    bytes: Number,
    width: Number,
    height: Number,
    pages: Number, // for PDFs
    folder: String,
    originalFilename: String,
    alt: { type: String, default: '' },
    caption: String,
    tags: [String],
    usedIn: [{ model: String, docId: ObjectId, field: String }],
    blurDataURL: String,
    uploadedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

mediaSchema.index({ folder: 1, createdAt: -1 })
mediaSchema.index({ resourceType: 1 })
mediaSchema.index({ tags: 1 })

applyToJSON(mediaSchema)

export const Media = model('Media', mediaSchema)
