import mongoose from 'mongoose'
import { applyToJSON, mediaRefSchema, seoSchema, model } from './shared.js'

const siteSettingsSchema = new mongoose.Schema(
  {
    // singleton marker — always 'main'; unique index enforces one document
    key: { type: String, default: 'main', unique: true },
    brandName: { type: String, default: 'Rihla Global' },
    tagline: { type: String, default: 'Visa Consultant Pvt. Ltd.' },
    logo: mediaRefSchema,
    logoDark: mediaRefSchema,
    favicon: mediaRefSchema,
    contact: {
      email: String,
      phone: String,
      whatsapp: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      region: String,
      postalCode: String,
      country: String,
      mapEmbedUrl: String,
      geo: { lat: Number, lng: Number },
    },
    hours: [{ day: String, opens: String, closes: String, closed: Boolean }],
    socials: {
      facebook: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      tiktok: String,
      x: String,
    },
    hero: {
      badge: String,
      headline: String,
      headlineAccent: String,
      subheadline: String,
      ctaLabel: String,
      ctaHref: String,
      primaryCtaLabel: String,
      primaryCtaHref: String,
      secondaryCtaLabel: String,
      secondaryCtaHref: String,
      trustItems: [String],
      backgroundImage: mediaRefSchema,
    },
    forms: {
      consultationTitle: String,
      consultationSubtitle: String,
      consultationSuccess: String,
      visaTypes: [String],
    },
    navLinks: [{ label: String, href: String, order: Number }],
    footer: {
      about: String,
      columns: [{ title: String, links: [{ label: String, href: String }] }],
      copyright: String,
    },
    whatsapp: {
      enabled: { type: Boolean, default: true },
      number: String,
      defaultMessage: { type: String, default: 'Hi, I would like to enquire about visa services.' },
      showFloatingButton: { type: Boolean, default: true },
    },
    liveChat: {
      // 'ai' is the built-in Claude-powered assistant (see lib/chat.js); the
      // others are third-party embeds kept for future use.
      provider: { type: String, enum: ['none', 'ai', 'crisp', 'tawk', 'custom'], default: 'ai' },
      enabled: { type: Boolean, default: true },
      embedId: String,
    },
    analytics: { gaMeasurementId: String, gtmId: String, metaPixelId: String, clarityId: String },
    seoDefaults: seoSchema,
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true },
)

applyToJSON(siteSettingsSchema)

export const SiteSettings = model('SiteSettings', siteSettingsSchema)
