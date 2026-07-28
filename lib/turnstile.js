import { env, flags } from './env.js'
import { logger } from './logger.js'

/**
 * Verify a Cloudflare Turnstile token server-side. When Turnstile is not
 * configured (local dev), verification is skipped and the request is allowed.
 */
export async function verifyTurnstile(token, ip) {
  if (!flags.hasTurnstile) return true
  if (!token) return false
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
    })
    const json = await res.json()
    return Boolean(json.success)
  } catch (err) {
    logger.warn('turnstile verify error', { error: String(err) })
    return false
  }
}
