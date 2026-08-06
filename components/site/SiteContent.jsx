'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { sectionCopy, SPOTLIGHT_DEFAULTS } from '../../lib/cms/section-defaults.js'
import ChatWidget from './ChatWidget.jsx'
import {
  GraduationCap, Briefcase, Plane, Building2, FileCheck2,
  ShieldCheck, Globe2, Award, Compass, Sparkles,
  Sun, Moon, Menu, X, MessageCircle, Phone, Mail, MapPin,
  ChevronRight, ChevronDown,
  UserCheck, FileText, ClipboardCheck, BadgeCheck,
  CheckCircle2, Star, ArrowRight,
} from 'lucide-react'

// ---- icon name (from DB) → component ----
const ICONS = {
  GraduationCap, Briefcase, Plane, Building2, FileCheck2, ShieldCheck, Globe2, Award,
  Compass, Sparkles, UserCheck, FileText, ClipboardCheck, BadgeCheck,
}
const iconByName = (name) => ICONS[name] || Sparkles

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Countries', href: '/countries' },
  { label: 'Success', href: '/success' },
  { label: 'Contact', href: '/contact' },
]
const pageLabel = (p) => (p.slug || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

// ---- fallbacks used only when a collection is empty (or DB is unavailable) ----
const DEFAULT_STATS = [
  { label: 'Years of Excellence', value: 10, suffix: '+' },
  { label: 'Visa Success Rate', value: 98, suffix: '%' },
  { label: 'Happy Clients', value: 5000, suffix: '+' },
  { label: 'Countries Covered', value: 50, suffix: '+' },
]
const DEFAULT_SERVICES = [
  { icon: 'GraduationCap', title: 'Student Visa', shortDescription: 'End-to-end support for university offers, funding proof and study permits.' },
  { icon: 'Briefcase', title: 'Work Visa', shortDescription: 'Employer sponsorship, work permits and skilled migration pathways.' },
  { icon: 'Plane', title: 'Tourist Visa', shortDescription: 'Fast-tracked travel visas with itinerary and documentation help.' },
  { icon: 'Building2', title: 'Business Visa', shortDescription: 'Investor and business-visitor visas for entrepreneurs and executives.' },
  { icon: 'FileCheck2', title: 'PR & Immigration', shortDescription: 'Points-based and family-sponsored permanent residency applications.' },
]
const DEFAULT_FEATURES = [
  { icon: 'Award', title: 'Expert Guidance', description: 'Certified consultants with a decade of visa filing experience.' },
  { icon: 'ShieldCheck', title: 'Transparent Process', description: 'Clear timelines and fees — no hidden charges, ever.' },
  { icon: 'BadgeCheck', title: 'High Success Rate', description: '98% approval rate across student, work and PR categories.' },
  { icon: 'Globe2', title: 'Global Network', description: 'Partner universities and employers across 50+ countries.' },
  { icon: 'Compass', title: 'Skilled Evaluation Team', description: 'Dedicated case officers assess eligibility before you apply.' },
  { icon: 'Sparkles', title: 'Personalized Approach', description: 'A tailored roadmap built around your goals and timeline.' },
]
const DEFAULT_PROCESS = [
  { icon: 'UserCheck', title: 'Initial Consultation' },
  { icon: 'FileText', title: 'Documentation' },
  { icon: 'ClipboardCheck', title: 'Application Submission' },
  { icon: 'BadgeCheck', title: 'Visa Approval' },
]
const DEFAULT_TESTIMONIALS = [
  { name: 'Aisha R.', destination: 'UK Student Visa', rating: 5, quote: 'Rihla handled my offer letter and visa filing in under three weeks.' },
  { name: 'Daniel K.', destination: 'Canada PR', rating: 5, quote: 'Clear checklist, honest timelines — my PR was approved on the first try.' },
  { name: 'Meera S.', destination: 'Australia Work Visa', rating: 5, quote: 'They matched me with a sponsoring employer and managed every form.' },
]
const HERO_IMG = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=70'
const TEAM_IMG = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=70'

function useTheme() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
    setMounted(true)
  }, [])
  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('rihla-theme', dark ? 'dark' : 'light') } catch { /* ignore */ }
  }, [dark, mounted])
  return [dark, setDark]
}

function useCountUp(targetNumber, active) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    const numeric = Number(targetNumber) || 0
    let frame
    const start = performance.now()
    const duration = 1200
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      setN(Math.round(numeric * progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [active, targetNumber])
  return n
}

function IconBadge({ Icon, className = '' }) {
  return (
    <div className={`grid h-12 w-12 place-items-center rounded-xl bg-navy-800 text-green-500 ${className}`}>
      <Icon size={22} />
    </div>
  )
}

