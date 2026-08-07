import { getCountries, getPages } from '../../services/content.js'
import { countrySlug } from './country-url.js'

/**
 * The catalogue of public URLs the SEO editor manages.
 *
 * `defaultTitle` / `defaultDescription` mirror what each route renders when no
 * override exists, so the admin screen can show the effective value (greyed)
 * instead of an empty box. Keep these in step with the fallbacks passed to
 * buildMetadata() in the corresponding page component.
 */

export const SITE_NAME = 'Rihla Global'

/** Routes backed by a real file under app/ — no CMS document behind them. */
export const STATIC_ROUTES = [
  {
    path: '/',
    label: 'Home',
    defaultTitle: 'Rihla Global | Visa Consultant',
    defaultDescription:
      'Rihla Global Visa Consultant — expert guidance for student, work, tourist, business and PR visas.',
  },
  { path: '/countries', label: 'Countries', defaultTitle: `Countries We Cover — ${SITE_NAME}` },
  { path: '/contact', label: 'Contact', defaultTitle: `Contact Us — ${SITE_NAME}` },
  { path: '/about', label: 'About', defaultTitle: `About Us — ${SITE_NAME}` },
]

/** Normalise anything user- or DB-supplied into a comparable key. */
export function normalisePath(path) {
  const p = String(path || '').trim()
  if (!p || p === '/') return '/'
  const withSlash = p.startsWith('/') ? p : `/${p}`
  return withSlash.replace(/\/+$/, '') || '/'
}

async function safe(fn, fallback) {
  try {
    return (await fn()) || fallback
  } catch {
    return fallback
  }
}

/**
 * Every manageable route, grouped for display. Dynamic groups are read live so
 * a newly added country or page appears in the SEO editor without a code change.
 */
export async function getManagedRoutes() {
  const [countries, pages] = await Promise.all([safe(getCountries, []), safe(getPages, [])])

  return [
    { group: 'Main pages', routes: STATIC_ROUTES },
    {
      group: 'Country pages',
      routes: countries
        // Only canonical countries own a URL — see lib/sitemap-data.js.
        .filter((c) => c.code && !c.page)
        .map((c) => ({
          path: `/countries/${countrySlug(c)}`,
          label: c.name,
          defaultTitle: `${c.name} Visas — ${SITE_NAME}`,
        })),
    },
    {
      group: 'Content pages',
      routes: pages.map((p) => ({
        path: `/${p.slug}`,
        label: p.title,
        defaultTitle: p.seo?.metaTitle || `${p.title} — ${SITE_NAME}`,
        defaultDescription: p.seo?.metaDescription,
      })),
    },
  ].filter((g) => g.routes.length > 0)
}

/** Flat list of every managed path — used to validate submitted rows. */
export async function getManagedPaths() {
  const groups = await getManagedRoutes()
  return groups.flatMap((g) => g.routes.map((r) => r.path))
}
