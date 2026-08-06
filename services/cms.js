import mongoose from 'mongoose'
import { connectDB } from '../lib/db.js'

/** Generic CRUD over any Mongoose model — the only place CMS models are touched. */

export async function listEntities(Model, sort = { createdAt: -1 }) {
  await connectDB()
  return Model.find().sort(sort)
}

export async function getEntity(Model, id) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  return Model.findById(id)
}

export async function createEntity(Model, doc) {
  await connectDB()
  return Model.create(doc)
}

/**
 * Plant a collection's shipped default rows — once, ever.
 *
 * Used by collections whose rows map onto fixed render sites (page sections,
 * spotlight cards) so the admin opens with the live copy already editable.
 *
 * Deliberately NOT keyed on the rows' own fields. Matching on a field the
 * editor can change (a card's title, a section's key) means renaming a row
 * makes the lookup miss and the shipped default is silently re-created next
 * time the list loads. A marker row records that seeding happened, so an
 * editor's renames and deletions are permanent.
 */
export async function ensureDefaultRows(collectionKey, Model, { rows = [] } = {}) {
  if (!rows.length) return 0
  await connectDB()
  const { CmsSeed } = await import('../models/CmsSeed.js')

  // Claim the seed atomically — under concurrent admin requests exactly one
  // caller creates the marker, and only that caller inserts.
  const claim = await CmsSeed.updateOne(
    { collection: collectionKey },
    { $setOnInsert: { collection: collectionKey, seededAt: new Date() } },
    { upsert: true },
  )
  if (!claim?.upsertedCount) return 0

  // Installs that were seeded before the marker existed already have their
  // rows; record them as seeded and leave the data alone.
  if ((await Model.estimatedDocumentCount()) > 0) return 0

  try {
    const created = await Model.insertMany(rows, { ordered: false })
    return created.length
  } catch {
    return 0 // a unique-index clash means the rows are already there
  }
}

export async function updateEntity(Model, id, doc) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  return Model.findByIdAndUpdate(id, doc, { returnDocument: 'after', runValidators: true })
}

export async function deleteEntity(Model, id) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  return Model.findByIdAndDelete(id)
}

/** Swap sort order with the adjacent published/unpublished sibling. */
export async function reorderEntity(Model, id, direction) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return
  const doc = await Model.findById(id)
  if (!doc) return
  const cmp = direction === 'up' ? { $lt: doc.order ?? 0 } : { $gt: doc.order ?? 0 }
  const sort = direction === 'up' ? { order: -1 } : { order: 1 }
  const neighbor = await Model.findOne({ order: cmp }).sort(sort)
  if (!neighbor) return
  const tmp = doc.order ?? 0
  doc.order = neighbor.order ?? 0
  neighbor.order = tmp
  await doc.save()
  await neighbor.save()
}
