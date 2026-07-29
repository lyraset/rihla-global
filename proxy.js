import NextAuth from 'next-auth'
import { authConfig } from './lib/auth.config.js'

// Edge-safe instance (no Node providers) — only reads/decodes the session JWT.
const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname, origin } = req.nextUrl
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
