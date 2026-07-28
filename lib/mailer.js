import { Resend } from 'resend'
import { env, flags } from './env.js'
import { logger } from './logger.js'

const resend = flags.hasResend ? new Resend(env.RESEND_API_KEY) : null

const esc = (v) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

function leadCardHtml(lead) {
  const rows = [
    ['Type', lead.type],
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Visa type', lead.visaType],
    ['Message', lead.message],
    ['Page', lead.source?.page],
  ].filter(([, v]) => v)
  const adminUrl = `${env.NEXT_PUBLIC_SITE_URL}/admin/leads/${lead.id || ''}`
  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px">
      <h2 style="color:#1F7A46;margin:0 0 12px">New ${esc(lead.type)} lead</h2>
      <table style="border-collapse:collapse;width:100%;font-size:14px">
        ${rows
          .map(
            ([k, v]) =>
              `<tr><td style="padding:6px 10px;color:#64748b">${esc(k)}</td><td style="padding:6px 10px;font-weight:600;color:#0F1D3D">${esc(v)}</td></tr>`,
          )
          .join('')}
      </table>
      <p><a href="${esc(adminUrl)}" style="display:inline-block;margin-top:14px;background:#1F7A46;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-size:14px">Open in admin</a></p>
    </div>`
}

function autoReplyTemplate(lead) {
  const subjects = {
    consultation: 'We received your consultation request — Rihla Global',
    contact: 'Thanks for contacting Rihla Global',
    newsletter: "You're subscribed — Rihla Global",
    custom: 'We received your submission — Rihla Global',
  }
  const intro =
    lead.type === 'newsletter'
      ? 'Thanks for subscribing to Rihla Global. You will receive visa updates and tips.'
      : `Hi ${esc(lead.name || 'there')}, thank you for reaching out to Rihla Global. Our team will get back to you within 24 hours.`
  return {
    subject: subjects[lead.type] || subjects.contact,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px"><p style="font-size:15px;color:#0F1D3D">${intro}</p><p style="color:#64748b;font-size:12px;margin-top:24px">Rihla Global Visa Consultant Pvt. Ltd.</p></div>`,
  }
}

export async function sendLeadNotification(lead) {
  if (!resend) return { ok: false, skipped: true }
  try {
    const { data, error } = await resend.emails.send({
      from: env.LEAD_NOTIFY_FROM,
      to: env.LEAD_NOTIFY_TO,
      subject: `New ${lead.type} lead: ${lead.name || lead.email}`,
      html: leadCardHtml(lead),
    })
    if (error) throw new Error(error.message || 'resend error')
    return { ok: true, id: data?.id }
  } catch (err) {
    logger.warn('lead notification failed', { error: String(err) })
    return { ok: false, error: String(err) }
  }
}

export async function sendAutoReply(lead) {
  if (!resend || !lead.email) return { ok: false, skipped: true }
  try {
    const { subject, html } = autoReplyTemplate(lead)
    const { error } = await resend.emails.send({
      from: env.LEAD_NOTIFY_FROM,
      to: lead.email,
      subject,
      html,
    })
    if (error) throw new Error(error.message || 'resend error')
    return { ok: true }
  } catch (err) {
    logger.warn('auto-reply failed', { error: String(err) })
    return { ok: false, error: String(err) }
  }
}
