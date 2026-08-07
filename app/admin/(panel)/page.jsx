import Link from 'next/link'
import { Inbox, Mail, Clock, TrendingUp } from 'lucide-react'
import { leadCounts, listLeads } from '../../../services/leads.js'
import { formatDateTime } from '../../../lib/format.js'

export const dynamic = 'force-dynamic'

const fmtDate = formatDateTime

export default async function DashboardPage() {
  let counts = null
  let recent = []
  try {
    counts = await leadCounts()
    recent = (await listLeads({ limit: 8 })).items
  } catch {
    /* DB not configured */
  }

  if (!counts) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
        <p className="font-semibold">Database not connected.</p>
        <p className="mt-1">Set <code>MONGODB_URI</code> in <code>.env.local</code>, then run <code>npm run seed</code> to load content and create your admin user.</p>
      </div>
    )
  }

  const cards = [
    { label: 'Total leads', value: counts.total, icon: Inbox },
    { label: 'Unread', value: counts.unread, icon: Mail },
    { label: 'Today', value: counts.today, icon: Clock },
    { label: 'This week', value: counts.week, icon: TrendingUp },
  ]

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy-900">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl border border-navy-800/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-navy-800/60">{c.label}</span>
              <c.icon size={18} className="text-green-600" />
            </div>
            <div className="mt-2 font-heading text-3xl font-bold text-navy-900">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-navy-800/10 bg-white p-5">
          <h2 className="font-heading font-semibold text-navy-900">By type</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {counts.byType.length === 0 && <li className="text-navy-800/50">No data yet.</li>}
            {counts.byType.map((t) => (
              <li key={t._id} className="flex justify-between">
                <span className="capitalize text-navy-800/70">{t._id}</span>
                <span className="font-semibold text-navy-900">{t.n}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-navy-800/10 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-heading font-semibold text-navy-900">Recent leads</h2>
            <Link href="/admin/leads" className="text-sm font-medium text-green-600 hover:text-green-700">View all →</Link>
          </div>
          <div className="mt-3 divide-y divide-navy-800/10">
            {recent.length === 0 && <p className="py-4 text-sm text-navy-800/50">No leads yet.</p>}
            {recent.map((l) => (
              <Link key={l.id} href={`/admin/leads/${l.id}`} className="flex items-center justify-between py-2.5 text-sm hover:bg-gray-50">
                <span className="flex items-center gap-2">
                  {!l.isRead && <span className="h-2 w-2 rounded-full bg-green-500" />}
                  <span className="font-medium text-navy-900">{l.name || l.email}</span>
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-navy-800/60">{l.type}</span>
                </span>
                <span className="text-xs text-navy-800/50">{fmtDate(l.createdAt)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
