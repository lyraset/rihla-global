import mongoose from 'mongoose'
import { applyToJSON, model } from './shared.js'

const { ObjectId } = mongoose.Schema.Types

/**
 * Per-URL on-page SEO, keyed by the route's public path.
 *
 * Deliberately keyed by `path` rather than hung off each content model: a route
 * like `/about` or `/countries` has no CMS document behind it, and the admin
 * needs one screen that covers every page the site serves. Documents here are
 * pure overrides — an absent field falls back to the page's computed default
 * (see lib/seo.js), so an empty row changes nothing.
 */
const routeSeoSchema = new mongoose.Schema(
  {
    // Normalised, leading-slash path. '/' for the home page. Unique.
    path: { type: String, required: true, unique: true, index: true },
    metaTitle: String,
    metaDescription: String,
    ogTitle: String,
    ogDescription: String,
    ogImageUrl: String,
    canonicalUrl: String,
    keywords: [String],
    noindex: { type: Boolean, default: false },
    nofollow: { type: Boolean, default: false },
    updatedBy: { type: ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true },
)

applyToJSON(routeSeoSchema)

export const RouteSeo = model('RouteSeo', routeSeoSchema)
