'use client'

import { useActionState } from 'react'
import { loginAction } from '../../actions/auth.js'

export default function LoginForm({ callbackUrl }) {
  const [state, action, pending] = useActionState(loginAction, {})
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl || '/admin'} />
      <div>
        <label className="mb-1 block text-sm font-medium text-navy-800" htmlFor="email">Email or username</label>
        <input
          id="email"
          name="email"
          type="text"
          required
          autoComplete="username"
          className="w-full rounded-lg border border-navy-800/15 px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-navy-800" htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full rounded-lg border border-navy-800/15 px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
        />
      </div>
      {state?.error && <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
      >
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
