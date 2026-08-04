import { headers } from 'next/headers'
import { siteOrigin, CANONICAL_ORIGIN } from '../lib/sitemap-data.js'

export const dynamic = 'force-dynamic'

/**
 * robots.txt, served per host.
 *
 * The same deployment answers on the canonical domain and on *.vercel.app. If
 * both invited crawling, the whole site would exist twice in the index and the
 * preview host could outrank the real one. Canonical tags already point home,
 * but a blanket disallow on non-canonical hosts is the stronger signal — so the
 * rules below are chosen from the Host header, not baked in at build time.
 *
 * @returns {import('next').MetadataRoute.Robots}
 */
export default async function robots() {
  const h = await headers()
  const host = (h.get('x-forwarded-host') || h.get('host') || '').toLowerCase()
  const canonicalHost = new URL(CANONICAL_ORIGIN).host.toLowerCase()

  // Bare apex is fine — it 308s to the canonical www host, so crawlers that
  // fetch its robots.txt still end up on the real one.
  const isCanonical =
    host === canonicalHost || host === canonicalHost.replace(/^www\./, '') || host === ''

  if (!isCanonical) {
    return { rules: [{ userAgent: '*', disallow: '/' }] }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /admin is the CMS; /api is JSON with no crawlable content; /success
        // stays open because it is a real marketing page, not a form receipt.
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: `${siteOrigin()}/sitemap.xml`,
    host: siteOrigin(),
  }
}
