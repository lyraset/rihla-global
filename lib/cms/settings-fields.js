/** Field spec for the singleton Settings editor. Names use dot-paths that map
 *  straight onto SiteSettings via MongoDB `$set`. Shared by form + action. */
export const SETTINGS_SECTIONS = [
  {
    title: 'Brand',
    fields: [
      { name: 'brandName', label: 'Brand name' },
      { name: 'tagline', label: 'Tagline' },
    ],
  },
  {
    title: 'Hero section',
    fields: [
      { name: 'hero.badge', label: 'Badge text' },
      { name: 'hero.headline', label: 'Headline (H1)', help: 'The page’s main heading — keep your primary keyword here' },
      { name: 'hero.headlineAccent', label: 'Tagline', help: 'Smaller green line under the heading' },
      { name: 'hero.subheadline', label: 'Sub-headline', type: 'textarea', help: 'Optional — leave blank to keep the hero tight' },
      { name: 'hero.primaryCtaLabel', label: 'Primary button label' },
      { name: 'hero.primaryCtaHref', label: 'Primary button link', help: 'Defaults to /contact' },
      { name: 'hero.secondaryCtaLabel', label: 'Secondary button label' },
      { name: 'hero.secondaryCtaHref', label: 'Secondary button link', help: 'Defaults to /services' },
      { name: 'hero.trustItems', label: 'Trust badges (one per line)', type: 'stringlist' },
      {
        name: 'hero.backgroundImage', label: 'Background image', type: 'image',
        placeholder: 'https://…',
        help: 'Sits behind the hero at 20% opacity. Leave blank for the shipped default.',
      },
    ],
  },
  {
    title: 'Contact & address',
    fields: [
      { name: 'contact.email', label: 'Email' },
      { name: 'contact.phone', label: 'Phone' },
      { name: 'contact.whatsapp', label: 'WhatsApp number', help: 'E.164 digits, e.g. 923243799558' },
      { name: 'contact.addressLine1', label: 'Address line 1' },
      { name: 'contact.addressLine2', label: 'Address line 2' },
      { name: 'contact.city', label: 'City' },
      { name: 'contact.region', label: 'Region / State' },
      { name: 'contact.postalCode', label: 'Postal code' },
      { name: 'contact.country', label: 'Country' },
      { name: 'contact.mapEmbedUrl', label: 'Google Maps embed URL' },
    ],
  },
  {
    title: 'Social links',
    fields: [
      { name: 'socials.facebook', label: 'Facebook URL' },
      { name: 'socials.instagram', label: 'Instagram URL' },
      { name: 'socials.linkedin', label: 'LinkedIn URL' },
      { name: 'socials.youtube', label: 'YouTube URL' },
      { name: 'socials.tiktok', label: 'TikTok URL' },
      { name: 'socials.x', label: 'X (Twitter) URL' },
    ],
  },
  {
    title: 'WhatsApp widget',
    fields: [
      { name: 'whatsapp.enabled', label: 'Show floating WhatsApp button', type: 'boolean' },
      { name: 'whatsapp.number', label: 'WhatsApp number (E.164 digits)' },
      { name: 'whatsapp.defaultMessage', label: 'Default pre-filled message', type: 'textarea' },
    ],
  },
  {
    title: 'AI chat assistant',
    fields: [
      {
        name: 'liveChat.enabled', label: 'Show the chat bubble', type: 'boolean',
        help: 'Answers visitor questions from your Services, Countries and FAQ content. Needs ANTHROPIC_API_KEY set in the hosting environment — the bubble stays hidden without it.',
      },
    ],
  },
  {
    title: 'Consultation form',
    fields: [
      { name: 'forms.consultationTitle', label: 'Form title' },
      { name: 'forms.consultationSubtitle', label: 'Form subtitle' },
      { name: 'forms.consultationSuccess', label: 'Success message', type: 'textarea' },
      { name: 'forms.visaTypes', label: 'Visa type options (one per line)', type: 'stringlist' },
    ],
  },
]

export const SETTINGS_FIELDS = SETTINGS_SECTIONS.flatMap((s) => s.fields)

/** Look up one section by title, for editors that render a single group. */
export function getSettingsSection(title) {
  return SETTINGS_SECTIONS.find((s) => s.title === title) || null
}

/**
 * Which fields a submit is allowed to write.
 *
 * A scoped editor posts only its own inputs, so the save must narrow to that
 * group — running the full list would read every absent input as '' and blank
 * unrelated settings. Returns null for an unrecognised scope so the caller can
 * reject rather than fall back to "everything".
 *
 * @param {string} [scope] section title, or falsy for the full settings form
 */
export function resolveSettingsFields(scope) {
  if (!scope) return SETTINGS_FIELDS
  const section = getSettingsSection(scope)
  return section ? section.fields : null
}
