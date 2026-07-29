import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '../lib/db.js'
import { AdminUser } from '../models/AdminUser.js'

/** Returns the Mongoose doc (incl. passwordHash) — used by the auth provider. */
export async function findAdminByEmail(email) {
  await connectDB()
  return AdminUser.findOne({ email: String(email).toLowerCase().trim(), isActive: true })
}

export async function touchLastLogin(id) {
  await connectDB()
  return AdminUser.updateOne({ _id: id }, { lastLoginAt: new Date() })
}

export async function listAdminUsers() {
  await connectDB()
  return AdminUser.find().sort({ createdAt: -1 })
}

/** How many admin accounts exist — drives the first-run setup flow. */
export async function countAdmins() {
  await connectDB()
  return AdminUser.countDocuments()
}

export async function createAdminUser({ name, email, password, role = 'editor', mustChangePassword = false }) {
  await connectDB()
  const passwordHash = await bcrypt.hash(password, 12)
  return AdminUser.create({ name, email, passwordHash, role, mustChangePassword })
}

export async function setAdminActive(id, isActive) {
  await connectDB()
  if (!mongoose.isValidObjectId(id)) return null
  return AdminUser.findByIdAndUpdate(id, { isActive }, { new: true })
}
