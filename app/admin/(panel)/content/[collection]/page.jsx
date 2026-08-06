import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Plus } from 'lucide-react'
import { getCollection } from '../../../../../lib/cms/collections.js'
import { listEntities, ensureDefaultRows } from '../../../../../services/cms.js'
import EntityListActions from '../../../../../components/admin/EntityListActions.jsx'

export const dynamic = 'force-dynamic'

function fieldLabel(col, name) {
  const f = col.fields.find((x) => x.name === name)
  return f ? f.label : name.charAt(0).toUpperCase() + name.slice(1)
}

function Cell({ col, item, name }) {
  const f = col.fields.find((x) => x.name === name)
  const v = item[name]
  if (f?.type === 'boolean') {
    return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${v ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{v ? 'Yes' : 'No'}</span>
  }
  if (v == null || v === '') return <span className="text-navy-800/30">—</span>
  const text = String(v)
  return <span className={name === col.titleField ? 'font-medium text-navy-900' : 'text-navy-800/70'}>{text.length > 60 ? text.slice(0, 60) + '…' : text}</span>
}

export default async function CollectionListPage({ params }) {
  const { collection } = await params
  const col = getCollection(collection)
  if (!col) notFound()

  let items = []
  let dbError = false
  try {
    // Collections that mirror fixed render sites seed themselves here, so the
    // first visit shows the live copy as editable rows rather than an empty list.
    if (col.ensureDefaults) await ensureDefaultRows(collection, col.model, col.ensureDefaults)
    items = (await listEntities(col.model, col.defaultSort)).map((d) => d.toJSON())
  } catch {
    dbError = true
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-navy-900">{col.labelPlural}</h1>
        <Link href={`/admin/content/${collection}/new`} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
          <Plus size={16} /> New {col.label}
        </Link>
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
                  {col.columns.map((c) => (
                    <th key={c} className="px-4 py-3 font-semibold">{fieldLabel(col, c)}</th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/5">
                {items.length === 0 && (
                  <tr><td colSpan={col.columns.length + 1} className="px-4 py-10 text-center text-navy-800/40">No {col.labelPlural.toLowerCase()} yet.</td></tr>
                )}
                {items.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    {col.columns.map((c) => (
                      <td key={c} className="px-4 py-3"><Cell col={col} item={it} name={c} /></td>
                    ))}
                    <td className="px-4 py-3">
                      <EntityListActions collectionKey={collection} id={it.id} editHref={`/admin/content/${collection}/${it.id}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
