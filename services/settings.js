import { connectDB } from '../lib/db.js'
import { SiteSettings } from '../models/SiteSettings.js'
import { env } from '../lib/env.js'

const serialize = (doc) => (doc ? JSON.parse(JSON.stringify(doc)) : null)

export async function getSiteSettings() {
  await connectDB()
  return serialize(await SiteSettings.findOne({ key: 'main' }))
}

/** WhatsApp number — prefers CMS, falls back to env, never throws. */
export async function getWhatsappNumber() {
  try {
    const s = await getSiteSettings()
    return s?.contact?.whatsapp || s?.whatsapp?.number || env.WHATSAPP_BUSINESS_NUMBER
  } catch {
    return env.WHATSAPP_BUSINESS_NUMBER
  }
}
