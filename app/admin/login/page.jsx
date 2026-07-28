import LoginForm from '../../../components/admin/LoginForm.jsx'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Admin Login — Rihla Global' }

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams
  const callbackUrl = sp?.callbackUrl || '/admin'

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
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  )
}
