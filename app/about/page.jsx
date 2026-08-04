import SiteContent from '../../components/site/SiteContent.jsx'
import { getSiteData } from '../../lib/site-data.js'
import { buildMetadata } from '../../lib/seo.js'
import PageSchema from '../../components/site/PageSchema.jsx'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  return buildMetadata({ path: '/about', fallbackTitle: 'About Us — Rihla Global' })
}

export default async function AboutPage() {
  const data = await getSiteData()
  return (
    <>
      <PageSchema data={data} page="about" />
      <SiteContent data={data} page="about" />
    </>
  )
}
