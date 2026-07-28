import { requireAdmin } from '../../../../lib/session.js'
import { signUploadParams } from '../../../../lib/cloudinary.js'
import { rateLimit } from '../../../../lib/ratelimit.js'
import { ok, fail, getClientIp } from '../../../../lib/api.js'
import { logger } from '../../../../lib/logger.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Returns signed params for a direct browser→Cloudinary upload.
 * Admin-only (currently locked until Auth.js lands in Phase 4).
 */
export async function POST(req) {
  try {
    await requireAdmin()
  } catch {
    return fail('UNAUTHORIZED', 'Admin session required.', { status: 401 })
  }

  const ip = getClientIp(req)
  const rl = await rateLimit(`upload:${ip}`, { limit: 30, window: '1 m' })
  if (!rl.success) return fail('RATE_LIMITED', 'Too many upload requests.', { status: 429 })

  let body
  try {
    body = await req.json()
  } catch {
    return fail('BAD_JSON', 'Invalid request body.')
  }

  try {
    const params = signUploadParams({
      folder: body.folder,
      publicId: body.publicId,
      tags: body.tags,
    })
    return ok(params)
  } catch (err) {
    logger.error('upload sign failed', { error: String(err) })
    return fail('SERVER_ERROR', String(err.message || err), { status: 500 })
  }
}
