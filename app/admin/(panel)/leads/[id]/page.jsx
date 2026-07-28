import Link from 'next/link'
import { notFound } from 'next/navigation'
import { after } from 'next/server'
import { ArrowLeft, MessageCircle, Mail } from 'lucide-react'
import { getLeadById, updateLeadById } from '../../../../../services/leads.js'
import { buildWaLink } from '../../../../../lib/whatsapp.js'
import LeadStatusControl from '../../../../../components/admin/LeadStatusControl.jsx'
import LeadNoteForm from '../../../../../components/admin/LeadNoteForm.jsx'
import DeleteLeadButton from '../../../../../components/admin/DeleteLeadButton.jsx'

export const dynamic = 'force-dynamic'

const fmtDate = (d) => new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex gap-3 py-1.5 text-sm">
      <span className="w-28 shrink-0 text-navy-800/50">{label}</span>
      <span className="font-medium text-navy-900">{value}</span>
    </div>
  )
}

export default async function LeadDetailPage({ params }) {
  const { id } = await params
  const doc = await getLeadById(id).catch(() => null)
  if (!doc) notFound()
  const lead = doc.toJSON()

  // Mark read after the response (no blocking, no render-time mutation).
  if (!lead.isRead) after(() => updateLeadById(id, { isRead: true }))

  const waReply = lead.phone
    ? buildWaLink({
        number: lead.phone,
        text: `Hi ${lead.name || 'there'}, thank you for contacting Rihla Global regarding your ${lead.visaType || 'visa'} enquiry.`,
      })
    : null

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/admin/leads" className="inline-flex items-center gap-1.5 text-sm font-medium text-navy-800/60 hover:text-navy-900">
        <ArrowLeft size={15} /> Back to leads
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-2xl font-bold text-navy-900">{lead.name || lead.email}</h1>
          <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold uppercase text-navy-800/60">{lead.type}</span>
        </div>
        <div className="flex items-center gap-2">
          <LeadStatusControl id={lead.id} status={lead.status} />
          <DeleteLeadButton id={lead.id} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {waReply && (
          <a href={waReply} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
            <MessageCircle size={15} /> Reply on WhatsApp
          </a>
        )}
        <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-2 rounded-lg border border-navy-800/15 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-gray-50">
          <Mail size={15} /> Reply by email
        </a>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-navy-800/10 bg-white p-5">
          <h2 className="mb-2 font-heading font-semibold text-navy-900">Details</h2>
          <Row label="Email" value={lead.email} />
          <Row label="Phone" value={lead.phone} />
          <Row label="Visa type" value={lead.visaType} />
          <Row label="Message" value={lead.message} />
          <Row label="Received" value={fmtDate(lead.createdAt)} />
          <Row label="Page" value={lead.source?.page} />
          <Row label="Referrer" value={lead.source?.referrer} />
          <Row label="UTM source" value={lead.source?.utm?.source} />
          <Row label="Country" value={lead.meta?.country} />
          {lead.attachments?.length > 0 && (
            <div className="mt-3">
              <span className="text-sm text-navy-800/50">Attachments</span>
              <ul className="mt-1 space-y-1">
                {lead.attachments.map((a) => (
                  <li key={a.publicId}><a href={a.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-green-600 hover:underline">{a.originalName || a.publicId}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-navy-800/10 bg-white p-5">
          <h2 className="font-heading font-semibold text-navy-900">Internal notes</h2>
          <div className="mt-3 space-y-3">
            {(!lead.notes || lead.notes.length === 0) && <p className="text-sm text-navy-800/50">No notes yet.</p>}
            {lead.notes?.map((n, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-3 text-sm">
                <p className="text-navy-900">{n.body}</p>
                <p className="mt-1 text-xs text-navy-800/40">{n.createdAt ? fmtDate(n.createdAt) : ''}</p>
              </div>
            ))}
          </div>
          <LeadNoteForm id={lead.id} />
        </div>
      </div>
    </div>
  )
}
