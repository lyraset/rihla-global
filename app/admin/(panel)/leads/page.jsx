import Link from 'next/link'
import { listLeads } from '../../../../services/leads.js'
import LeadFilters from '../../../../components/admin/LeadFilters.jsx'
import LeadRowActions from '../../../../components/admin/LeadRowActions.jsx'

export const dynamic = 'force-dynamic'

const fmtDate = (d) => new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-gray-200 text-gray-600',
  spam: 'bg-red-100 text-red-700',
}

export default async function LeadsPage({ searchParams }) {
  const sp = (await searchParams) || {}
  const page = Math.max(1, Number(sp.page) || 1)
  const limit = 25

  let data = { items: [], total: 0, page, limit }
  let dbError = false
  try {
    data = await listLeads({ type: sp.type, status: sp.status, q: sp.q, page, limit })
  } catch {
    dbError = true
  }

  const pages = Math.max(1, Math.ceil(data.total / limit))
  const qs = (p) => {
    const params = new URLSearchParams()
    if (sp.type) params.set('type', sp.type)
    if (sp.status) params.set('status', sp.status)
    if (sp.q) params.set('q', sp.q)
    params.set('page', String(p))
    return `/admin/leads?${params.toString()}`
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-2xl font-bold text-navy-900">Leads {data.total ? <span className="text-navy-800/40">({data.total})</span> : null}</h1>
        <LeadFilters />
      </div>

      {dbError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          Database not connected — set <code>MONGODB_URI</code> in <code>.env.local</code>.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-navy-800/10 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-navy-800/10 bg-gray-50 text-xs uppercase tracking-wide text-navy-800/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Visa</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Received</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/5">
                {data.items.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-navy-800/40">No leads found.</td></tr>
                )}
                {data.items.map((l) => (
                  <tr key={l.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-2">
                        {!l.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-green-500" />}
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-navy-800/60">{l.type}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900"><Link href={`/admin/leads/${l.id}`}>{l.name || '—'}</Link></td>
                    <td className="px-4 py-3 text-navy-800/70">{l.email}</td>
                    <td className="px-4 py-3 text-navy-800/70">{l.visaType || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[l.status] || 'bg-gray-100 text-gray-600'}`}>
                        {String(l.status).replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-navy-800/50">{fmtDate(l.createdAt)}</td>
                    <td className="px-4 py-3"><LeadRowActions id={l.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-navy-800/50">Page {data.page} of {pages}</span>
          <div className="flex gap-2">
            {data.page > 1 && <Link href={qs(data.page - 1)} className="rounded-lg border border-navy-800/15 px-3 py-1.5 font-medium text-navy-800 hover:bg-gray-50">Previous</Link>}
            {data.page < pages && <Link href={qs(data.page + 1)} className="rounded-lg border border-navy-800/15 px-3 py-1.5 font-medium text-navy-800 hover:bg-gray-50">Next</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
