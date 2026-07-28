import { getSiteSettings } from '../../../../services/settings.js'
import SettingsForm from '../../../../components/admin/SettingsForm.jsx'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  let settings = null
  try {
    settings = await getSiteSettings()
  } catch {
    /* DB not configured */
  }

  return (
    <div>
      <h1 className="mb-5 font-heading text-2xl font-bold text-navy-900">Settings</h1>
      <SettingsForm settings={settings || {}} />
    </div>
  )
}
