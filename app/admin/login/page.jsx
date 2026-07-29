import { redirect } from 'next/navigation'
import { countAdmins } from '../../../services/admin-users.js'
import LoginForm from '../../../components/admin/LoginForm.jsx'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin Login — Rihla Global' }

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams
  const callbackUrl = sp?.callbackUrl || '/admin'

  // First-run: if there are no admins yet, send to the setup screen.
  let noAdmin = false
  try {
    noAdmin = (await countAdmins()) === 0
  } catch {
    /* DB unreachable — just show the login form */
  }
  if (noAdmin) redirect('/admin/setup')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl ring-1 ring-black/5">
        <div className="mb-6 flex items-center gap-2.5">
          <img src="/Rihla logo.png" alt="" className="h-11 w-11 object-contain" />
          <div className="leading-tight">
            <div className="font-heading text-lg font-bold text-navy-900">Rihla Admin</div>
            <div className="text-[11px] text-navy-800/60">Visa Consultant Pvt. Ltd.</div>
          </div>
        </div>
        <h1 className="mb-1 font-heading text-xl font-bold text-navy-900">Sign in</h1>
        <p className="mb-6 text-sm text-navy-800/60">Access the admin dashboard.</p>
        {sp?.created && (
          <p className="mb-4 rounded-lg bg-green-50 p-3 text-sm font-medium text-green-700">
            Admin account created — please sign in.
          </p>
        )}
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}
