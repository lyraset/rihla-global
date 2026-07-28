import { listAudit } from '../../../../services/audit.js'

export const dynamic = 'force-dynamic'

const fmt = (d) => new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })

export default async function AuditPage() {
  let items = []
  try {
    items = (await listAudit({ limit: 100 })).items.map((d) => d.toJSON())
  } catch {
    /* DB not configured */
  }

  return (
    <div>
      <h1 className="mb-5 font-heading text-2xl font-bold text-navy-900">Audit log</h1>
      <div className="overflow-hidden rounded-2xl border border-navy-800/10 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-navy-800/10 bg-gray-50 text-xs uppercase tracking-wide text-navy-800/50">
              <tr>
                <th className="px-4 py-3 font-semibold">When</th>
                <th className="px-4 py-3 font-semibold">Who</th>
                <th className="px-4 py-3 font-semibold">Action</th>
                <th className="px-4 py-3 font-semibold">Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/5">
              {items.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-navy-800/40">No activity yet.</td></tr>
              )}
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-xs text-navy-800/50">{fmt(a.createdAt)}</td>
                  <td className="px-4 py-3 text-navy-800/70">{a.actor?.name || a.actor?.email || '—'}</td>
                  <td className="px-4 py-3"><span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-navy-800/70">{a.action}</span></td>
                  <td className="px-4 py-3 text-navy-800/70">{a.model || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
