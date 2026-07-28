import Link from 'next/link'
import { CMS_NAV } from '../../../../lib/cms/collections.js'

export const dynamic = 'force-dynamic'

export default function ContentIndexPage() {
  return (
    <div>
      <h1 className="mb-5 font-heading text-2xl font-bold text-navy-900">Content</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {CMS_NAV.map(({ key, label }) => (
          <Link
            key={key}
            href={`/admin/content/${key}`}
            className="rounded-2xl border border-navy-800/10 bg-white p-5 transition hover:border-green-600/30 hover:shadow-md"
          >
            <div className="font-heading font-semibold text-navy-900">{label}</div>
            <div className="mt-1 text-sm text-navy-800/50">Manage {label.toLowerCase()}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
