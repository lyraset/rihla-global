/**
 * JSON-LD builders for schema.org structured data.
 *
 * Pure functions over CMS data — no DB or Next imports — so each block can be
 * exercised directly. Everything is assembled into one `@graph` per page with
 * stable `@id`s, which lets nodes cross-reference each other (a page points at
 * its publisher, a service at its provider) instead of repeating the org inline.
 *
 * Rule of thumb applied throughout: only describe what the page actually
 * renders. Marking up content a visitor cannot see is a structured-data policy
 * violation, so FAQ/Service blocks are emitted per page type, not globally.
 */

/** Drop empty strings, nulls and empty arrays so no dead keys reach the output. */
function clean(obj) {
  if (Array.isArray(obj)) {
    const arr = obj.map(clean).filter((v) => v !== undefined)
    return arr.length ? arr : undefined
  }
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      const c = clean(v)
      if (c !== undefined) out[k] = c
    }
    return Object.keys(out).length ? out : undefined
  }
  if (typeof obj === 'string') return obj.trim() === '' ? undefined : obj
  return obj ?? undefined
}

const abs = (origin, path = '/') => `${origin}${path === '/' ? '/' : path}`

export const ID = {
  org: (origin) => `${origin}/#organization`,
  website: (origin) => `${origin}/#website`,
  page: (origin, path) => `${abs(origin, path)}#webpage`,
}

const DAY_NAMES = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}
const dayName = (d) => {
  const k = String(d || '').slice(0, 3).toLowerCase()
  return DAY_NAMES[k] || (d ? String(d) : undefined)
}

/**
 * The business itself. ProfessionalService is a LocalBusiness subtype — the
 * right fit for a consultancy with a walk-in office, and it keeps the address,
 * geo and opening-hours properties that a bare Organization would not carry.
 */
/**
 * Shipped in public/. Used when Settings has no uploaded logo, so Organization
 * still carries the image Google needs for a rich result rather than omitting it.
 */
const PACKAGED_LOGO = '/Rihla%20logo.png'

export function organizationSchema(settings = {}, origin) {
  const c = settings.contact || {}
  const s = settings.socials || {}
  const sameAs = [s.facebook, s.instagram, s.linkedin, s.youtube, s.tiktok, s.x].filter(Boolean)
  const logo = settings.logo?.url || `${origin}${PACKAGED_LOGO}`

  const hours = (settings.hours || [])
    .filter((h) => h && !h.closed && h.opens && h.closes)
    .map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: dayName(h.day),
      opens: h.opens,
      closes: h.closes,
    }))

  return clean({
    '@type': 'ProfessionalService',
    '@id': ID.org(origin),
    name: settings.brandName || 'Rihla Global',
    description: settings.tagline,
    url: `${origin}/`,
    logo,
    image: logo,
    email: c.email,
    telephone: c.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: [c.addressLine1, c.addressLine2].filter(Boolean).join(', '),
      addressLocality: c.city,
      addressRegion: c.region,
      postalCode: c.postalCode,
      addressCountry: c.country,
    },
    geo:
      c.geo?.lat && c.geo?.lng
        ? { '@type': 'GeoCoordinates', latitude: c.geo.lat, longitude: c.geo.lng }
        : undefined,
    openingHoursSpecification: hours.length ? hours : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    areaServed: { '@type': 'Country', name: 'Pakistan' },
  })
}

export function websiteSchema(settings = {}, origin) {
  return clean({
    '@type': 'WebSite',
    '@id': ID.website(origin),
    url: `${origin}/`,
    name: settings.brandName || 'Rihla Global',
    publisher: { '@id': ID.org(origin) },
    inLanguage: 'en',
  })
}

/** The page node every other block on the page hangs off. */
export function webPageSchema({ origin, path, title, description, type = 'WebPage' }) {
  return clean({
    '@type': type,
    '@id': ID.page(origin, path),
    url: abs(origin, path),
    name: title,
    description,
    isPartOf: { '@id': ID.website(origin) },
    about: { '@id': ID.org(origin) },
    inLanguage: 'en',
  })
}

/** `trail` is [{ name, path }] ordered root → current. */
export function breadcrumbSchema(trail = [], origin) {
  if (trail.length < 2) return undefined
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: abs(origin, t.path),
    })),
  }
}

/** Only valid where the questions are visibly rendered on the page. */
export function faqSchema(faqs = []) {
  const items = faqs.filter((f) => f?.question && f?.answer)
  if (!items.length) return undefined
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        // Answers are stored as HTML; schema.org accepts limited markup here.
        text: String(f.answer),
      },
    })),
  }
}

export function serviceSchema(service, origin) {
  return clean({
    '@type': 'Service',
    name: service.title,
    description: service.shortDescription || service.description,
    serviceType: service.title,
    provider: { '@id': ID.org(origin) },
    offers:
      service.priceFrom != null && service.priceFrom !== ''
        ? {
            '@type': 'Offer',
            price: service.priceFrom,
            priceCurrency: service.currency || 'PKR',
          }
        : undefined,
  })
}

/** An ItemList wrapper so a services page reads as a list, not N loose nodes. */
export function serviceListSchema(services = [], origin) {
  const items = services.filter((s) => s?.title)
  if (!items.length) return undefined
  return {
    '@type': 'ItemList',
    itemListElement: items.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: serviceSchema(s, origin),
    })),
  }
}

/** A country destination page: the visa service offered for that country. */
export function countryServiceSchema(country, origin) {
  if (!country?.name) return undefined
  return clean({
    '@type': 'Service',
    name: `${country.name} Visa Services`,
    description: country.blurb,
    serviceType: 'Visa consultancy',
    provider: { '@id': ID.org(origin) },
    areaServed: { '@type': 'Country', name: country.name },
  })
}

/**
 * Assembles the final `@graph` for a page, dropping anything undefined.
 */
export function buildGraph(nodes = []) {
  const graph = nodes.filter(Boolean)
  if (!graph.length) return null
  return { '@context': 'https://schema.org', '@graph': graph }
}
