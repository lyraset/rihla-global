import { getManagedRoutes } from '../../../../lib/cms/routes.js'
import { getRouteSeoMap } from '../../../../services/seo.js'
import SeoForm from '../../../../components/admin/SeoForm.jsx'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'SEO — Rihla Admin' }

export default async function SeoPage() {
  const [groups, overrides] = await Promise.all([getManagedRoutes(), getRouteSeoMap()])
  const count = groups.reduce((n, g) => n + g.routes.length, 0)

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-bold text-navy-900">On-page SEO</h1>
      <p className="mb-6 max-w-2xl text-sm text-navy-800/60">
        Meta title and description for every page on the site — {count} in total. Leave a box empty to keep
        the current default shown as placeholder text. Country and content pages appear here automatically
        as you add them.
      </p>
      <SeoForm groups={groups} overrides={overrides} />
    </div>
  )
}
