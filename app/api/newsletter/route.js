import crypto from 'node:crypto'
import { after } from 'next/server'
import { newsletterSchema, fieldErrors } from '../../../lib/validators/lead.js'
import { rateLimit } from '../../../lib/ratelimit.js'
import { verifyTurnstile } from '../../../lib/turnstile.js'
import { createLead, findActiveNewsletter, updateLead } from '../../../services/leads.js'
import { sendAutoReply } from '../../../lib/mailer.js'
import { ok, fail, getClientIp } from '../../../lib/api.js'
import { revalidateTags, CACHE_TAGS } from '../../../lib/cache.js'
import { env } from '../../../lib/env.js'
import { logger } from '../../../lib/logger.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const secret = () => env.REVALIDATE_SECRET || env.AUTH_SECRET || 'rihla-dev-unsubscribe-secret'

function signEmail(email) {
  return crypto.createHmac('sha256', secret()).update(email).digest('hex')
}

export async function POST(req) {
  const ip = getClientIp(req)

  const rl = await rateLimit(`newsletter:${ip}`, { limit: 5, window: '10 m' })
  if (!rl.success) return fail('RATE_LIMITED', 'Too many requests. Please try again later.', { status: 429 })

  let body
  try {
    body = await req.json()
  } catch {
    return fail('BAD_JSON', 'Invalid request body.')
  }

  if (body.website) return ok({ id: null }, {}, 201) // honeypot

  const parsed = newsletterSchema.safeParse({ ...body, type: 'newsletter' })
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Please enter a valid email.', { fields: fieldErrors(parsed.error) })
  }

  if (!(await verifyTurnstile(parsed.data.turnstileToken, ip))) {
    return fail('CAPTCHA_FAILED', 'Captcha verification failed.')
  }

  const email = parsed.data.email
  try {
    const existing = await findActiveNewsletter(email)
    if (existing) return fail('ALREADY_SUBSCRIBED', 'You are already subscribed.', { status: 409 })

    const doc = (
      await createLead({
        type: 'newsletter',
        email,
        source: parsed.data.source,
        meta: { ip, userAgent: req.headers.get('user-agent') || '' },
      })
    ).toJSON()

    after(async () => {
      await Promise.allSettled([sendAutoReply(doc)])
    })

    revalidateTags([CACHE_TAGS.leads])
    return ok({ id: doc.id }, {}, 201)
  } catch (err) {
    logger.error('newsletter subscribe failed', { error: String(err) })
    return fail('SERVER_ERROR', 'Could not subscribe. Please try again.', { status: 500 })
  }
}

// GET /api/newsletter/unsubscribe?email=&token=
export async function GET(req) {
  const url = new URL(req.url)
  const email = (url.searchParams.get('email') || '').toLowerCase().trim()
  const token = url.searchParams.get('token') || ''

  const page = (msg) =>
    new Response(
      `<!doctype html><meta charset="utf-8"><title>Unsubscribe</title><body style="font-family:system-ui;padding:48px;text-align:center"><h1 style="color:#1F7A46">Rihla Global</h1><p>${msg}</p></body>`,
      { headers: { 'content-type': 'text/html; charset=utf-8' } },
    )

  if (!email || !token || token !== signEmail(email)) return page('Invalid or expired unsubscribe link.')

  try {
    const existing = await findActiveNewsletter(email)
    if (existing) await updateLead(existing.id, { status: 'lost' })
    revalidateTags([CACHE_TAGS.leads])
    return page('You have been unsubscribed. Sorry to see you go.')
  } catch (err) {
    logger.warn('unsubscribe failed', { error: String(err) })
    return page('Something went wrong. Please contact us to unsubscribe.')
  }
}
