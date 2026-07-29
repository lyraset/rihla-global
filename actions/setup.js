'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { countAdmins, createAdminUser } from '../services/admin-users.js'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .refine((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) || /^[a-z0-9._-]{3,}$/.test(v), 'Enter a valid email or username'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

/**
 * Creates the FIRST admin — only allowed when the database has zero admins.
 * This is what makes admin setup work in production without any env/CLI:
 * deploy → open /admin → create your admin account → done.
 */
export async function createFirstAdminAction(_prev, formData) {
  let existing = 0
  try {
    existing = await countAdmins()
  } catch {
    return { error: 'Cannot reach the database. Check MONGODB_URI.' }
  }
  if (existing > 0) {
    return { error: 'Setup is already complete. Please sign in.' }
  }

  const parsed = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Please check your details.' }
  }
  if (formData.get('password') !== formData.get('confirm')) {
    return { error: 'Passwords do not match.' }
  }

  try {
    await createAdminUser({ ...parsed.data, role: 'superadmin' })
  } catch (err) {
    return { error: err?.code === 11000 ? 'That email already exists.' : 'Could not create the admin account.' }
  }

  redirect('/admin/login?created=1')
}
