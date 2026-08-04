'use server'

import { AuthError } from 'next-auth'
import { signIn, signOut } from '../lib/auth.js'

export async function loginAction(_prevState, formData) {
  const email = formData.get('email')
  const password = formData.get('password')
  const callbackUrl = formData.get('callbackUrl') || '/admin'
  try {
    await signIn('credentials', { email, password, redirectTo: callbackUrl })
  } catch (err) {
    if (err instanceof AuthError) {
      // Only CredentialsSignin means the email/password were actually wrong.
      // Every other AuthError (CallbackRouteError from an unreachable DB,
      // MissingSecret from an unset AUTH_SECRET, …) is a server-side fault —
      // reporting those as "invalid password" sends operators hunting for a
      // credential problem that does not exist.
      if (err.type === 'CredentialsSignin') {
        return { error: 'Invalid email or password.' }
      }
      console.error('[auth] sign-in failed:', err.type, '—', err.cause?.err?.message || err.message)
      return {
        error:
          'Sign-in is unavailable — the server could not complete the request. ' +
          'This is a configuration problem, not a wrong password. Check /api/health.',
      }
    }
    throw err // NEXT_REDIRECT (success) must propagate
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
