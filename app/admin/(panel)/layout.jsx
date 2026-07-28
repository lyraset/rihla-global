import { redirect } from 'next/navigation'
import { getAdminSession } from '../../../lib/session.js'
import Sidebar from '../../../components/admin/Sidebar.jsx'
import LogoutButton from '../../../components/admin/LogoutButton.jsx'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin — Rihla Global' }

export default async function PanelLayout({ children }) {
  // Defense in depth — middleware gates too, but authorization is re-checked here.
  const session = await getAdminSession()
  if (!session?.user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50 text-ink">
      <Sidebar role={session.user.role} />
      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-navy-800/10 bg-white px-6 py-3">
          <div className="text-sm text-navy-800/60">
            Signed in as <span className="font-semibold text-navy-900">{session.user.email}</span>
            <span className="ml-2 rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-700">
              {session.user.role}
            </span>
          </div>
          <LogoutButton />
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
