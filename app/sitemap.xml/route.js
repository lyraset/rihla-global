import { getSitemapEntries } from '../../lib/sitemap-data.js'

/**
 * /sitemap.xml
 *
 * A hand-rolled route rather than Next's `app/sitemap.js` metadata convention:
 * that convention serializes the XML itself and exposes no hook for the
 * `<?xml-stylesheet?>` processing instruction, which is what makes the sitemap
 * human-readable in a browser.
 *
 * Regenerated hourly — countries and info pages are CMS-driven, so a
 * build-time snapshot goes stale the moment an admin publishes.
 */
export const revalidate = 3600

/**
 * Labels live in a private namespace. Crawlers ignore elements from namespaces
 * they don't recognise (the same mechanism image:/news: extensions rely on), so
 * the document stays valid while sitemap.xsl gets real titles to display.
 */
const NS_RIHLA = 'https://rihla-global.com/ns/sitemap'

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export async function GET() {
  const entries = await getSitemapEntries()

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${escapeXml(e.loc)}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
    <rihla:title>${escapeXml(e.title)}</rihla:title>
    <rihla:group>${escapeXml(e.group)}</rihla:group>
  </url>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:rihla="${NS_RIHLA}">
${urls}
</urlset>
`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
