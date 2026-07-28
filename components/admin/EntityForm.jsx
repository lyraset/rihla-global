'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { saveEntityAction } from '../../actions/cms.js'

const inputClass =
  'w-full rounded-lg border border-navy-800/15 px-3.5 py-2.5 text-sm text-navy-900 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20'

function Field({ f, value, error }) {
  const label = (
    <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-navy-800">
      {f.label}
      {f.required && <span className="text-red-500"> *</span>}
    </label>
  )

  if (f.type === 'boolean') {
    return (
      <label className="flex items-center gap-2 text-sm font-medium text-navy-800">
        <input type="checkbox" name={f.name} defaultChecked={Boolean(value)} className="h-4 w-4 rounded border-navy-800/30 accent-green-600" />
        {f.label}
      </label>
    )
  }

  if (f.type === 'tags') {
    return (
      <div>
        {label}
        <div className="flex flex-wrap gap-3">
          {(f.options || []).map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm text-navy-800">
              <input type="checkbox" name={f.name} value={opt} defaultChecked={Array.isArray(value) && value.includes(opt)} className="h-4 w-4 rounded border-navy-800/30 accent-green-600" />
              {opt}
            </label>
          ))}
        </div>
        {f.help && <p className="mt-1 text-xs text-navy-800/50">{f.help}</p>}
      </div>
    )
  }

  let input
  if (f.type === 'textarea' || f.type === 'richtext' || f.type === 'stringlist') {
    input = <textarea id={f.name} name={f.name} rows={f.type === 'richtext' ? 6 : 3} defaultValue={value} className={inputClass} />
  } else if (f.type === 'number') {
    input = <input id={f.name} name={f.name} type="number" step="any" defaultValue={value} className={inputClass} />
  } else if (f.type === 'image') {
    input = <input id={f.name} name={f.name} type="url" defaultValue={value} placeholder="https://…" className={inputClass} />
  } else {
    input = <input id={f.name} name={f.name} type="text" defaultValue={value} className={inputClass} />
  }

  return (
    <div>
      {label}
      {input}
      {f.help && <p className="mt-1 text-xs text-navy-800/50">{f.help}</p>}
      {error && <p className="mt-1 text-xs font-medium text-red-600">{error}</p>}
    </div>
  )
}

export default function EntityForm({ collectionKey, id, fields, values, listHref }) {
  const [state, action, pending] = useActionState(saveEntityAction, {})
  const errors = state?.errors || {}

  return (
    <form action={action} className="max-w-2xl space-y-5">
      <input type="hidden" name="__collection" value={collectionKey} />
      <input type="hidden" name="__id" value={id} />
      {fields.map((f) => (
        <Field key={f.name} f={f} value={values[f.name]} error={errors[f.name]} />
      ))}
      {state?.error && <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={pending} className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-70">
          {pending ? 'Saving…' : 'Save'}
        </button>
        <Link href={listHref} className="rounded-lg border border-navy-800/15 px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:bg-gray-50">
          Cancel
        </Link>
      </div>
    </form>
  )
}
