import SiteContent from '../../components/site/SiteContent.jsx'
import { getSiteData } from '../../lib/site-data.js'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Contact Us — Rihla Global' }

export default async function ContactPage() {
  const data = await getSiteData()
  return <SiteContent data={data} page="contact" />
}
