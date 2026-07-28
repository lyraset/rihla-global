import SiteContent from '../../components/site/SiteContent.jsx'
import { getSiteData } from '../../lib/site-data.js'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Success Stories — Rihla Global' }

export default async function SuccessPage() {
  const data = await getSiteData()
  return <SiteContent data={data} page="success" />
}
