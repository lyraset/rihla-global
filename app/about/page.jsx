import SiteContent from '../../components/site/SiteContent.jsx'
import { getSiteData } from '../../lib/site-data.js'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'About Us — Rihla Global' }

export default async function AboutPage() {
  const data = await getSiteData()
  return <SiteContent data={data} page="about" />
}
