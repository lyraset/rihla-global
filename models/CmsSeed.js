import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

/**
 * One row per collection that has had its shipped defaults planted.
 *
 * Seeding used to be decided by looking for each default row's key field, which
 * meant renaming a row made the lookup miss and the original was re-created on
 * the next admin visit. The marker makes seeding a once-ever event instead, so
 * renames and deletions stick.
 */
const cmsSeedSchema = new mongoose.Schema(
  {
    collection: { type: String, required: true, unique: true, index: true },
    seededAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

applyToJSON(cmsSeedSchema)

export const CmsSeed = model('CmsSeed', cmsSeedSchema)
