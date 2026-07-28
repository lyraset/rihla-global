'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { deleteEntityAction, reorderEntityAction } from '../../actions/cms.js'

export default function EntityListActions({ collectionKey, id, editHref }) {
  const [pending, start] = useTransition()

  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" disabled={pending} aria-label="Move up" onClick={() => start(() => reorderEntityAction(collectionKey, id, 'up'))} className="rounded p-1.5 text-navy-800/50 hover:bg-gray-100 hover:text-navy-900 disabled:opacity-50">
        <ChevronUp size={16} />
      </button>
      <button type="button" disabled={pending} aria-label="Move down" onClick={() => start(() => reorderEntityAction(collectionKey, id, 'down'))} className="rounded p-1.5 text-navy-800/50 hover:bg-gray-100 hover:text-navy-900 disabled:opacity-50">
        <ChevronDown size={16} />
      </button>
      <Link href={editHref} aria-label="Edit" className="rounded p-1.5 text-navy-800/60 hover:bg-gray-100 hover:text-navy-900">
        <Pencil size={15} />
      </Link>
      <button type="button" disabled={pending} aria-label="Delete" onClick={() => { if (confirm('Delete this item? This cannot be undone.')) start(() => deleteEntityAction(collectionKey, id)) }} className="rounded p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50">
        <Trash2 size={15} />
      </button>
    </div>
  )
}
