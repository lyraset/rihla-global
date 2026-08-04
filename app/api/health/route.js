import mongoose from 'mongoose'
import { connectDB } from '../../../lib/db.js'
import { flags } from '../../../lib/env.js'
import { ok } from '../../../lib/api.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Maps a driver error to a coarse cause. Deliberately returns a fixed label
 * rather than the raw message so the connection string, cluster host and user
 * are never exposed on a public endpoint.
 */
function classifyDbError(err) {
  const m = `${err?.message || ''} ${err?.codeName || ''}`.toLowerCase()
  if (m.includes('ip that isn') || m.includes('whitelist') || m.includes('ip access list')) {
    return 'ip_not_allowlisted' // Atlas Network Access is blocking this host
  }
  if (m.includes('bad auth') || m.includes('authentication failed') || m.includes('auth failed')) {
    return 'bad_credentials' // wrong user/password in MONGODB_URI
  }
  if (m.includes('enotfound') || m.includes('querysrv') || m.includes('getaddrinfo')) {
    return 'host_not_resolved' // cluster hostname in MONGODB_URI is wrong
  }
  if (m.includes('timed out') || m.includes('timeout')) return 'timeout'
  return 'other'
}

export async function GET() {
  let db = 'not_configured'
  let dbCause
  if (flags.hasMongo) {
    try {
      await connectDB()
      db = mongoose.connection.readyState === 1 ? 'up' : 'down'
    } catch (err) {
      db = 'down'
      dbCause = classifyDbError(err)
      console.error('[health] db connect failed:', err?.message)
    }
  }
  return ok({
    ok: db !== 'down',
    db,
    ...(dbCause ? { dbCause } : {}),
    cloudinary: flags.hasCloudinary ? 'configured' : 'not_configured',
    email: flags.hasResend ? 'configured' : 'not_configured',
    uptime: process.uptime(),
  })
}
