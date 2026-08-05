import mongoose from 'mongoose'
import { applyToJSON, mediaRefSchema, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

/** The image cards in the "Study Abroad & Work Abroad" section. */
const spotlightCardSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    copy: String,
    image: mediaRefSchema,
    href: { type: String, default: '/contact' },
    linkLabel: { type: String, default: 'Explore Options' },
    isPublished: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

spotlightCardSchema.index({ isPublished: 1 })
applyToJSON(spotlightCardSchema)

export const SpotlightCard = model('SpotlightCard', spotlightCardSchema)
