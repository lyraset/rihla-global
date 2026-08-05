import { connectDB } from '../lib/db.js'
import { Service } from '../models/Service.js'
import { Feature } from '../models/Feature.js'
import { ProcessStep } from '../models/ProcessStep.js'
import { Stat } from '../models/Stat.js'
import { Testimonial } from '../models/Testimonial.js'
import { Faq } from '../models/Faq.js'
import { Country } from '../models/Country.js'
import { Page } from '../models/Page.js'
import { PageSection } from '../models/PageSection.js'
import { SpotlightCard } from '../models/SpotlightCard.js'

/**
 * Direct DB reads (no unstable_cache). The public pages are `force-dynamic`, so
 * every request reflects the current DB — CMS edits and re-seeds show up
 * immediately, with no stale-cache surprises.
 */
const serialize = (docs) => JSON.parse(JSON.stringify(docs))

const publishedByOrder = (Model) => async () => {
  await connectDB()
  return serialize(await Model.find({ isPublished: true }).sort({ order: 1, createdAt: 1 }))
}

export const getServices = publishedByOrder(Service)
export const getFeatures = publishedByOrder(Feature)
export const getProcessSteps = publishedByOrder(ProcessStep)
export const getStats = publishedByOrder(Stat)
export const getTestimonials = publishedByOrder(Testimonial)
export const getFaqs = publishedByOrder(Faq)
export const getCountries = publishedByOrder(Country)
export const getSpotlightCards = publishedByOrder(SpotlightCard)

/** Section heading copy. Not filtered by isPublished — visibility is per-row. */
export async function getPageSections() {
  await connectDB()
  return serialize(await PageSection.find().sort({ order: 1 }))
}

export async function getPages() {
  await connectDB()
  return serialize(await Page.find({ isPublished: true }).sort({ slug: 1 }))
}

export async function getServiceBySlug(slug) {
  await connectDB()
  return serialize(await Service.findOne({ slug, isPublished: true }))
}

export async function getPageBySlug(slug) {
  await connectDB()
  return serialize(await Page.findOne({ slug, isPublished: true }))
}
