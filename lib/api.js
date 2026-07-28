import { NextResponse } from 'next/server'

/** Standard success envelope (§8). */
export function ok(data = {}, meta = {}, status = 200) {
  return NextResponse.json({ ok: true, data, meta }, { status })
}

/** Standard error envelope (§8). */
export function fail(code, message, { fields, status = 400 } = {}) {
  return NextResponse.json(
    { ok: false, error: { code, message, ...(fields ? { fields } : {}) } },
    { status },
  )
}

/** Best-effort client IP from proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(req) {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || '0.0.0.0'
}
