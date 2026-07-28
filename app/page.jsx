import SiteContent from '../components/site/SiteContent.jsx'
import { getSiteData } from '../lib/site-data.js'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await getSiteData()
  return <SiteContent data={data} page="home" />
}
