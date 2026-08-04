'use client'

import { useActionState, useState } from 'react'
import { ChevronDown, ExternalLink } from 'lucide-react'
import { saveSeoAction } from '../../actions/seo.js'

const TITLE_MAX = 60
const DESC_MAX = 160

const inputClass =
  'w-full rounded-lg border border-navy-800/15 px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20'

/** Character budget hint — green under the limit, amber close to it, red over. */
function Counter({ value, max }) {
  const n = (value || '').length
  const tone =
    n === 0 ? 'text-navy-800/40' : n > max ? 'text-red-600' : n > max - 10 ? 'text-amber-600' : 'text-green-600'
  return (
    <span className={`text-[11px] font-medium tabular-nums ${tone}`}>
      {n}/{max}
    </span>
  )
}

function RouteCard({ route, override }) {
  const p = route.path
  const [title, setTitle] = useState(override?.metaTitle || '')
  const [desc, setDesc] = useState(override?.metaDescription || '')
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-navy-800/10 bg-white p-4 shadow-sm">
      <input type="hidden" name="__path" value={p} />

      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <span className="font-heading text-sm font-bold text-navy-900">{route.label}</span>
          <code className="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-navy-800/70">{p}</code>
        </div>
        <a
          href={p}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] font-medium text-green-700 hover:underline"
        >
          View <ExternalLink size={11} />
        </a>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor={`t-${p}`} className="text-sm font-medium text-navy-800">Meta title</label>
            <Counter value={title} max={TITLE_MAX} />
          </div>
          <input
            id={`t-${p}`}
            name={`metaTitle::${p}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={route.defaultTitle || ''}
            className={inputClass}
          />
        </div>
        <div>
          <div className="mb-1 flex items-baseline justify-between">
            <label htmlFor={`d-${p}`} className="text-sm font-medium text-navy-800">Meta description</label>
            <Counter value={desc} max={DESC_MAX} />
          </div>
          <textarea
            id={`d-${p}`}
            name={`metaDescription::${p}`}
            rows={2}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={route.defaultDescription || 'No description set — search engines will pick their own snippet.'}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-navy-800/60 hover:text-navy-900"
      >
        <ChevronDown size={13} className={`transition ${open ? 'rotate-180' : ''}`} />
        Social & indexing
      </button>

      {open && (
        <div className="mt-3 grid gap-3 border-t border-navy-800/10 pt-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-800">Social title (OG)</label>
            <input name={`ogTitle::${p}`} defaultValue={override?.ogTitle || ''} placeholder="Defaults to meta title" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-800">Social description (OG)</label>
            <input name={`ogDescription::${p}`} defaultValue={override?.ogDescription || ''} placeholder="Defaults to meta description" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-800">Social image URL</label>
            <input name={`ogImageUrl::${p}`} type="url" defaultValue={override?.ogImageUrl || ''} placeholder="https://…" className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-navy-800">Canonical URL</label>
            <input name={`canonicalUrl::${p}`} type="url" defaultValue={override?.canonicalUrl || ''} placeholder="Defaults to this page's own URL" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-navy-800">Keywords</label>
            <input name={`keywords::${p}`} defaultValue={(override?.keywords || []).join(', ')} placeholder="Comma separated" className={inputClass} />
          </div>
          <div className="flex flex-wrap gap-5 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-navy-800">
              <input type="checkbox" name={`noindex::${p}`} defaultChecked={Boolean(override?.noindex)} className="h-4 w-4 rounded border-navy-800/30 accent-green-600" />
              Hide from search engines (noindex)
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-navy-800">
              <input type="checkbox" name={`nofollow::${p}`} defaultChecked={Boolean(override?.nofollow)} className="h-4 w-4 rounded border-navy-800/30 accent-green-600" />
              Don&apos;t follow links (nofollow)
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SeoForm({ groups, overrides }) {
  const [state, action, pending] = useActionState(saveSeoAction, {})

  return (
    <form action={action} className="space-y-7 pb-24">
      {groups.map((g) => (
        <section key={g.group}>
          <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wide text-navy-800/50">
            {g.group} <span className="ml-1 font-sans text-[11px] normal-case tracking-normal">({g.routes.length})</span>
          </h2>
          <div className="space-y-3">
            {g.routes.map((r) => (
              <RouteCard key={r.path} route={r} override={overrides[r.path]} />
            ))}
          </div>
        </section>
      ))}

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-navy-800/10 bg-white/95 px-6 py-3 backdrop-blur lg:left-64">
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70"
          >
            {pending ? 'Saving…' : 'Save all SEO'}
          </button>
          {state?.ok && (
            <span className="text-sm font-medium text-green-700">Saved {state.saved} page{state.saved === 1 ? '' : 's'}.</span>
          )}
          {state?.error && <span role="alert" className="text-sm font-medium text-red-600">{state.error}</span>}
        </div>
      </div>
    </form>
  )
}
