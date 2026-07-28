import { notFound } from 'next/navigation'
import SiteContent from '../../components/site/SiteContent.jsx'
import { getSiteData } from '../../lib/site-data.js'
import { getPageBySlug } from '../../services/content.js'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }) {
  const { slug } = await params
  let page = null
  try {
    page = await getPageBySlug(slug)
  } catch {
    /* ignore */
  }
  if (!page) return {}
  return {
    title: page.seo?.metaTitle || `${page.title} — Rihla Global`,
    description: page.seo?.metaDescription,
  }
}

export default async function InfoPage({ params }) {
  const { slug } = await params
  const data = await getSiteData()
  if (!data.pages.some((p) => p.slug === slug)) notFound()
  return <SiteContent data={data} page="page" slug={slug} />
}
