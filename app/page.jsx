import SiteContent from '../components/site/SiteContent.jsx'
import { getSiteData } from '../lib/site-data.js'
import { buildMetadata } from '../lib/seo.js'

export const dynamic = 'force-dynamic'

export async function generateMetadata() {
  return buildMetadata({
    path: '/',
    fallbackTitle: 'Rihla Global | Visa Consultant',
    fallbackDescription:
      'Rihla Global Visa Consultant — expert guidance for student, work, tourist, business and PR visas.',
  })
}

export default async function Home() {
  const data = await getSiteData()
  return <SiteContent data={data} page="home" />
}
