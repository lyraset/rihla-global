/**
 * The section headings and spotlight cards the site shipped with.
 *
 * Single source of truth for three consumers:
 *   1. SiteContent, as the fallback when a section has no CMS row (so an empty
 *      collection or a DB outage renders exactly what it always did);
 *   2. the admin bootstrap, which seeds these as editable rows on first visit;
 *   3. the seed script.
 *
 * `where` is shown in the admin so an editor knows a heading is reused before
 * they change it — several of these sections render on more than one page.
 */
export const SECTION_DEFAULTS = [
  {
    key: 'services',
    eyebrow: 'What We Offer',
    title: 'Visa Services',
    subtitle: 'Specialized support across every visa category.',
    where: 'Home + Services page',
    order: 10,
  },
  {
    key: 'features',
    eyebrow: 'Why Rihla',
    title: 'Why Choose Us',
    subtitle: 'A decade of trusted, transparent visa expertise behind every application.',
    where: 'Home + About page',
    order: 20,
  },
  {
    key: 'countries',
    eyebrow: 'Where We Send',
    title: 'Countries We Cover',
    subtitle:
      'Trusted for visas to top destinations worldwide — tap any country to explore every visa category we process.',
    where: 'Home + Countries page',
    order: 30,
  },
  {
    key: 'spotlight',
    eyebrow: 'Explore',
    title: 'Study Abroad & Work Abroad',
    subtitle: '',
    where: 'Home + Services page',
    order: 40,
  },
  {
    key: 'process',
    eyebrow: 'How It Works',
    title: 'Visa Process Made Simple',
    subtitle: 'Clear steps from first call to visa approval.',
    where: 'Home + Services page',
    order: 50,
  },
  {
    key: 'testimonials',
    eyebrow: 'Client Wins',
    title: 'Success Stories',
    subtitle: 'Real approvals from clients who trusted us with their journey.',
    where: 'Home + Success page',
    order: 60,
  },
  {
    key: 'faqs',
    eyebrow: 'Questions',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know before you apply.',
    where: 'Home + Success page',
    order: 70,
  },
  {
    key: 'cta',
    eyebrow: '',
    title: 'Ready to Start Your Journey?',
    subtitle:
      'Book a free consultation and let our experts map your visa path — no obligations, no hidden fees.',
    where: 'Bottom of most pages',
    order: 80,
  },
]

export const SECTION_KEYS = SECTION_DEFAULTS.map((s) => s.key)

/**
 * Which sections each page actually renders — mirrors the switch in
 * SiteContent. This is what makes copy page-scoped: one editable row per
 * (page, section) pair that is genuinely on screen, so changing Home's services
 * heading leaves the Services page alone.
 *
 * Keep in step with SiteContent when a section is added to or removed from a page.
 */
export const PAGE_SECTIONS = {
  home: ['services', 'features', 'countries', 'spotlight', 'process', 'testimonials', 'faqs', 'cta'],
  about: ['features', 'cta'],
  services: ['services', 'spotlight', 'process', 'cta'],
  countries: ['countries', 'cta'],
  success: ['testimonials', 'faqs', 'cta'],
  page: ['cta'],
  country: ['process', 'cta'],
}

/** Admin-facing names for each page scope. */
export const PAGE_LABELS = {
  home: 'Home',
  about: 'About',
  services: 'Services',
  countries: 'Countries',
  success: 'Success stories',
  page: 'Info pages (privacy, terms…)',
  country: 'Country detail pages',
}

export const PAGE_KEYS = Object.keys(PAGE_SECTIONS)

/** Every (page, section) pair, carrying the shipped copy — the seed set. */
export function buildSectionRows() {
  const byKey = Object.fromEntries(SECTION_DEFAULTS.map((s) => [s.key, s]))
  return PAGE_KEYS.flatMap((page) =>
    PAGE_SECTIONS[page].map((key) => {
      const { where: _where, ...d } = byKey[key]
      return { ...d, page }
    }),
  )
}

/**
 * Look up one section's copy for one page.
 *
 * Falls back to a legacy row with no `page` (written before copy was scoped) so
 * a half-migrated database still renders, then to the shipped default.
 */
export function sectionCopy(sections, key, page) {
  const fallback = SECTION_DEFAULTS.find((s) => s.key === key) || {}
  const rows = sections || []
  const row =
    rows.find((s) => s.key === key && s.page === page) ||
    rows.find((s) => s.key === key && !s.page)
  if (!row) return { ...fallback, isVisible: true }
  return {
    eyebrow: row.eyebrow ?? fallback.eyebrow,
    title: row.title ?? fallback.title,
    subtitle: row.subtitle ?? fallback.subtitle,
    isVisible: row.isVisible !== false,
  }
}

export const SPOTLIGHT_DEFAULTS = [
  {
    label: 'Study Abroad',
    copy: 'Campus placements, scholarships and student-visa filing for top global universities.',
    image: {
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=70',
    },
    href: '/contact',
    linkLabel: 'Explore Options',
    order: 10,
    isPublished: true,
  },
  {
    label: 'Work Abroad',
    copy: 'Employer-sponsored placements and work-permit processing across skilled industries.',
    image: {
      url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=70',
    },
    href: '/contact',
    linkLabel: 'Explore Options',
    order: 20,
    isPublished: true,
  },
]
