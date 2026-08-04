import SiteContent from '../../components/site/SiteContent.jsx'
import { getSiteData } from '../../lib/site-data.js'
import { buildMetadata } from '../../lib/seo.js'

export const dynamic = 'force-dynamic'
export async function generateMetadata() {
  return buildMetadata({ path: '/contact', fallbackTitle: 'Contact Us — Rihla Global' })
}

export default async function ContactPage() {
  const data = await getSiteData()
  return <SiteContent data={data} page="contact" />
}
