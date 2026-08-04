import { siteOrigin } from '../../lib/sitemap-data.js'
import {
  organizationSchema, websiteSchema, webPageSchema, breadcrumbSchema,
  faqSchema, serviceListSchema, countryServiceSchema, buildGraph,
} from '../../lib/schema.js'

/**
 * Emits one JSON-LD `@graph` per public page.
 *
 * A server component so the markup is in the initial HTML — crawlers should not
 * have to execute React to see it. SiteContent is a client component, which is
 * why this sits alongside it rather than inside it.
 *
 * Blocks are chosen to mirror what SiteContent actually renders for that page:
 * FAQ markup only where the questions are on screen, service markup only where
 * the services are listed. Testimonials are deliberately NOT marked up as
 * Review/AggregateRating — Google disallows self-serving review rich results
 * for reviews about the business hosting them.
 */
export default function PageSchema({ data = {}, page, slug }) {
  const origin = siteOrigin()
  const settings = data.settings || {}
  const nodes = [organizationSchema(settings, origin), websiteSchema(settings, origin)]

  const crumbs = (trail) => breadcrumbSchema([{ name: 'Home', path: '/' }, ...trail], origin)

  switch (page) {
    case 'home':
      nodes.push(
        webPageSchema({ origin, path: '/', title: settings.brandName || 'Rihla Global' }),
        serviceListSchema(data.services, origin),
        faqSchema(data.faqs),
      )
      break

    case 'about':
      nodes.push(
        webPageSchema({ origin, path: '/about', title: 'About Us', type: 'AboutPage' }),
        crumbs([{ name: 'About', path: '/about' }]),
      )
      break

    case 'services':
      nodes.push(
        webPageSchema({ origin, path: '/services', title: 'Our Services' }),
        crumbs([{ name: 'Services', path: '/services' }]),
        serviceListSchema(data.services, origin),
      )
      break

    case 'countries':
      nodes.push(
        webPageSchema({ origin, path: '/countries', title: 'Countries We Cover' }),
        crumbs([{ name: 'Countries', path: '/countries' }]),
      )
      break

    case 'success':
      nodes.push(
        webPageSchema({ origin, path: '/success', title: 'Success Stories' }),
        crumbs([{ name: 'Success', path: '/success' }]),
        faqSchema(data.faqs),
      )
      break

    case 'contact':
      nodes.push(
        webPageSchema({ origin, path: '/contact', title: 'Contact Us', type: 'ContactPage' }),
        crumbs([{ name: 'Contact', path: '/contact' }]),
      )
      break

    case 'page': {
      const doc = (data.pages || []).find((p) => p.slug === slug)
      if (!doc) return null
      nodes.push(
        webPageSchema({ origin, path: `/${slug}`, title: doc.title }),
        crumbs([{ name: doc.title, path: `/${slug}` }]),
      )
      break
    }

    case 'country': {
      const doc = (data.countries || []).find(
        (c) => (c.code || '').toLowerCase() === (slug || '').toLowerCase(),
      )
      if (!doc) return null
      const path = `/countries/${(doc.code || '').toLowerCase()}`
      nodes.push(
        webPageSchema({ origin, path, title: `${doc.name} Visas` }),
        crumbs([
          { name: 'Countries', path: '/countries' },
          { name: doc.name, path },
        ]),
        countryServiceSchema(doc, origin),
      )
      break
    }

    default:
      return null
  }

  const graph = buildGraph(nodes)
  if (!graph) return null

  return (
    <script
      type="application/ld+json"
      // Content is built from our own CMS data, not user input. JSON.stringify
      // escapes quotes; `<` is escaped too so a stray "</script>" in a CMS field
      // cannot break out of the tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, '\\u003c') }}
    />
  )
}
