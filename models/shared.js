import mongoose from 'mongoose'

/** Embedded reference to a Cloudinary asset (not its own collection). */
export const mediaRefSchema = new mongoose.Schema(
  {
    publicId: String,
    url: String,
    alt: String,
    width: Number,
    height: Number,
    blurDataURL: String,
  },
  { _id: false },
)

/** Reusable SEO subdocument (§5.13). */
export const seoSchema = new mongoose.Schema(
  {
    metaTitle: String,
    metaDescription: String,
    canonicalUrl: String,
    keywords: [String],
    ogTitle: String,
    ogDescription: String,
    ogImage: mediaRefSchema,
    twitterCard: { type: String, default: 'summary_large_image' },
    noindex: { type: Boolean, default: false },
    nofollow: { type: Boolean, default: false },
    schemaType: String,
    schemaOverrides: mongoose.Schema.Types.Mixed,
    changefreq: {
      type: String,
      enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
      default: 'monthly',
    },
    priority: { type: Number, default: 0.7 },
  },
  { _id: false },
)

/** Apply a consistent `_id → id` JSON transform to a schema. */
export function applyToJSON(schema) {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret) => {
      if (ret._id) ret.id = ret._id.toString()
      delete ret._id
      return ret
    },
  })
}

/** Register a model once (guards against Next hot-reload re-compilation). */
export function model(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema)
}
