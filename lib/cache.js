import { revalidateTag } from 'next/cache'

/** Cache tags used by ISR reads and admin-mutation revalidation. */
export const CACHE_TAGS = {
  services: 'services',
  features: 'features',
  process: 'process',
  stats: 'stats',
  testimonials: 'testimonials',
  faqs: 'faqs',
  blog: 'blog',
  countries: 'countries',
  pages: 'pages',
  settings: 'settings',
  leads: 'leads',
  media: 'media',
  seo: 'seo',
  sections: 'sections',
  spotlight: 'spotlight',
}

export function revalidateTags(tags = []) {
  for (const tag of tags) {
    try {
      revalidateTag(tag)
    } catch {
      /* revalidateTag is a no-op outside a request scope (e.g. scripts) */
    }
  }
}
