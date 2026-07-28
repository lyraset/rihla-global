'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const TYPES = ['', 'consultation', 'contact', 'newsletter', 'custom']
const STATUSES = ['', 'new', 'contacted', 'in_progress', 'won', 'lost', 'spam']
const selectClass =
  'rounded-lg border border-navy-800/15 bg-white px-3 py-2 text-sm text-navy-900 outline-none focus:border-green-500'

export default function LeadFilters() {
  const router = useRouter()
  const sp = useSearchParams()

  function update(key, value) {
    const params = new URLSearchParams(sp)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    router.push(`/admin/leads?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={sp.get('type') || ''} onChange={(e) => update('type', e.target.value)} className={selectClass}>
        {TYPES.map((t) => (
          <option key={t} value={t}>{t ? t : 'All types'}</option>
        ))}
      </select>
      <select value={sp.get('status') || ''} onChange={(e) => update('status', e.target.value)} className={selectClass}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s ? s.replace('_', ' ') : 'All statuses'}</option>
        ))}
      </select>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          update('q', new FormData(e.currentTarget).get('q'))
        }}
        className="flex gap-2"
      >
        <input name="q" defaultValue={sp.get('q') || ''} placeholder="Search name / email…" className={`${selectClass} w-52`} />
        <button type="submit" className="rounded-lg bg-navy-800 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-900">
          Search
        </button>
      </form>
    </div>
  )
}
