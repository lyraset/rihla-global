'use client'

import { useRef, useState, useTransition } from 'react'
import { addLeadNote } from '../../actions/leads.js'

export default function LeadNoteForm({ id }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState('')
  const ref = useRef(null)

  function onSubmit(e) {
    e.preventDefault()
    const body = ref.current?.value || ''
    start(async () => {
      const res = await addLeadNote(id, body)
      if (res?.ok) {
        if (ref.current) ref.current.value = ''
        setError('')
      } else {
        setError(res?.error || 'Failed to add note')
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex flex-col gap-2">
      <textarea
        ref={ref}
        rows={3}
        placeholder="Add an internal note…"
        className="w-full rounded-lg border border-navy-800/15 px-3 py-2 text-sm text-navy-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
      />
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-navy-800 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-navy-900 disabled:opacity-70"
      >
        {pending ? 'Saving…' : 'Add note'}
      </button>
    </form>
  )
}
