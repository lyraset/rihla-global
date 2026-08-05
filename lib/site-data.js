import {
  getServices, getFeatures, getProcessSteps, getStats, getTestimonials, getFaqs, getCountries, getPages,
  getPageSections, getSpotlightCards,
} from '../services/content.js'
import { getSiteSettings } from '../services/settings.js'

async function safe(fn) {
  try {
    return await fn()
  } catch {
    return null
  }
}

/** All public site content, with build-safe fallbacks. Reads are tag-cached. */
export async function getSiteData() {
  const [services, features, steps, stats, testimonials, faqs, countries, pages, settings, sections, spotlight] = await Promise.all([
    safe(getServices), safe(getFeatures), safe(getProcessSteps), safe(getStats),
    safe(getTestimonials), safe(getFaqs), safe(getCountries), safe(getPages), safe(getSiteSettings),
    safe(getPageSections), safe(getSpotlightCards),
  ])
  return {
    services: services || [],
    features: features || [],
    process: steps || [],
    stats: stats || [],
    testimonials: testimonials || [],
    faqs: faqs || [],
    countries: countries || [],
    pages: pages || [],
    settings: settings || {},
    sections: sections || [],
    spotlight: spotlight || [],
  }
}
