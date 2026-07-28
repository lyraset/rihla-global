import { connectDB } from '../lib/db.js'
import { Media } from '../models/Media.js'

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export async function registerMedia(doc) {
  await connectDB()
  return Media.findOneAndUpdate({ publicId: doc.publicId }, doc, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  })
}

export async function listMedia({ folder, resourceType, tags, q, page = 1, limit = 40 } = {}) {
  await connectDB()
  const filter = {}
  if (folder) filter.folder = folder
  if (resourceType) filter.resourceType = resourceType
  if (tags?.length) filter.tags = { $in: tags }
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i')
    filter.$or = [{ originalFilename: rx }, { alt: rx }, { publicId: rx }]
  }
  const [items, total] = await Promise.all([
    Media.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Media.countDocuments(filter),
  ])
  return { items, total, page, limit }
}

export async function findMediaByPublicId(publicId) {
  await connectDB()
  return Media.findOne({ publicId })
}

export async function deleteMediaDoc(publicId) {
  await connectDB()
  return Media.findOneAndDelete({ publicId })
}
