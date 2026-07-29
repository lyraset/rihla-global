import NextAuth from 'next-auth'
import { authConfig } from './lib/auth.config.js'

// Edge-safe instance (no Node providers) — only reads/decodes the session JWT.
const { auth } = NextAuth(authConfig)

/**
 * Resolve the true public origin of the request. Behind a proxy (Vercel), the
 * real host/scheme arrive in x-forwarded-* headers, so we prefer those over
 * req.nextUrl.origin (which can fall back to localhost). This keeps admin
 * redirects on the deployed domain regardless of any AUTH_URL/env misconfig.
 */
function publicOrigin(req) {
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  if (!host) return req.nextUrl.origin
  const proto = req.headers.get('x-forwarded-proto') || (host.startsWith('localhost') ? 'http' : 'https')
  return `${proto}://${host}`
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const origin = publicOrigin(req)
  // Public admin routes (no session required): login + first-run setup.
  const isPublicAdmin = pathname === '/admin/login' || pathname === '/admin/setup'
  const loggedIn = Boolean(req.auth)

  // First gate only — real authorization is re-checked in the admin layout,
  // server actions and admin API routes (§10.1).
  if (pathname.startsWith('/admin') && !isPublicAdmin && !loggedIn) {
    const url = new URL('/admin/login', origin)
    url.searchParams.set('callbackUrl', pathname)
    return Response.redirect(url)
  }
  if (isPublicAdmin && loggedIn) {
    return Response.redirect(new URL('/admin', origin))
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
