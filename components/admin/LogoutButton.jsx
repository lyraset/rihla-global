'use client'

import { LogOut } from 'lucide-react'
import { logoutAction } from '../../actions/auth.js'

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-navy-800 transition hover:bg-gray-100"
      >
        <LogOut size={15} /> Sign out
      </button>
    </form>
  )
}
