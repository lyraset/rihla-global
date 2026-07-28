import mongoose from 'mongoose'
import { connectDB } from '../../../lib/db.js'
import { flags } from '../../../lib/env.js'
import { ok } from '../../../lib/api.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  let db = 'not_configured'
  if (flags.hasMongo) {
    try {
      await connectDB()
      db = mongoose.connection.readyState === 1 ? 'up' : 'down'
    } catch {
      db = 'down'
    }
  }
  return ok({
    ok: db !== 'down',
    db,
    cloudinary: flags.hasCloudinary ? 'configured' : 'not_configured',
    email: flags.hasResend ? 'configured' : 'not_configured',
    uptime: process.uptime(),
  })
}
