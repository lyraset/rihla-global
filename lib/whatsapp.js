import { env, flags } from './env.js'
import { logger } from './logger.js'

/** Normalize any human-entered number to E.164 digits (no '+'). */
export function normalizeWa(number) {
  return String(number || '').replace(/\D/g, '')
}

/** Visitor-facing wa.me deep link, optionally pre-filled. */
export function buildWaLink({ number, text }) {
  const n = normalizeWa(number)
  const q = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${n}${q}`
}

/** Pre-filled "continue on WhatsApp" message body for a lead. */
export function leadWaText(lead) {
  return [
    'New enquiry from rihlaglobal.com',
    '',
    `Name: ${lead.name || '-'}`,
    `Email: ${lead.email || '-'}`,
    `Phone: ${lead.phone || '-'}`,
    lead.visaType ? `Visa type: ${lead.visaType}` : null,
    lead.message ? `Message: ${lead.message}` : null,
    `Ref: ${lead.id || lead._id || ''}`,
  ]
    .filter(Boolean)
    .join('\n')
}

/** cloud_api mode: server-initiated templated alert. No-op unless configured. */
export async function sendWhatsappTemplate({ to, params }) {
  if (!flags.whatsappCloud) return { ok: false, skipped: true }
  const url = `https://graph.facebook.com/${env.WHATSAPP_GRAPH_VERSION}/${env.WHATSAPP_CLOUD_PHONE_NUMBER_ID}/messages`
  const body = {
    messaging_product: 'whatsapp',
    to: normalizeWa(to),
    type: 'template',
    template: {
      name: env.WHATSAPP_CLOUD_TEMPLATE_NAME,
      language: { code: 'en' },
      components: [{ type: 'body', parameters: params.map((text) => ({ type: 'text', text })) }],
    },
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.WHATSAPP_CLOUD_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message || `HTTP ${res.status}`)
      return { ok: true, messageId: json?.messages?.[0]?.id }
    } catch (err) {
      logger.warn('whatsapp send failed', { attempt, error: String(err) })
      if (attempt === 3) return { ok: false, error: String(err) }
      await new Promise((r) => setTimeout(r, 2 ** attempt * 250))
    }
  }
  return { ok: false }
}