function Navbar({ dark, setDark, brand, pages }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const pathname = usePathname()
  // Published pages become independent nav links (their own routes); skip any
  // whose label already exists as a section link (e.g. About).
  const navPages = (pages || [])
    .map((p) => ({ label: pageLabel(p), href: `/${p.slug}` }))
    .filter((np) => !NAV_LINKS.some((l) => l.label.toLowerCase() === np.label.toLowerCase()))
  const links = [...NAV_LINKS, ...navPages]
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  return (
    <header className={`sticky top-0 z-40 border-b backdrop-blur-md transition-all ${scrolled ? 'border-navy-800/10 bg-white/85 shadow-sm dark:border-white/10 dark:bg-navy-900/85' : 'border-transparent bg-white/70 dark:bg-navy-900/70'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/Rihla logo.png" alt={brand.name} className="h-12 w-12 object-contain" />
          <div className="leading-tight">
            <div className="font-heading text-lg font-bold text-navy-900 dark:text-white">{brand.name}</div>
            <div className="text-[11px] font-medium tracking-wide text-navy-800/70 dark:text-gray-300">{brand.tagline}</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-5 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`text-sm font-medium transition-colors ${isActive(l.href) ? 'text-green-600 dark:text-green-400' : 'text-navy-800 hover:text-green-600 dark:text-gray-200 dark:hover:text-green-400'}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <button aria-label="Toggle dark mode" onClick={() => setDark(!dark)} className="grid h-9 w-9 place-items-center rounded-full border border-navy-800/15 text-navy-800 transition hover:border-green-600/40 hover:text-green-600 dark:border-white/20 dark:text-white">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link href="/contact" className="hidden rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-green-900/20 transition hover:bg-green-700 sm:block">Book Consultation</Link>
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <div className="flex flex-col gap-1 border-t border-navy-800/10 bg-white px-6 py-3 lg:hidden dark:border-white/10 dark:bg-navy-900">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className={`rounded-lg px-2 py-2 ${isActive(l.href) ? 'text-green-600' : 'text-navy-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5'}`}>{l.label}</Link>
          ))}
          <Link href="/contact" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-green-600 px-5 py-2.5 text-center text-sm font-semibold text-white">Book Consultation</Link>
        </div>
      )}
    </header>
  )
}

// ---- form helpers ----
async function submitLead(url, payload) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  let json = {}
  try { json = await res.json() } catch { /* non-JSON */ }
  if (!res.ok || !json.ok) {
    const err = new Error(json?.error?.message || 'Something went wrong. Please try again.')
    err.fields = json?.error?.fields
    throw err
  }
  return json.data
}

function leadSource() {
  if (typeof window === 'undefined') return undefined
  const p = new URLSearchParams(window.location.search)
  const pick = (k) => p.get(k) || undefined
  return {
    page: window.location.pathname,
    referrer: document.referrer || undefined,
    utm: { source: pick('utm_source'), medium: pick('utm_medium'), campaign: pick('utm_campaign'), term: pick('utm_term'), content: pick('utm_content') },
  }
}

function Honeypot() {
  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
      <label>Leave this field empty<input type="text" name="website" tabIndex={-1} autoComplete="off" /></label>
    </div>
  )
}

function WhatsappCta({ url }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700">
      <MessageCircle size={15} /> Continue on WhatsApp
    </a>
  )
}

