import { getRouteSeo } from '../services/seo.js'
import { getSiteSettings } from '../services/settings.js'
import { siteOrigin } from './sitemap-data.js'

const firstNonEmpty = (...vals) => vals.find((v) => typeof v === 'string' && v.trim() !== '')

/**
 * Resolves the Next.js Metadata object for a public route.
 *
 * Precedence, highest first:
 *   1. the /admin/seo override for this exact path (RouteSeo)
 *   2. the SEO fields on the route's own CMS document, when it has one
 *   3. the `fallback*` values the page component computes
 *   4. the site-wide defaults in Settings → SEO
 *
 * Always resolves: a DB outage degrades to the fallbacks rather than throwing,
 * because metadata failing must never take a page down with it.
 *
 * @param {object}  args
 * @param {string}  args.path                 public path, e.g. '/about'
 * @param {string} [args.fallbackTitle]       what the page showed before SEO was editable
 * @param {string} [args.fallbackDescription]
 * @param {object} [args.entitySeo]           `seo` subdoc of the backing CMS document
 */
export async function buildMetadata({ path, fallbackTitle, fallbackDescription, entitySeo }) {
  const [override, settings] = await Promise.all([
    getRouteSeo(path),
    getSiteSettings().catch(() => null),
  ])
  const defaults = settings?.seoDefaults || {}

  const title = firstNonEmpty(
    override?.metaTitle,
    entitySeo?.metaTitle,
    fallbackTitle,
    defaults.metaTitle,
  )
  const description = firstNonEmpty(
    override?.metaDescription,
    entitySeo?.metaDescription,
    fallbackDescription,
    defaults.metaDescription,
  )

  const ogTitle = firstNonEmpty(override?.ogTitle, entitySeo?.ogTitle, title)
  const ogDescription = firstNonEmpty(override?.ogDescription, entitySeo?.ogDescription, description)
  const ogImage = firstNonEmpty(
    override?.ogImageUrl,
    entitySeo?.ogImage?.url,
    defaults.ogImage?.url,
  )

  // Self-referential by default, against the origin that actually answers 200.
  // Root keeps its trailing slash so the tag matches the served URL exactly.
  const canonical = firstNonEmpty(
    override?.canonicalUrl,
    entitySeo?.canonicalUrl,
    `${siteOrigin()}${path === '/' ? '/' : path}`,
  )

  const keywords = override?.keywords?.length
    ? override.keywords
    : entitySeo?.keywords?.length
      ? entitySeo.keywords
      : undefined

  const noindex = override?.noindex ?? entitySeo?.noindex ?? false
  const nofollow = override?.nofollow ?? entitySeo?.nofollow ?? false

  /** @type {import('next').Metadata} */
  const metadata = {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
    alternates: { canonical },
    openGraph: {
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      url: canonical,
      siteName: settings?.brandName || 'Rihla Global',
      type: 'website',
    },
    twitter: {
      card: entitySeo?.twitterCard || defaults.twitterCard || 'summary_large_image',
      ...(ogTitle ? { title: ogTitle } : {}),
      ...(ogDescription ? { description: ogDescription } : {}),
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }

  // Only emit a robots directive when something is actually restricted — an
  // explicit index/follow tag is noise Google ignores anyway.
  if (noindex || nofollow) {
    metadata.robots = { index: !noindex, follow: !nofollow }
  }

  return metadata
}
