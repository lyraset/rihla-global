'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Inbox, FileText, Settings, ScrollText, Users,
} from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'Leads', icon: Inbox },
  { href: '/admin/content', label: 'Content', icon: FileText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/audit', label: 'Audit log', icon: ScrollText },
]

export default function Sidebar({ role }) {
  const pathname = usePathname()
  const isActive = (href, exact) => (exact ? pathname === href : pathname.startsWith(href))

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-navy-900 p-4 lg:flex">
      <div className="flex items-center gap-2.5 px-2 py-3">
        <img src="/Rihla logo.png" alt="" className="h-9 w-9 object-contain" />
        <div className="leading-tight text-white">
          <div className="font-heading text-sm font-bold">Rihla Admin</div>
          <div className="text-[10px] text-white/50">Visa Consultant</div>
        </div>
      </div>
      <nav className="mt-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive(href, exact) ? 'bg-green-600 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon size={17} /> {label}
          </Link>
        ))}
        {role === 'superadmin' && (
          <span className="mt-1 flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/30">
            <Users size={17} /> Users <span className="ml-auto text-[10px]">soon</span>
          </span>
        )}
      </nav>
    </aside>
  )
}
