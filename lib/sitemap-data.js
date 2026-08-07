import { env } from './env.js'
import { getCountries, getPages } from '../services/content.js'
import { getRouteSeoMap } from '../services/seo.js'
import { normalisePath } from './cms/routes.js'
import { countrySlug } from './cms/country-url.js'

/**
 * Shared source of truth for /sitemap.xml.
 *
 * Kept out of the route handler so the entry list can be unit-tested and reused
 * (robots.txt, an HTML sitemap page) without duplicating the URL rules.
 */

/**
 * Canonical production origin. Every emitted <loc> and every <link rel=canonical>
 * is absolute against this, so it MUST be the host that answers 200 directly.
 *
 * www is primary: the apex serves a path-preserving 308 to www. Naming the apex
 * here would point every canonical at a redirect — which Google treats as a weak
 * signal and audit tools report as an error — and would make each sitemap URL
 * cost a redirect hop. If you ever make the apex primary in the Vercel domain
 * settings, drop the `www.` here in the same change.
 */
export const CANONICAL_ORIGIN = 'https://www.rihla-global.com'

/** Deploy-preview / platform hosts that must never appear in a public sitemap. */
const NON_CANONICAL_HOSTS = /^https?:\/\/[^/]*\.vercel\.app(:|\/|$)/

/**
 * Slugs owned by real files under app/. A CMS Page using one of these never
 * renders through app/[slug]/page.jsx — the static route wins — so emitting it
 * from the Page collection would duplicate a URL.
 */
const RESERVED_SLUGS = new Set(['about', 'contact', 'countries', 'admin', 'api'])

/** Every public static route under app/. */
const STATIC_ROUTES = [
  { path: '', changefreq: 'weekly', priority: '1.0' },
  { path: '/countries', changefreq: 'weekly', priority: '0.9' },
  { path: '/contact', changefreq: 'monthly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.7' },
]

/**
 * Mirrors scripts/seed.js. Used only when the DB read fails, so a cold build or
 * a Mongo outage still produces a complete sitemap instead of five static URLs.
 * Keep in sync with COUNTRIES/PAGES in the seed script.
 */
const FALLBACK_COUNTRIES = [
  { code: 'TR', name: 'Turkey' }, { code: 'GB', name: 'UK' }, { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' }, { code: 'US', name: 'USA' }, { code: 'IT', name: 'Italy' },
  { code: 'PH', name: 'Philippines' }, { code: 'TH', name: 'Thailand' }, { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' }, { code: 'LK', name: 'Sri Lanka' }, { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BN', name: 'Brunei' },
]

const FALLBACK_PAGES = [
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms & Conditions' },
]

/**
 * Origin for <loc> values.
 *
 * NEXT_PUBLIC_SITE_URL wins only when it is a real public origin. Two values
 * would otherwise poison the index: a localhost default left over from
 * .env.local, and the *.vercel.app deployment host, which duplicates the whole
 * site under a second domain.
 */
export function siteOrigin() {
  const configured = (env.NEXT_PUBLIC_SITE_URL || '').replace(/\/+$/, '')
  if (!configured) return CANONICAL_ORIGIN
  if (/^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:|$)/.test(configured)) {
    // Keep localhost in dev so local links stay clickable; never publish it.
    return env.NODE_ENV === 'production' ? CANONICAL_ORIGIN : configured
  }
  if (NON_CANONICAL_HOSTS.test(configured)) return CANONICAL_ORIGIN
  return configured
}

async function safeList(fn, fallback) {
  try {
    const rows = await fn()
    return Array.isArray(rows) && rows.length > 0 ? rows : fallback
  } catch {
    return fallback
  }
}

/**
 * @returns {Promise<Array<{loc: string, lastmod: string, changefreq: string, priority: string, title: string, group: string}>>}
 */
export async function getSitemapEntries() {
  const origin = siteOrigin()
  const now = new Date().toISOString()
  const iso = (v) => (v ? new Date(v).toISOString() : now)

  const [countries, pages] = await Promise.all([
    safeList(getCountries, FALLBACK_COUNTRIES),
    safeList(getPages, FALLBACK_PAGES),
  ])

  const staticEntries = STATIC_ROUTES.map((r) => ({
    // Root is '' in STATIC_ROUTES; emit it with a trailing slash so the sitemap
    // URL and the page's own canonical tag are byte-identical.
    loc: `${origin}${r.path || '/'}`,
    lastmod: now,
    changefreq: r.changefreq,
    priority: r.priority,
    title: r.path === '' ? 'Home' : r.path.slice(1).replace(/^./, (c) => c.toUpperCase()),
    group: 'Main pages',
  }))

  const countryEntries = countries
    // Page-scoped copies are display-only; routes come from the shared set.
    .filter((c) => c.code && !c.page)
    .map((c) => ({
      loc: `${origin}/countries/${countrySlug(c)}`,
      lastmod: iso(c.updatedAt),
      changefreq: 'monthly',
      priority: '0.8',
      title: `${c.name} visas`,
      group: 'Destinations',
    }))

  const pageEntries = pages
    .filter((p) => p.slug && !RESERVED_SLUGS.has(p.slug))
    .map((p) => ({
      loc: `${origin}/${p.slug}`,
      lastmod: iso(p.updatedAt),
      changefreq: 'yearly',
      priority: '0.3',
      title: p.title || p.slug,
      group: 'Information',
    }))

  // A page marked noindex in Admin → SEO must not be advertised in the sitemap;
  // listing a URL while telling crawlers to ignore it is a contradictory signal.
  const seoMap = await getRouteSeoMap()
  const isIndexable = (loc) => {
    const path = normalisePath(loc.slice(origin.length))
    return !seoMap[path]?.noindex
  }

  return [...staticEntries, ...countryEntries, ...pageEntries].filter((e) => isIndexable(e.loc))
}
