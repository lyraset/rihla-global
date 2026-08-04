import { notFound } from 'next/navigation'
import SiteContent from '../../components/site/SiteContent.jsx'
import { getSiteData } from '../../lib/site-data.js'
import { getPageBySlug } from '../../services/content.js'
import { buildMetadata } from '../../lib/seo.js'

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
  return buildMetadata({
    path: `/${slug}`,
    fallbackTitle: `${page.title} — Rihla Global`,
    entitySeo: page.seo,
  })
}

export default async function InfoPage({ params }) {
  const { slug } = await params
  const data = await getSiteData()
  if (!data.pages.some((p) => p.slug === slug)) notFound()
  return <SiteContent data={data} page="page" slug={slug} />
}