function ConsultationForm({ cfg }) {
  const visaOptions = cfg.visaTypes?.length ? cfg.visaTypes : ['Student', 'Work', 'Tourist', 'Business']
  const [visaType, setVisaType] = useState(visaOptions[0])
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [waUrl, setWaUrl] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    if (status === 'submitting') return
    const form = e.currentTarget
    const fd = new FormData(form)
    setStatus('submitting'); setError('')
    try {
      const data = await submitLead('/api/leads', {
        type: 'consultation', name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'),
        visaType, website: fd.get('website') || '', source: leadSource(),
      })
      setWaUrl(data?.whatsappUrl || ''); setStatus('success'); form.reset()
    } catch (err) { setError(err.message); setStatus('error') }
  }

  const inputCls = 'w-full rounded-lg border border-navy-800/15 bg-white px-3.5 py-2.5 text-sm text-navy-900 outline-none transition placeholder:text-navy-800/40 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-white/15 dark:bg-navy-900 dark:text-white dark:placeholder:text-white/40'

  return (
    <form aria-label="Consultation booking form" onSubmit={onSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 sm:p-7 dark:bg-navy-800 dark:ring-white/10">
      <h3 className="font-heading text-xl font-bold text-navy-900 dark:text-white">{cfg.consultationTitle || 'Book a Free Consultation'}</h3>
      <p className="mt-1 text-sm text-navy-800/60 dark:text-gray-300">{cfg.consultationSubtitle || 'Get a personalised response from our team within 24 hours.'}</p>
      {status === 'success' ? (
        <div role="status" className="mt-6 rounded-xl bg-green-50 p-4 text-sm font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <span>{cfg.consultationSuccess || 'Thank you! Our team will reach out within 24 hours.'}</span>
          </div>
          <WhatsappCta url={waUrl} />
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <label className="block"><span className="sr-only">Name</span>
            <input required name="name" autoComplete="name" placeholder="Full name" className={inputCls} /></label>
          <label className="block"><span className="sr-only">Email</span>
            <input required type="email" name="email" autoComplete="email" placeholder="Email address" className={inputCls} /></label>
          <div>
            <span className="mb-1.5 block text-xs font-medium text-navy-800/60 dark:text-gray-400">Visa type</span>
            <div role="radiogroup" aria-label="Visa type" className={`grid gap-1 rounded-lg bg-gray-50 p-1 text-xs dark:bg-navy-900`} style={{ gridTemplateColumns: `repeat(${Math.min(visaOptions.length, 4)}, minmax(0,1fr))` }}>
              {visaOptions.map((t) => (
                <button type="button" key={t} role="radio" aria-checked={visaType === t} onClick={() => setVisaType(t)}
                  className={`rounded-md py-1.5 transition ${visaType === t ? 'bg-green-600 font-semibold text-white shadow-sm' : 'text-navy-800/70 hover:text-navy-900 dark:text-gray-300 dark:hover:text-white'}`}>{t}</button>
              ))}
            </div>
          </div>
          <label className="block"><span className="sr-only">Phone Number</span>
            <input required type="tel" name="phone" autoComplete="tel" placeholder="Phone number" className={inputCls} /></label>
          <Honeypot />
          {status === 'error' && <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
          <button type="submit" disabled={status === 'submitting'} className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white shadow-lg shadow-green-900/20 transition hover:bg-green-700 disabled:opacity-70">
            {status === 'submitting' ? 'Sending…' : (<>Request Free Consultation <ArrowRight size={16} /></>)}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-navy-800/50 dark:text-gray-400">
            <ShieldCheck size={13} /> Your information is 100% confidential
          </p>
        </div>
      )}
    </form>
  )
}

function QuickContactForm() {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const [waUrl, setWaUrl] = useState('')
  async function onSubmit(e) {
    e.preventDefault()
    if (status === 'submitting') return
    const form = e.currentTarget
    const fd = new FormData(form)
    setStatus('submitting'); setError('')
    try {
      const data = await submitLead('/api/leads', { type: 'contact', name: fd.get('name'), email: fd.get('email'), website: fd.get('website') || '', source: leadSource() })
      setWaUrl(data?.whatsappUrl || ''); setStatus('success'); form.reset()
    } catch (err) { setError(err.message); setStatus('error') }
  }
  if (status === 'success') {
    return <div role="status" className="mt-8 text-sm font-medium text-green-400">Thanks! Our team will reach out within 24 hours.<div><WhatsappCta url={waUrl} /></div></div>
  }
  return (
    <form aria-label="Contact form" onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
      <label className="sr-only" htmlFor="cta-name">Name</label>
      <input id="cta-name" required name="name" autoComplete="name" placeholder="Name" className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:border-green-500" />
      <label className="sr-only" htmlFor="cta-email">Email</label>
      <input id="cta-email" required type="email" name="email" autoComplete="email" placeholder="Email" className="w-full rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/60 outline-none focus:border-green-500" />
      <Honeypot />
      <button type="submit" disabled={status === 'submitting'} className="shrink-0 rounded-full bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-70">{status === 'submitting' ? 'Sending…' : 'Book a Free Consultation'}</button>
      {status === 'error' && <p role="alert" className="w-full text-sm font-medium text-red-300 sm:basis-full">{error}</p>}
    </form>
  )
}

function NewsletterForm() {
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  async function onSubmit(e) {
    e.preventDefault()
    if (status === 'submitting') return
    const form = e.currentTarget
    const fd = new FormData(form)
    setStatus('submitting'); setMessage('')
    try {
      await submitLead('/api/newsletter', { type: 'newsletter', email: fd.get('email'), website: fd.get('website') || '', source: leadSource() })
      setStatus('success'); setMessage('Subscribed! Check your inbox.'); form.reset()
    } catch (err) { setStatus('error'); setMessage(err.message) }
  }
  return (
    <div>
      <form className="flex gap-2" onSubmit={onSubmit}>
        <input required type="email" name="email" aria-label="Email address" placeholder="Your email" className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-white/50 focus:border-green-500" />
        <Honeypot />
        <button type="submit" disabled={status === 'submitting'} aria-label="Subscribe" className="grid shrink-0 place-items-center rounded-lg bg-green-600 px-3 text-white transition hover:bg-green-700 disabled:opacity-70"><ChevronRight size={16} /></button>
      </form>
      {message && <p role="status" className={`mt-2 text-xs ${status === 'error' ? 'text-red-300' : 'text-green-400'}`}>{message}</p>}
    </div>
  )
}

function Hero({ hero, formCfg }) {
  const trust = hero.trustItems?.length ? hero.trustItems : ['No hidden fees', 'Free eligibility check', 'End-to-end support']
  return (
    <section id="home" className="relative overflow-hidden bg-navy-900">
      <img src={hero.backgroundImage?.url || HERO_IMG} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-linear-to-br from-navy-900 via-navy-900/95 to-navy-800/90" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 -bottom-20 h-96 w-96 rounded-full bg-navy-700/40 blur-3xl" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-2">
        <div className="max-w-xl text-white">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-green-400 backdrop-blur">
            <ShieldCheck size={14} /> {hero.badge || 'Licensed Visa & Immigration Consultants'}
          </span>
          <h1 className="animate-fade-up mt-5 font-heading text-4xl font-bold leading-[1.1] md:text-5xl lg:text-6xl" style={{ animationDelay: '0.1s' }}>
            {hero.headline || 'Trusted Visa Consultant in Islamabad'}
          </h1>
          {/* Tagline, not part of the H1 — one heading per page keeps the
              primary keyword unambiguous for search engines. */}
          <p className="animate-fade-up mt-3 font-heading text-xl font-semibold text-green-400 md:text-2xl" style={{ animationDelay: '0.15s' }}>
            {hero.headlineAccent || 'Your Gateway to Global Opportunities'}
          </p>
          {hero.subheadline && (
            <p className="animate-fade-up mt-4 max-w-lg text-base text-white/70" style={{ animationDelay: '0.2s' }}>
              {hero.subheadline}
            </p>
          )}
          <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.3s' }}>
            <Link href={hero.primaryCtaHref || '/contact'} className="inline-flex items-center gap-2 rounded-full bg-green-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-900/30 transition hover:bg-green-700">
              {hero.primaryCtaLabel || 'Book Free Consultation'} <ArrowRight size={16} />
            </Link>
            <Link href={hero.secondaryCtaHref || '/services'} className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10">
              {hero.secondaryCtaLabel || 'Explore Services'}
            </Link>
          </div>
          <div className="animate-fade-up mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70" style={{ animationDelay: '0.4s' }}>
            {trust.map((t) => (<span key={t} className="inline-flex items-center gap-1.5"><CheckCircle2 size={16} className="text-green-400" /> {t}</span>))}
          </div>
        </div>
        <div className="animate-fade-up w-full lg:justify-self-end" style={{ animationDelay: '0.35s' }}>
          <ConsultationForm cfg={formCfg} />
        </div>
      </div>
    </section>
  )
}

function StatsBar({ stats }) {
  const [ref, setRef] = useState(null)
  const [active, setActive] = useState(false)
  useEffect(() => {
    if (!ref) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setActive(true), { threshold: 0.4 })
    io.observe(ref)
    return () => io.disconnect()
  }, [ref])
  return (
    <div ref={setRef} className="relative z-10 mx-6 -mt-10 max-w-6xl rounded-2xl bg-linear-to-r from-navy-800 to-navy-900 px-6 py-9 shadow-xl ring-1 ring-white/10 md:mx-auto">
      <div className="grid grid-cols-2 gap-y-8 text-center text-white md:grid-cols-4 md:divide-x md:divide-white/10">
        {stats.map((s) => (<StatItem key={s.id || s.label} stat={s} active={active} />))}
      </div>
    </div>
  )
}

