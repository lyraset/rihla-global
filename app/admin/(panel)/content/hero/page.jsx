import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSiteSettings } from '../../../../../services/settings.js'
import { getSettingsSection } from '../../../../../lib/cms/settings-fields.js'
import SettingsForm from '../../../../../components/admin/SettingsForm.jsx'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Home hero — Rihla Admin' }

const SECTION = 'Hero section'

/**
 * The home hero, editable from Content where editors look for page copy.
 *
 * This is a second *view* on SiteSettings.hero, not a second copy of it: the
 * same fields and the same save action back both this screen and Settings, so
 * the two can never drift. The scoped save means submitting here touches only
 * the hero group and leaves contact, socials and the rest untouched.
 */
export default async function HeroContentPage() {
  let settings = null
  try {
    settings = await getSiteSettings()
  } catch {
    /* DB unreachable — render the empty form rather than an error page */
  }

  const section = getSettingsSection(SECTION)

  return (
    <div>
      <Link
        href="/admin/content"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-navy-800/60 transition hover:text-navy-900"
      >
        <ArrowLeft size={15} /> Content
      </Link>
      <h1 className="mb-1 font-heading text-2xl font-bold text-navy-900">Home hero</h1>
      <p className="mb-5 max-w-2xl text-sm text-navy-800/60">
        The banner at the top of the home page — headline, buttons, trust badges and background
        image. These are the same fields as Settings → Hero section; editing either updates the
        same record.
      </p>
      <SettingsForm
        settings={settings || {}}
        sections={section ? [section] : []}
        scope={SECTION}
        saveLabel="Save hero"
      />
    </div>
  )
}
