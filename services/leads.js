import mongoose from 'mongoose'
import { connectDB } from '../lib/db.js'
import { Lead } from '../models/Lead.js'

/**
 * Data-access for leads. Route handlers and actions call these — never the
 * model directly (§4 hard rule).
 */

export async function findRecentDuplicate({ email, type }, withinMs = 60_000) {
  await connectDB()
  const since = new Date(Date.now() - withinMs)
  return Lead.findOne({ email, type, createdAt: { $gte: since } }).sort({ createdAt: -1 })
}

export async function createLead(payload) {
  await connectDB()
  return Lead.create(payload)
}

export async function updateLead(id, patch) {
  await connectDB()
  return Lead.findByIdAndUpdate(id, patch, { new: true })
}

export async function findActiveNewsletter(email) {
  await connectDB()
  return Lead.findOne({ type: 'newsletter', email, status: { $ne: 'lost' } })
}

export async function listLeads({ type, status, q, page = 1, limit = 25 } = {}) {
  await connectDB()
  const filter = {}
  if (type) filter.type = type
  if (status) filter.status = status
  if (q) filter.$text = { $search: q }
  const [items, total] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Lead.countDocuments(filter),
  ])
  return { items, total, page, limit }
}

export async function getLeadById(id) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  return Lead.findById(id).populate('assignedTo', 'name email')
}

export async function updateLeadById(id, patch) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  return Lead.findByIdAndUpdate(id, patch, { new: true })
}

export async function addNote(id, note) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  return Lead.findByIdAndUpdate(id, { $push: { notes: note } }, { new: true })
}

export async function deleteLeadById(id) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  return Lead.findByIdAndDelete(id)
}

export async function leadCounts() {
  await connectDB()
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000)
  const [total, unread, today, week, byType, byStatus] = await Promise.all([
    Lead.countDocuments({}),
    Lead.countDocuments({ isRead: false }),
    Lead.countDocuments({ createdAt: { $gte: startToday } }),
    Lead.countDocuments({ createdAt: { $gte: weekAgo } }),
    Lead.aggregate([{ $group: { _id: '$type', n: { $sum: 1 } } }]),
    Lead.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ])
  return { total, unread, today, week, byType, byStatus }
}