function StatItem({ stat, active }) {
  const n = useCountUp(stat.value, active)
  return (
    <div className="px-2">
      <div className="font-heading text-3xl font-bold text-green-400 md:text-4xl">{stat.prefix || ''}{n}{stat.suffix || ''}</div>
      <div className="mt-1 text-sm text-white/70">{stat.label}</div>
    </div>
  )
}

function Section({ id, eyebrow, title, subtitle, center = false, bg = '', className = '', children }) {
  return (
    <section id={id} className={`scroll-mt-24 ${bg}`}>
      <div className={`mx-auto max-w-7xl px-6 py-20 md:py-24 ${className}`}>
        {(eyebrow || title) && (
          <div className={`mb-12 max-w-2xl ${center ? 'mx-auto text-center' : ''}`}>
            {eyebrow && (<span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-green-600">{!center && <span className="h-px w-6 bg-green-600" />}{eyebrow}</span>)}
            {title && <h2 className="mt-3 font-heading text-3xl font-bold text-navy-900 md:text-4xl dark:text-white">{title}</h2>}
            {subtitle && <p className="mt-4 text-lg text-navy-800/70 dark:text-gray-300">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

function VisaServices({ services, copy }) {
  return (
    <Section id="services" center eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {services.map((s) => (
          <div key={s.id || s.title} className="group rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-600/30 hover:shadow-xl dark:border-white/10 dark:bg-navy-800">
            <IconBadge Icon={iconByName(s.icon)} className="transition group-hover:bg-green-600 group-hover:text-white" />
            <h3 className="mt-4 font-heading font-semibold text-navy-900 dark:text-white">{s.title}</h3>
            <p className="mt-1.5 text-sm text-navy-800/70 dark:text-gray-300">{s.shortDescription}</p>
            {s.priceFrom ? <p className="mt-2 text-sm font-semibold text-green-600">From {s.currency || ''} {s.priceFrom}</p> : null}
          </div>
        ))}
      </div>
    </Section>
  )
}

function WhyChooseUs({ features, copy }) {
  return (
    <Section id="about" bg="bg-gray-50 dark:bg-navy-900/40" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.id || f.title} className="flex gap-3">
              <IconBadge Icon={iconByName(f.icon)} className="h-10 w-10 shrink-0" />
              <div>
                <h4 className="font-heading font-semibold text-navy-900 dark:text-white">{f.title}</h4>
                <p className="mt-0.5 text-sm text-navy-800/70 dark:text-gray-300">{f.description}</p>
              </div>
            </div>
          ))}
        </div>
        <img src={TEAM_IMG} alt="Rihla Global consultant team in a meeting" className="h-72 w-full rounded-2xl object-cover shadow-lg md:h-full" />
      </div>
    </Section>
  )
}

function CountryFlag({ code, flag, name, className = 'h-7 w-10' }) {
  const c = (code || '').toLowerCase()
  if (c) {
    return (
      <img
        src={`https://flagcdn.com/w160/${c}.png`}
        srcSet={`https://flagcdn.com/w320/${c}.png 2x`}
        alt={`${name} flag`}
        loading="lazy"
        className={`${className} shrink-0 rounded-md object-cover shadow-sm ring-1 ring-black/10`}
      />
    )
  }
  return <span className="text-3xl leading-none">{flag || '🌐'}</span>
}

function VisaPill({ label }) {
  return (
    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-semibold text-green-700 ring-1 ring-green-600/15 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-400/20">
      {label}
    </span>
  )
}

function CountryCard({ c }) {
  const href = c.code ? `/countries/${c.code.toLowerCase()}` : null
  const types = c.visaTypes || []
  const cls = 'group flex items-center gap-3.5 rounded-xl border border-navy-800/10 bg-white p-3.5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-green-600/40 hover:shadow-md dark:border-white/10 dark:bg-navy-800'
  const inner = (
    <>
      <CountryFlag code={c.code} flag={c.flag} name={c.name} className="h-10 w-14" />
      <div className="min-w-0 flex-1">
        <div className="truncate font-heading text-[15px] font-semibold text-navy-900 dark:text-white">{c.name}</div>
        {types.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {types.slice(0, 3).map((t) => <VisaPill key={t} label={t} />)}
            {types.length > 3 && <VisaPill label={`+${types.length - 3}`} />}
          </div>
        )}
      </div>
      {href && <ArrowRight size={16} className="shrink-0 text-navy-800/30 transition group-hover:translate-x-0.5 group-hover:text-green-600 dark:text-white/30" />}
    </>
  )
  return href
    ? <Link href={href} className={cls}>{inner}</Link>
    : <div className={cls}>{inner}</div>
}

function Countries({ countries, copy }) {
  if (!countries.length) return null
  return (
    <Section id="countries" center eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {countries.map((c) => <CountryCard key={c.id || c.name} c={c} />)}
      </div>
    </Section>
  )
}

function Spotlight({ cards, copy }) {
  if (!cards.length) return null
  return (
    <Section id="study-abroad" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <div className="grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <div key={card.label} className="group overflow-hidden rounded-2xl border border-navy-800/10 shadow-sm transition hover:shadow-xl dark:border-white/10">
            <div className="overflow-hidden"><img src={card.image?.url || card.img} alt={card.label} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" /></div>
            <div className="bg-white p-6 dark:bg-navy-800">
              <h3 className="font-heading text-xl font-bold text-navy-900 dark:text-white">{card.label}</h3>
              <p className="mt-2 text-sm text-navy-800/70 dark:text-gray-300">{card.copy}</p>
              <Link href={card.href || '/contact'} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 transition hover:gap-2.5 hover:text-green-700">{card.linkLabel || 'Explore Options'} <ArrowRight size={15} /></Link>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function ProcessTimeline({ steps, copy }) {
  return (
    <Section center bg="bg-gray-50 dark:bg-navy-900/40" eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <div className="relative grid grid-cols-2 gap-y-12 md:grid-cols-4">
        <div className="absolute left-[12.5%] right-[12.5%] top-8 hidden h-0.5 bg-linear-to-r from-navy-800/20 via-green-600/40 to-navy-800/20 md:block" />
        {steps.map((p, i) => {
          const Icon = iconByName(p.icon)
          return (
            <div key={p.id || p.title} className="relative flex flex-col items-center text-center">
              <div className={`grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg ${i % 2 === 0 ? 'bg-navy-800' : 'bg-green-600'}`}><Icon size={24} /></div>
              <span className="mt-4 text-xs font-bold uppercase tracking-wider text-green-600">Step {i + 1}</span>
              <p className="mt-1 text-sm font-semibold text-navy-900 dark:text-white">{p.title}</p>
            </div>
          )
        })}
      </div>
    </Section>
  )
}

function SuccessStories({ testimonials, copy }) {
  return (
    <Section id="success" center eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((s) => (
          <div key={s.id || s.name} className="flex flex-col rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm transition hover:shadow-lg dark:border-white/10 dark:bg-navy-800">
            <div className="mb-3 flex gap-0.5 text-green-500">
              {Array.from({ length: Math.max(1, Math.min(5, s.rating || 5)) }).map((_, i) => <Star key={i} size={15} fill="currentColor" strokeWidth={0} />)}
            </div>
            <p className="flex-1 text-navy-800/80 dark:text-gray-200">&ldquo;{s.quote}&rdquo;</p>
            <div className="mt-5 flex items-center gap-3 border-t border-navy-800/10 pt-4 dark:border-white/10">
              {(s.photo?.url || typeof s.photo === 'string') && <img src={s.photo?.url || s.photo} alt={s.name} className="h-11 w-11 rounded-full object-cover" />}
              <div>
                <p className="font-semibold text-navy-900 dark:text-white">{s.name}</p>
                <p className="text-xs font-medium text-green-600">{s.destination}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="py-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 text-left">
        <span className="font-semibold text-navy-900 dark:text-white">{faq.question}</span>
        <ChevronDown size={18} className={`shrink-0 text-green-600 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-2 text-sm text-navy-800/70 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: faq.answer || '' }} />}
    </div>
  )
}

function Faqs({ faqs, copy }) {
  if (!faqs.length) return null
  return (
    <Section id="faqs" center eyebrow={copy.eyebrow} title={copy.title} subtitle={copy.subtitle}>
      <div className="mx-auto max-w-3xl divide-y divide-navy-800/10 dark:divide-white/10">
        {faqs.map((f) => <FaqItem key={f.id || f.question} faq={f} />)}
      </div>
    </Section>
  )
}

function PageHeader({ crumb, title, subtitle }) {
  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 -bottom-24 h-72 w-72 rounded-full bg-navy-700/40 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-20">
        {crumb && (
          <p className="text-xs font-semibold uppercase tracking-wider text-green-400">
            <Link href="/" className="hover:text-green-300">Home</Link> <span className="text-white/40">/</span> {crumb}
          </p>
        )}
        <h1 className="mt-2 font-heading text-4xl font-bold md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 max-w-xl text-white/70">{subtitle}</p>}
      </div>
    </section>
  )
}

function PageBody({ html }) {
  if (!html) return null
  return (
    <div className="mx-auto max-w-7xl px-6 pt-14">
      <div
        className="max-w-3xl space-y-4 leading-relaxed text-navy-800/80 dark:text-gray-300 [&_a]:text-green-600 [&_h2]:mt-6 [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-navy-900 [&_ul]:list-disc [&_ul]:pl-6 dark:[&_h2]:text-white"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}

function ContactSection({ contact, formCfg }) {
  const email = contact.email || 'rihlaglobalofficail@gmail.com'
  const phone = contact.phone || '+92 324 3799558'
  const address = [contact.addressLine1, contact.addressLine2, contact.city, contact.country].filter(Boolean).join(', ') || 'Office No. 02, 2nd Floor, Naseem Arcade, I-9 Markaz, Islamabad, Pakistan'
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-heading text-2xl font-bold text-navy-900 dark:text-white">Get in touch</h2>
          <p className="mt-2 text-navy-800/70 dark:text-gray-300">Book a free consultation or reach us directly — we respond within 24 hours.</p>
          <ul className="mt-6 space-y-4 text-sm">
            <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-800 text-green-400"><Mail size={17} /></span><a href={`mailto:${email}`} className="font-medium text-navy-900 dark:text-white">{email}</a></li>
            <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-800 text-green-400"><Phone size={17} /></span><span className="font-medium text-navy-900 dark:text-white">{phone}</span></li>
            <li className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-800 text-green-400"><MapPin size={17} /></span><span className="font-medium text-navy-900 dark:text-white">{address}</span></li>
          </ul>
          {contact.mapEmbedUrl && (
            <iframe src={contact.mapEmbedUrl} title="Location map" className="mt-6 h-56 w-full rounded-2xl border border-navy-800/10" loading="lazy" />
          )}
        </div>
        <div className="lg:justify-self-end">
          <ConsultationForm cfg={formCfg} />
        </div>
      </div>
    </section>
  )
}

const DEFAULT_VISA_ICON = { Student: 'GraduationCap', Work: 'Briefcase', Tourist: 'Plane', Business: 'Building2', PR: 'FileCheck2' }

function CountryDetail({ country, services, steps, copy, shown }) {
  const types = country.visaTypes?.length ? country.visaTypes : ['Student', 'Work', 'Tourist']
  const serviceFor = (type) => services.find((s) => (s.title || '').toLowerCase().includes(type.toLowerCase()))
  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="pointer-events-none absolute -right-32 -top-24 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 -bottom-24 h-72 w-72 rounded-full bg-navy-700/40 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-6 py-14 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-400">
            <Link href="/" className="hover:text-green-300">Home</Link> <span className="text-white/40">/</span>{' '}
            <Link href="/countries" className="hover:text-green-300">Countries</Link> <span className="text-white/40">/</span> {country.name}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <CountryFlag code={country.code} flag={country.flag} name={country.name} className="h-9 w-12 md:h-10 md:w-14" />
            <h1 className="font-heading text-4xl font-bold md:text-5xl">{country.name}</h1>
          </div>
          <p className="mt-3 max-w-2xl text-white/70">{country.blurb || `Visa categories we process for ${country.name} — with full eligibility assessment, documentation and filing support.`}</p>
        </div>
      </section>

      <Section center eyebrow="What we handle" title={`Visas for ${country.name}`} subtitle="Pick your visa category — we manage the entire process end to end.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {types.map((type) => {
            const svc = serviceFor(type)
            const Icon = iconByName(svc?.icon || DEFAULT_VISA_ICON[type] || 'Sparkles')
            const title = svc?.title || `${type} Visa`
            const desc = svc?.shortDescription || `Complete ${type.toLowerCase()} visa assistance for ${country.name} — eligibility, documents and filing.`
            return (
              <div key={type} className="flex flex-col rounded-2xl border border-navy-800/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-green-600/30 hover:shadow-xl dark:border-white/10 dark:bg-navy-800">
                <IconBadge Icon={Icon} />
                <h3 className="mt-4 font-heading font-semibold text-navy-900 dark:text-white">{title}</h3>
                <p className="mt-1.5 flex-1 text-sm text-navy-800/70 dark:text-gray-300">{desc}</p>
                {svc?.bullets?.length ? (
                  <ul className="mt-3 space-y-1.5">
                    {svc.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-navy-800/70 dark:text-gray-300"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-green-500" /> {b}</li>
                    ))}
                  </ul>
                ) : null}
                <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 self-start text-sm font-semibold text-green-600 transition hover:gap-2.5 hover:text-green-700">Start application <ArrowRight size={15} /></Link>
              </div>
            )
          })}
        </div>
      </Section>

      {shown('process') && <ProcessTimeline steps={steps} copy={copy('process')} />}
      {shown('cta') && <CTA copy={copy('cta')} />}
    </>
  )
}

function CTA({ copy }) {
  return (
    <section className="px-6 py-10">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-linear-to-br from-navy-800 to-navy-900 px-6 py-16 text-center text-white ring-1 ring-white/10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-green-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-green-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">{copy.title}</h2>
          {copy.subtitle && <p className="mx-auto mt-3 max-w-md text-white/70">{copy.subtitle}</p>}
          <QuickContactForm />
        </div>
      </div>
    </section>
  )
}

const SOCIAL_LABELS = { facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', tiktok: 'TikTok', x: 'X' }

function Footer({ brand, contact, socials, pages }) {
  const email = contact.email || 'rihlaglobalofficail@gmail.com'
  const phone = contact.phone || '+92 324 3799558'
  const address = [contact.addressLine1, contact.addressLine2, contact.city, contact.country].filter(Boolean).join(', ') || 'Office No. 02, 2nd Floor, Naseem Arcade, I-9 Markaz, Islamabad, Pakistan'
  const socialLinks = Object.entries(SOCIAL_LABELS).filter(([k]) => socials[k]).map(([k, label]) => ({ label, url: socials[k] }))
  const officeLabel = contact.city ? `${contact.city} Office` : 'Head Office'
  return (
    <footer id="contact" className="scroll-mt-24 bg-navy-900 pt-16 text-white/80">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-6 pb-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5">
            <img src="/Rihla logo.png" alt={brand.name} className="h-12 w-12 object-contain" />
            <div className="leading-tight">
              <div className="font-heading text-lg font-bold text-white">{brand.name}</div>
              <div className="text-[11px] font-medium tracking-wide text-white/60">{brand.tagline}</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-white/70">Premium visa and immigration consultancy trusted across 50+ countries.</p>
          {socialLinks.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {socialLinks.map(({ label, url }) => (
                <a key={label} href={url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80 transition hover:bg-green-600 hover:text-white">{label}</a>
              ))}
            </div>
          )}
        </div>
        <div>
          <h4 className="mb-4 font-heading font-semibold text-white">Quick Links</h4>
          <ul className="space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => <li key={l.href}><Link href={l.href} className="text-white/70 transition hover:text-green-400">{l.label}</Link></li>)}
            {pages.filter((p) => p.slug !== 'about').map((p) => <li key={p.slug}><Link href={`/${p.slug}`} className="text-white/70 transition hover:text-green-400">{p.title}</Link></li>)}
          </ul>
        </div>
        <div>
          <h4 className="mb-4 font-heading font-semibold text-white">Newsletter</h4>
          <p className="mb-3 text-sm text-white/70">Visa updates and tips, straight to your inbox.</p>
          <NewsletterForm />
        </div>
        <div className="col-span-2 md:col-span-1">
          <h4 className="mb-4 font-heading font-semibold text-white">Contact</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-green-400"><Phone size={15} /></span>
              <a href={`tel:${phone.replace(/[^\d+]/g, '')}`} className="text-white/80 transition hover:text-green-400">{phone}</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-green-400"><Mail size={15} /></span>
              <a href={`mailto:${email}`} className="break-all text-white/80 transition hover:text-green-400">{email}</a>
            </li>
            <li className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-green-400"><MapPin size={15} /></span>
              <div>
                <div className="font-semibold text-white">{officeLabel}</div>
                <div className="mt-0.5 leading-relaxed text-white/60">{address}</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">© {new Date().getFullYear()} {brand.name} {brand.tagline}. All rights reserved.</div>
    </footer>
  )
}

function FloatingButtons({ waNumber, waEnabled, chatEnabled }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {chatEnabled && <ChatWidget waNumber={waNumber} />}
      {waEnabled && (
        <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noreferrer" className="grid h-12 w-12 place-items-center rounded-full bg-green-500 text-white shadow-lg" aria-label="WhatsApp"><Phone size={20} /></a>
      )}
    </div>
  )
}

export default function SiteContent({ data, page = 'home', slug }) {
  const [dark, setDark] = useTheme()
  const s = data.settings || {}
  const brand = { name: s.brandName || 'Rihla Global', tagline: s.tagline || 'Visa Consultant Pvt. Ltd.' }
  const hero = s.hero || {}
  const formCfg = s.forms || {}
  const contact = s.contact || {}
  const socials = s.socials || {}
  const waNumber = s.whatsapp?.number || contact.whatsapp || '923243799558'
  const waEnabled = s.whatsapp?.enabled !== false

  const services = data.services?.length ? data.services : DEFAULT_SERVICES
  const features = data.features?.length ? data.features : DEFAULT_FEATURES
  const steps = data.process?.length ? data.process : DEFAULT_PROCESS
  const stats = data.stats?.length ? data.stats : DEFAULT_STATS
  const testimonials = data.testimonials?.length ? data.testimonials : DEFAULT_TESTIMONIALS
  const faqs = data.faqs || []
  const countries = data.countries || []
  const pages = data.pages || []
  const aboutPage = pages.find((p) => p.slug === 'about')
  const legalPage = page === 'page' ? pages.find((p) => p.slug === slug) : null
  const countryDoc = page === 'country' ? countries.find((c) => (c.code || '').toLowerCase() === (slug || '').toLowerCase()) : null

  // Section heading copy: CMS row when present, shipped default otherwise.
  const copy = (key) => sectionCopy(data.sections, key)
  const shown = (key) => copy(key).isVisible
  const spotlightCards = data.spotlight?.length ? data.spotlight : SPOTLIGHT_DEFAULTS

  return (
    <div className="min-h-screen bg-white font-body text-ink dark:bg-navy-900">
      <Navbar dark={dark} setDark={setDark} brand={brand} pages={pages} />

      {page === 'home' && (
        <>
          <Hero hero={hero} formCfg={formCfg} />
          <StatsBar stats={stats} />
          {shown('services') && <VisaServices services={services} copy={copy('services')} />}
          {shown('features') && <WhyChooseUs features={features} copy={copy('features')} />}
          {shown('countries') && <Countries countries={countries} copy={copy('countries')} />}
          {shown('spotlight') && <Spotlight cards={spotlightCards} copy={copy('spotlight')} />}
          {shown('process') && <ProcessTimeline steps={steps} copy={copy('process')} />}
          {shown('testimonials') && <SuccessStories testimonials={testimonials} copy={copy('testimonials')} />}
          {shown('faqs') && <Faqs faqs={faqs} copy={copy('faqs')} />}
          {shown('cta') && <CTA copy={copy('cta')} />}
        </>
      )}

      {page === 'about' && (
        <>
          <PageHeader crumb="About" title={aboutPage?.title || 'About Us'} subtitle="A decade of trusted, transparent visa expertise behind every application." />
          <PageBody html={aboutPage?.content} />
          {shown('features') && <WhyChooseUs features={features} copy={copy('features')} />}
          {shown('cta') && <CTA copy={copy('cta')} />}
        </>
      )}

      {page === 'services' && (
        <>
          <PageHeader crumb="Services" title="Our Services" subtitle="Specialized support across every visa category." />
          {shown('services') && <VisaServices services={services} copy={copy('services')} />}
          {shown('spotlight') && <Spotlight cards={spotlightCards} copy={copy('spotlight')} />}
          {shown('process') && <ProcessTimeline steps={steps} copy={copy('process')} />}
          {shown('cta') && <CTA copy={copy('cta')} />}
        </>
      )}

      {page === 'countries' && (
        <>
          <PageHeader crumb="Countries" title="Countries We Cover" subtitle="Trusted for visas to top destinations worldwide." />
          {shown('countries') && <Countries countries={countries} copy={copy('countries')} />}
          {shown('cta') && <CTA copy={copy('cta')} />}
        </>
      )}

      {page === 'success' && (
        <>
          <PageHeader crumb="Success" title="Success Stories" subtitle="Real approvals from clients who trusted us with their journey." />
          {shown('testimonials') && <SuccessStories testimonials={testimonials} copy={copy('testimonials')} />}
          {shown('faqs') && <Faqs faqs={faqs} copy={copy('faqs')} />}
          {shown('cta') && <CTA copy={copy('cta')} />}
        </>
      )}

      {page === 'contact' && (
        <>
          <PageHeader crumb="Contact" title="Contact Us" subtitle="We respond to every enquiry within 24 hours." />
          <ContactSection contact={contact} formCfg={formCfg} />
        </>
      )}

      {page === 'page' && legalPage && (
        <>
          <PageHeader crumb={legalPage.title} title={legalPage.title} />
          <PageBody html={legalPage.content} />
          {shown('cta') && <CTA copy={copy('cta')} />}
        </>
      )}

      {page === 'country' && countryDoc && (
        <CountryDetail country={countryDoc} services={services} steps={steps} copy={copy} shown={shown} />
      )}

      <Footer brand={brand} contact={contact} socials={socials} pages={pages} />
      <FloatingButtons waNumber={waNumber} waEnabled={waEnabled} chatEnabled={data.chatEnabled} />
    </div>
  )
}
