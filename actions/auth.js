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
      return { error: 'Invalid email or password.' }
    }
    throw err // NEXT_REDIRECT (success) must propagate
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: '/admin/login' })
}
