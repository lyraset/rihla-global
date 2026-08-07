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
import { PageSection } from '../../models/PageSection.js'
import { SpotlightCard } from '../../models/SpotlightCard.js'
import {
  SECTION_KEYS, SPOTLIGHT_DEFAULTS, PAGE_KEYS, PAGE_LABELS, buildSectionRows,
} from './section-defaults.js'

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

/**
 * Which page an item belongs to. Blank means shared — the item renders on every
 * page that shows its section, and one edit updates them all. Choosing a page
 * makes that page use only its own items for that section, so its wording is
 * fully independent.
 */
const SCOPE = {
  name: 'page', label: 'Page', type: 'select',
  options: [['', 'All pages (shared)'], ...PAGE_KEYS.map((k) => [k, PAGE_LABELS[k]])],
  help: 'Leave as “All pages” unless this page needs its own wording. A page that has its own items ignores the shared ones for that section.',
}

export const COLLECTIONS = {
  sections: {
    label: 'Section', labelPlural: 'Page sections', model: PageSection, tag: CACHE_TAGS.sections,
    defaultSort: { page: 1, order: 1 }, columns: ['page', 'title', 'key', 'isVisible'],
    titleField: 'title',
    // Planted once on first visit so the editor opens showing the live copy
    // instead of an empty list the user would have to reconstruct by hand.
    ensureDefaults: { rows: buildSectionRows() },
    migrate: 'pageSections',
    fields: [
      {
        name: 'page', label: 'Page', type: 'select', required: true,
        options: PAGE_KEYS.map((k) => [k, PAGE_LABELS[k]]),
        help: 'Which page this copy applies to. Each page is edited independently.',
      },
      {
        name: 'key', label: 'Section', type: 'select', required: true, options: SECTION_KEYS,
        help: 'Which section on that page. Changing it re-points the row.',
      },
      { name: 'eyebrow', label: 'Eyebrow (small green label)', type: 'text' },
      { name: 'title', label: 'Heading', type: 'text' },
      { name: 'subtitle', label: 'Sub-heading', type: 'textarea' },
      {
        name: 'isVisible', label: 'Show this section', type: 'boolean', default: true,
        help: 'Unticking hides the whole section, including its items.',
      },
      {
        name: 'featuredOnly', label: 'Featured items only', type: 'boolean',
        help: 'Show only items ticked as Featured. Applies to Services and Testimonials; ignored for sections whose items have no Featured tick.',
      },
      {
        name: 'maxItems', label: 'Maximum items to show', type: 'number',
        help: 'Leave blank to show all. e.g. 3 on Home, blank on the Services page.',
      },
      ORDER,
    ],
  },
  spotlight: {
    label: 'Spotlight card', labelPlural: 'Spotlight cards', model: SpotlightCard, tag: CACHE_TAGS.spotlight,
    defaultSort: { order: 1 }, columns: ['label', 'page', 'isPublished'], titleField: 'label',
    ensureDefaults: { rows: SPOTLIGHT_DEFAULTS },
    fields: [
      SCOPE,
      { name: 'label', label: 'Card title', type: 'text', required: true },
      { name: 'copy', label: 'Card text', type: 'textarea' },
      { name: 'image', label: 'Image URL', type: 'image' },
      { name: 'href', label: 'Button link', type: 'text', default: '/contact' },
      { name: 'linkLabel', label: 'Button label', type: 'text', default: 'Explore Options' },
      PUBLISH, ORDER,
    ],
  },
  services: {
    label: 'Service', labelPlural: 'Services', model: Service, tag: CACHE_TAGS.services,
    defaultSort: { order: 1 }, columns: ['title', 'page', 'isPublished'], titleField: 'title',
    fields: [
      SCOPE,
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
    defaultSort: { order: 1 }, columns: ['title', 'page', 'isPublished'], titleField: 'title',
    fields: [
      SCOPE,
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
      SCOPE,
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
    defaultSort: { order: 1 }, columns: ['name', 'page', 'isPublished'], titleField: 'name',
    fields: [
      SCOPE,
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
    defaultSort: { order: 1 }, columns: ['question', 'page', 'isPublished'], titleField: 'question',
    fields: [
      SCOPE,
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'richtext', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      PUBLISH, ORDER,
    ],
  },
  countries: {
    label: 'Country', labelPlural: 'Countries', model: Country, tag: CACHE_TAGS.countries,
    defaultSort: { order: 1 }, columns: ['flag', 'name', 'page', 'isPublished'], titleField: 'name',
    fields: [
      SCOPE,
      { name: 'name', label: 'Country name', type: 'text', required: true },
      {
        name: 'code', label: 'ISO code', type: 'text',
        help: 'Two letters, e.g. GB for the UK, TR for Turkey. This is only used to fetch the flag image — it is not the page address, so it must stay the official ISO code or the flag will not load.',
      },
      {
        name: 'slug', label: 'Page address', type: 'slug', from: 'name',
        help: 'The URL for this country, e.g. “uk” gives /countries/uk. Leave blank to use the country name automatically.',
      },
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
