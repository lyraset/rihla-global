import { connectDB } from '../lib/db.js'
import { RouteSeo } from '../models/RouteSeo.js'
import { normalisePath } from '../lib/cms/routes.js'

const serialize = (docs) => (docs ? JSON.parse(JSON.stringify(docs)) : docs)

/** Every override, as a plain `{ [path]: seo }` map. Never throws. */
export async function getRouteSeoMap() {
  try {
    await connectDB()
    const rows = serialize(await RouteSeo.find())
    return Object.fromEntries(rows.map((r) => [normalisePath(r.path), r]))
  } catch {
    return {}
  }
}

/** A single route's override, or null. Never throws — SEO must not break a page. */
export async function getRouteSeo(path) {
  try {
    await connectDB()
    return serialize(await RouteSeo.findOne({ path: normalisePath(path) }))
  } catch {
    return null
  }
}

/**
 * Upsert one route. A row whose fields are all blank is deleted rather than
 * stored, so "clear the boxes" genuinely reverts to the computed default
 * instead of pinning empty strings over it.
 */
export async function saveRouteSeo(path, doc, actorId) {
  await connectDB()
  const key = normalisePath(path)
  const meaningful = Object.entries(doc).some(([, v]) =>
    Array.isArray(v) ? v.length > 0 : typeof v === 'boolean' ? v : String(v ?? '').trim() !== '',
  )

  if (!meaningful) {
    await RouteSeo.deleteOne({ path: key })
    return null
  }

  return RouteSeo.findOneAndUpdate(
    { path: key },
    { $set: { ...doc, path: key, updatedBy: actorId } },
    { upsert: true, returnDocument: 'after', runValidators: true },
  )
}
