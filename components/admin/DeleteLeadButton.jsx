'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { deleteLead } from '../../actions/leads.js'

export default function DeleteLeadButton({ id }) {
  const [pending, start] = useTransition()
  const router = useRouter()

  function onClick() {
    if (!confirm('Delete this lead? This cannot be undone.')) return
    start(async () => {
      await deleteLead(id)
      router.push('/admin/leads')
    })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-70"
    >
      <Trash2 size={15} /> {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
