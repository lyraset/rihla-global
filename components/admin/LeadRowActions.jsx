'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteLead } from '../../actions/leads.js'

export default function LeadRowActions({ id }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function onDelete() {
    if (!confirm('Delete this response? This cannot be undone.')) return
    start(async () => {
      await deleteLead(id)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Link href={`/admin/leads/${id}`} aria-label="View" className="rounded p-1.5 text-navy-800/60 hover:bg-gray-100 hover:text-navy-900">
        <Eye size={15} />
      </Link>
      <button type="button" onClick={onDelete} disabled={pending} aria-label="Delete" className="rounded p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50">
        <Trash2 size={15} />
      </button>
    </div>
  )
}
