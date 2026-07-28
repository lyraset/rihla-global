import mongoose from 'mongoose'
import { applyToJSON, mediaRefSchema, seoSchema, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: String,
    body: String, // sanitized HTML
    coverImage: mediaRefSchema,
    author: { name: String, photo: mediaRefSchema, bio: String },
    tags: [String],
    readingMinutes: Number,
    seo: seoSchema,
    publishedAt: Date,
    isPublished: { type: Boolean, default: false },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

blogPostSchema.index({ isPublished: 1, publishedAt: -1 })
blogPostSchema.index({ tags: 1 })
applyToJSON(blogPostSchema)

export const BlogPost = model('BlogPost', blogPostSchema)
