import { redirect } from 'next/navigation'
import { countAdmins } from '../../../services/admin-users.js'
import SetupForm from '../../../components/admin/SetupForm.jsx'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin Setup — Rihla Global' }

export default async function SetupPage() {
  let hasAdmin = false
  try {
    hasAdmin = (await countAdmins()) > 0
  } catch {
    /* DB unreachable — still show the form so the message surfaces on submit */
  }
  if (hasAdmin) redirect('/admin/login')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div className="mb-6 flex items-center gap-2.5">
          <img src="/Rihla logo.png" alt="" className="h-11 w-11 object-contain" />
          <div className="leading-tight">
            <div className="font-heading text-lg font-bold text-navy-900">Rihla Admin</div>
            <div className="text-[11px] text-navy-800/60">First-time setup</div>
          </div>
        </div>
        <h1 className="mb-1 font-heading text-xl font-bold text-navy-900">Create your admin account</h1>
        <p className="mb-6 text-sm text-navy-800/60">One-time setup for the first administrator. This screen disappears once an admin exists.</p>
        <SetupForm />
      </div>
    </div>
  )
}
