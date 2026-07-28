import { after } from 'next/server'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { leadSchema, fieldErrors } from '../../../lib/validators/lead.js'
import { rateLimit } from '../../../lib/ratelimit.js'
import { verifyTurnstile } from '../../../lib/turnstile.js'
import { createLead, findRecentDuplicate, updateLead } from '../../../services/leads.js'
import { getWhatsappNumber } from '../../../services/settings.js'
import { buildWaLink, leadWaText, sendWhatsappTemplate } from '../../../lib/whatsapp.js'
import { sendLeadNotification, sendAutoReply } from '../../../lib/mailer.js'
import { ok, fail, getClientIp } from '../../../lib/api.js'
import { revalidateTags, CACHE_TAGS } from '../../../lib/cache.js'
import { flags } from '../../../lib/env.js'
import { logger } from '../../../lib/logger.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizePhone(phone) {
  if (!phone) return phone
  try {
    const parsed = parsePhoneNumberFromString(phone, 'PK')
    return parsed ? parsed.number : phone // E.164, e.g. +9232...
  } catch {
    return phone
  }
}

export async function POST(req) {
  const ip = getClientIp(req)

  // 1. Rate limit — 5 / 10 min per IP
  const rl = await rateLimit(`leads:${ip}`, { limit: 5, window: '10 m' })
  if (!rl.success) {
    return fail('RATE_LIMITED', 'Too many requests. Please try again in a few minutes.', { status: 429 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return fail('BAD_JSON', 'Invalid request body.')
  }

  // 2. Honeypot — silently drop, fake success
  if (body.website) {
    logger.warn('honeypot triggered', { ip })
    return ok({ id: null, whatsappUrl: null }, {}, 201)
  }

  // 4. Validation (per-type via discriminated union)
  const parsed = leadSchema.safeParse(body)
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', 'Please check the highlighted fields.', {
      fields: fieldErrors(parsed.error),
    })
  }
  const input = parsed.data

  // 3. Turnstile (skipped if not configured)
  if (!(await verifyTurnstile(input.turnstileToken, ip))) {
    return fail('CAPTCHA_FAILED', 'Captcha verification failed. Please try again.')
  }

  // 5. Normalize
  const email = input.email
  const phone = normalizePhone(input.phone)

  // 6/7. Dedupe + persist
  let leadDoc
  try {
    leadDoc = await findRecentDuplicate({ email, type: input.type })
    if (!leadDoc) {
      leadDoc = await createLead({
        type: input.type,
        name: input.name,
        email,
        phone,
        visaType: input.visaType,
        message: input.message,
        source: input.source,
        meta: { ip, userAgent: req.headers.get('user-agent') || '' },
      })
    }
  } catch (err) {
    logger.error('lead persist failed', { error: String(err) })
    return fail('SERVER_ERROR', 'We could not process your request. Please try again.', { status: 500 })
  }

  const lead = leadDoc.toJSON ? leadDoc.toJSON() : leadDoc

  // Visitor-facing WhatsApp deep link (CMS number, env fallback)
  const waNumber = await getWhatsappNumber()
  const whatsappUrl = buildWaLink({ number: waNumber, text: leadWaText(lead) })

  // 8. Fan out AFTER responding — notifications never block or fail the submission
  after(async () => {
    const [notif, auto, wa] = await Promise.allSettled([
      sendLeadNotification(lead),
      sendAutoReply(lead),
      flags.whatsappCloud
        ? sendWhatsappTemplate({
            to: waNumber,
            params: [lead.name || '-', lead.visaType || '-', lead.phone || '-'],
          })
        : Promise.resolve({ ok: false, skipped: true }),
    ])
    const val = (r) => (r.status === 'fulfilled' ? r.value : {})
    try {
      await updateLead(lead.id, {
        notifications: {
          emailSent: Boolean(val(notif).ok),
          emailSentAt: val(notif).ok ? new Date() : undefined,
          autoRepliedAt: val(auto).ok ? new Date() : undefined,
        },
        whatsapp: {
          deepLink: whatsappUrl,
          sent: Boolean(val(wa).ok),
          sentAt: val(wa).ok ? new Date() : undefined,
          messageId: val(wa).messageId,
          error: val(wa).error,
        },
      })
    } catch (err) {
      logger.warn('post-lead update failed', { error: String(err) })
    }
  })

  revalidateTags([CACHE_TAGS.leads])
  return ok({ id: lead.id, whatsappUrl }, {}, 201)
}
