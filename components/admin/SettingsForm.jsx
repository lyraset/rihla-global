'use client'

import { useActionState } from 'react'
import { SETTINGS_SECTIONS } from '../../lib/cms/settings-fields.js'
import { saveSettingsAction } from '../../actions/settings.js'

const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj)

const inputClass =
  'w-full rounded-lg border border-navy-800/15 px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20'

function resolve(settings, f) {
  const v = getPath(settings, f.name)
  if (f.type === 'stringlist') return Array.isArray(v) ? v.join('\n') : ''
  if (f.type === 'boolean') return Boolean(v)
  // Images are stored as a media subdocument; the form edits just its URL.
  if (f.type === 'image') return v?.url ?? ''
  return v ?? ''
}

function SettingField({ f, value }) {
  if (f.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-navy-800 sm:col-span-2">
        <input type="checkbox" name={f.name} defaultChecked={value} className="h-4 w-4 rounded border-navy-800/30 accent-green-600" />
        {f.label}
      </label>
    )
  }
  const wide = f.type === 'textarea' || f.type === 'stringlist'
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-navy-800">{f.label}</label>
      {wide ? (
        <textarea id={f.name} name={f.name} rows={3} defaultValue={value} className={inputClass} />
      ) : (
        <input
          id={f.name}
          name={f.name}
          type={f.type === 'image' ? 'url' : 'text'}
          placeholder={f.placeholder}
          defaultValue={value}
          className={inputClass}
        />
      )}
      {f.type === 'image' && value && (
        <img src={value} alt="" className="mt-2 h-24 w-full rounded-lg object-cover ring-1 ring-navy-800/10" />
      )}
      {f.help && <p className="mt-1 text-xs text-navy-800/50">{f.help}</p>}
    </div>
  )
}

export default function SettingsForm({ settings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, {})

  return (
    <form action={action} className="space-y-6 pb-20">
      {SETTINGS_SECTIONS.map((section) => (
        <section key={section.title} className="rounded-2xl border border-navy-800/10 bg-white p-6">
          <h2 className="mb-4 font-heading font-semibold text-navy-900">{section.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((f) => (
              <SettingField key={f.name} f={f} value={resolve(settings, f)} />
            ))}
          </div>
        </section>
      ))}
      <div className="sticky bottom-0 -mx-6 flex items-center gap-3 border-t border-navy-800/10 bg-gray-50/95 px-6 py-3 backdrop-blur">
        <button type="submit" disabled={pending} className="rounded-lg bg-green-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70">
          {pending ? 'Saving…' : 'Save settings'}
        </button>
        {state?.ok && <span className="text-sm font-medium text-green-600">Saved ✓</span>}
        {state?.error && <span role="alert" className="text-sm font-medium text-red-600">{state.error}</span>}
      </div>
    </form>
  )
}
