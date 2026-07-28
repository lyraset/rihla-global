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
      { name: 'hero.headline', label: 'Headline' },
      { name: 'hero.headlineAccent', label: 'Headline accent (highlighted words)', help: 'The part shown in green' },
      { name: 'hero.subheadline', label: 'Sub-headline', type: 'textarea' },
      { name: 'hero.primaryCtaLabel', label: 'Primary button label' },
      { name: 'hero.secondaryCtaLabel', label: 'Secondary button label' },
      { name: 'hero.trustItems', label: 'Trust badges (one per line)', type: 'stringlist' },
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
