import SiteContent from '../../components/site/SiteContent.jsx'
import { getSiteData } from '../../lib/site-data.js'
import { buildMetadata } from '../../lib/seo.js'
import PageSchema from '../../components/site/PageSchema.jsx'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  return buildMetadata({ path: '/services', fallbackTitle: 'Our Services — Rihla Global' })
}

export default async function ServicesPage() {
  const data = await getSiteData()
  return (
    <>
      <PageSchema data={data} page="services" />
      <SiteContent data={data} page="services" />
    </>
  )
}
