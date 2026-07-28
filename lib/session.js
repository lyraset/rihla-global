import { auth } from './auth.js'

/** The current admin session, or null. */
export async function getAdminSession() {
  return auth()
}

/** Assert an authenticated admin; throws a 401-tagged error otherwise. */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user) {
    const err = new Error('Unauthorized')
    err.status = 401
    throw err
  }
  return session
}

/** Assert the admin holds one of `roles`; throws 401/403. */
export async function requireRole(roles) {
  const session = await requireAdmin()
  if (roles && !roles.includes(session.user.role)) {
    const err = new Error('Forbidden')
    err.status = 403
    throw err
  }
  return session
}
