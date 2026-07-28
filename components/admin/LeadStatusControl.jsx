'use client'

import { useState, useTransition } from 'react'
import { setLeadStatus } from '../../actions/leads.js'

const STATUSES = ['new', 'contacted', 'in_progress', 'won', 'lost', 'spam']

export default function LeadStatusControl({ id, status }) {
  const [current, setCurrent] = useState(status)
  const [pending, start] = useTransition()

  return (
    <select
      value={current}
      disabled={pending}
      onChange={(e) => {
        const value = e.target.value
        setCurrent(value)
        start(() => setLeadStatus(id, value))
      }}
      className="rounded-lg border border-navy-800/15 bg-white px-3 py-1.5 text-sm font-medium text-navy-900 outline-none focus:border-green-500 disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.replace('_', ' ')}</option>
      ))}
    </select>
  )
}
