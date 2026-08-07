import { notFound, permanentRedirect } from 'next/navigation'
import SiteContent from '../../../components/site/SiteContent.jsx'
import { getSiteData } from '../../../lib/site-data.js'
import { buildMetadata } from '../../../lib/seo.js'
import { countrySlug, findCountryBySegment } from '../../../lib/cms/country-url.js'
import PageSchema from '../../../components/site/PageSchema.jsx'

export const dynamic = 'force-dynamic'

// The folder is [code] for historical reasons; the segment is now the readable
// slug (/countries/uk), with the old ISO-code form still accepted and redirected.

export async function generateMetadata({ params }) {
  const { code } = await params
  const data = await getSiteData()
  const country = findCountryBySegment(data.countries, code)
  if (!country) return {}
  return buildMetadata({
    path: `/countries/${countrySlug(country)}`,
    fallbackTitle: `${country.name} Visas — Rihla Global`,
    fallbackDescription: country.blurb,
    entitySeo: country.seo,
  })
}

export default async function CountryPage({ params }) {
  const { code } = await params
  const data = await getSiteData()
  const country = findCountryBySegment(data.countries, code)
  if (!country) notFound()

  // Arrived via the legacy /countries/gb form — send crawlers and visitors to
  // the single canonical URL rather than serving the page at two addresses.
  const slug = countrySlug(country)
  if (slug && String(code).toLowerCase() !== slug) {
    permanentRedirect(`/countries/${slug}`)
  }

  return (
    <>
      <PageSchema data={data} page="country" slug={slug} />
      <SiteContent data={data} page="country" slug={slug} />
    </>
  )
}
