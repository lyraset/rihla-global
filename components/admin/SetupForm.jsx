'use client'

import { useActionState } from 'react'
import { createFirstAdminAction } from '../../actions/setup.js'

const inputClass =
  'w-full rounded-lg border border-navy-800/15 px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20'

export default function SetupForm() {
  const [state, action, pending] = useActionState(createFirstAdminAction, {})
  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-navy-800">Your name</label>
        <input id="name" name="name" required autoComplete="name" className={inputClass} />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-800">Email or username</label>
        <input id="email" name="email" required autoComplete="username" className={inputClass} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy-800">Password</label>
        <input id="password" name="password" type="password" required autoComplete="new-password" className={inputClass} />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-navy-800">Confirm password</label>
        <input id="confirm" name="confirm" type="password" required autoComplete="new-password" className={inputClass} />
      </div>
      {state?.error && <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
      >
        {pending ? 'Creating…' : 'Create admin account'}
      </button>
    </form>
  )
}
