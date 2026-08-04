import { notFound } from 'next/navigation'
import SiteContent from '../../../components/site/SiteContent.jsx'
import { getSiteData } from '../../../lib/site-data.js'
import { buildMetadata } from '../../../lib/seo.js'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { code } = await params
  const data = await getSiteData()
  const country = data.countries.find((c) => (c.code || '').toLowerCase() === code.toLowerCase())
  if (!country) return {}
  return buildMetadata({
    path: `/countries/${code.toLowerCase()}`,
    fallbackTitle: `${country.name} Visas — Rihla Global`,
    fallbackDescription: country.blurb,
    entitySeo: country.seo,
  })
}

export default async function CountryPage({ params }) {
  const { code } = await params
  const data = await getSiteData()
  const exists = data.countries.some((c) => (c.code || '').toLowerCase() === code.toLowerCase())
  if (!exists) notFound()
  return <SiteContent data={data} page="country" slug={code} />
}
