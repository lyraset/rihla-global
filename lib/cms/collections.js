import { CACHE_TAGS } from '../cache.js'
import { Service } from '../../models/Service.js'
import { Feature } from '../../models/Feature.js'
import { ProcessStep } from '../../models/ProcessStep.js'
import { Stat } from '../../models/Stat.js'
import { Testimonial } from '../../models/Testimonial.js'
import { Faq } from '../../models/Faq.js'
import { Country } from '../../models/Country.js'
import { Page } from '../../models/Page.js'
import { BlogPost } from '../../models/BlogPost.js'

/**
 * The registry that drives the entire generic CMS. Each collection describes its
 * model, cache tag, list columns, and editable fields. `fields` are plain data
 * (safe to pass to client form components); `model`/`tag` stay server-side.
 *
 * Field types: text | textarea | richtext | number | boolean | select |
 *              stringlist | tags | image | icon | slug
 */
const PUBLISH = { name: 'isPublished', label: 'Published', type: 'boolean', default: true }
const ORDER = { name: 'order', label: 'Sort order', type: 'number', default: 0 }

export const COLLECTIONS = {
  services: {
    label: 'Service', labelPlural: 'Services', model: Service, tag: CACHE_TAGS.services,
    defaultSort: { order: 1 }, columns: ['title', 'priceFrom', 'isPublished'], titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', from: 'title', help: 'Auto-generated from title if left blank' },
      { name: 'shortDescription', label: 'Short description', type: 'textarea' },
      { name: 'description', label: 'Full description', type: 'richtext' },
      { name: 'icon', label: 'Icon', type: 'icon', help: 'A lucide icon name, e.g. GraduationCap' },
      { name: 'image', label: 'Image URL', type: 'image' },
      { name: 'bullets', label: 'Bullet points (one per line)', type: 'stringlist' },
      { name: 'priceFrom', label: 'Price from', type: 'number' },
      { name: 'currency', label: 'Currency', type: 'text', default: 'PKR' },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'isFeatured', label: 'Featured', type: 'boolean' },
      PUBLISH, ORDER,
    ],
  },
  features: {
    label: 'Feature', labelPlural: 'Features', model: Feature, tag: CACHE_TAGS.features,
    defaultSort: { order: 1 }, columns: ['title', 'isPublished'], titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon', type: 'icon', help: 'A lucide icon name, e.g. Award' },
      PUBLISH, ORDER,
    ],
  },
  process: {
    label: 'Process step', labelPlural: 'Process steps', model: ProcessStep, tag: CACHE_TAGS.process,
    defaultSort: { order: 1 }, columns: ['title', 'isPublished'], titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icon', label: 'Icon', type: 'icon' },
      PUBLISH, ORDER,
    ],
  },
  stats: {
    label: 'Stat', labelPlural: 'Stats', model: Stat, tag: CACHE_TAGS.stats,
    defaultSort: { order: 1 }, columns: ['label', 'value', 'isPublished'], titleField: 'label',
    fields: [
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'value', label: 'Value (number)', type: 'number', required: true },
      { name: 'suffix', label: 'Suffix', type: 'text', help: 'e.g. + or %' },
      { name: 'prefix', label: 'Prefix', type: 'text' },
      PUBLISH, ORDER,
    ],
  },
  testimonials: {
    label: 'Testimonial', labelPlural: 'Testimonials', model: Testimonial, tag: CACHE_TAGS.testimonials,
    defaultSort: { order: 1 }, columns: ['name', 'destination', 'isPublished'], titleField: 'name',
    fields: [
      { name: 'name', label: 'Client name', type: 'text', required: true },
      { name: 'quote', label: 'Quote', type: 'textarea', required: true },
      { name: 'destination', label: 'Destination / visa', type: 'text', help: 'e.g. UK Student Visa' },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', default: 5 },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'photo', label: 'Photo URL', type: 'image' },
      { name: 'isFeatured', label: 'Featured', type: 'boolean' },
      PUBLISH, ORDER,
    ],
  },
  faqs: {
    label: 'FAQ', labelPlural: 'FAQs', model: Faq, tag: CACHE_TAGS.faqs,
    defaultSort: { order: 1 }, columns: ['question', 'category', 'isPublished'], titleField: 'question',
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'richtext', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      PUBLISH, ORDER,
    ],
  },
  countries: {
    label: 'Country', labelPlural: 'Countries', model: Country, tag: CACHE_TAGS.countries,
    defaultSort: { order: 1 }, columns: ['flag', 'name', 'isPublished'], titleField: 'name',
    fields: [
      { name: 'name', label: 'Country name', type: 'text', required: true },
      { name: 'code', label: 'ISO code', type: 'text', help: 'Two letters, e.g. GB, CA, AU' },
      { name: 'flag', label: 'Flag emoji', type: 'text', help: 'Paste the flag emoji, e.g. 🇬🇧' },
      { name: 'visaTypes', label: 'Visa types offered', type: 'tags', options: ['Student', 'Work', 'Tourist', 'Business', 'PR'] },
      { name: 'blurb', label: 'Short note', type: 'text' },
      PUBLISH, ORDER,
    ],
  },
  pages: {
    label: 'Page', labelPlural: 'Pages', model: Page, tag: CACHE_TAGS.pages,
    defaultSort: { slug: 1 }, columns: ['title', 'slug', 'isPublished'], titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', from: 'title', help: 'e.g. privacy, terms, about' },
      { name: 'content', label: 'Content', type: 'richtext', required: true, help: 'HTML is allowed' },
      PUBLISH,
    ],
  },
  blog: {
    label: 'Blog post', labelPlural: 'Blog', model: BlogPost, tag: CACHE_TAGS.blog,
    defaultSort: { publishedAt: -1 }, columns: ['title', 'isPublished'], titleField: 'title',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'slug', from: 'title' },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'body', label: 'Body', type: 'richtext' },
      { name: 'coverImage', label: 'Cover image URL', type: 'image' },
      { name: 'tags', label: 'Tags', type: 'stringlist' },
      PUBLISH,
    ],
  },
}

export const COLLECTION_KEYS = Object.keys(COLLECTIONS)

export function getCollection(key) {
  return COLLECTIONS[key] || null
}

/** Public list shown in the sidebar (label + key). */
export const CMS_NAV = COLLECTION_KEYS.map((key) => ({ key, label: COLLECTIONS[key].labelPlural }))
