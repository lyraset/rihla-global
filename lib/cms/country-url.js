import slugify from 'slugify'

/**
 * The URL segment for a country page.
 *
 * `code` cannot serve as the URL. It is an ISO 3166-1 alpha-2 code and the flag
 * service accepts nothing else — flagcdn has gb.png and tr.png, but no uk.png or
 * turkey.png. So the code stays pinned to the flag, and the address bar gets a
 * readable segment derived from the country's name instead:
 *
 *   UK      code GB  ->  /countries/uk
 *   Turkey  code TR  ->  /countries/turkey
 *
 * An explicit `slug` on the record overrides the derived value, so any country
 * can be given a custom URL from the admin without touching its ISO code.
 */
export function countrySlug(country) {
  if (!country) return ''
  const explicit = String(country.slug || '').trim()
  if (explicit) return slugify(explicit, { lower: true, strict: true })
  const name = String(country.name || '').trim()
  if (name) return slugify(name, { lower: true, strict: true })
  return String(country.code || '').toLowerCase()
}

/**
 * Find a country from a URL segment.
 *
 * Accepts the ISO code too, so links already published as /countries/gb keep
 * resolving; the route redirects those to the slug form.
 */
export function findCountryBySegment(countries, segment) {
  const want = String(segment || '').toLowerCase()
  const list = (countries || []).filter((c) => !c.page) // canonical rows own the URL
  return (
    list.find((c) => countrySlug(c) === want) ||
    list.find((c) => String(c.code || '').toLowerCase() === want) ||
    null
  )
}
