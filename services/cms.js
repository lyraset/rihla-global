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
 * Idempotently insert a collection's shipped default rows.
 *
 * Used by collections whose rows map onto fixed render sites (page sections,
 * spotlight cards) so the admin opens with the live copy already editable.
 * Upserts keyed on `uniqueBy` and uses $setOnInsert, so an editor's changes are
 * never overwritten and a second call is a no-op.
 */
export async function ensureDefaultRows(Model, { uniqueBy, rows = [] }) {
  if (!rows.length) return 0
  await connectDB()
  const ops = rows.map((row) => ({
    updateOne: {
      filter: { [uniqueBy]: row[uniqueBy] },
      update: { $setOnInsert: row },
      upsert: true,
    },
  }))
  const res = await Model.bulkWrite(ops, { ordered: false })
  return res?.upsertedCount || 0
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
