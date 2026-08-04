import { normalisePath } from './routes.js'

/**
 * Turns the flat SEO table submission into `[{ path, doc }]`.
 *
 * Rows are namespaced `<field>::<path>` so one <form> can carry every route
 * (HTML forbids nesting them). Kept free of Next/DB imports so it can be
 * exercised directly.
 *
 * @param {FormData} formData
 * @param {Iterable<string>} allowedPaths paths the site actually serves
 */
export function parseSeoFormData(formData, allowedPaths) {
  const allowed = new Set([...allowedPaths].map(normalisePath))
  const str = (key) => String(formData.get(key) ?? '').trim()

  const paths = [
    ...new Set(
      formData
        .getAll('__path')
        .map((p) => normalisePath(p))
        .filter((p) => allowed.has(p)),
    ),
  ]

  return paths.map((path) => {
    const keywords = str(`keywords::${path}`)
    return {
      path,
      doc: {
        metaTitle: str(`metaTitle::${path}`),
        metaDescription: str(`metaDescription::${path}`),
        ogTitle: str(`ogTitle::${path}`),
        ogDescription: str(`ogDescription::${path}`),
        ogImageUrl: str(`ogImageUrl::${path}`),
        canonicalUrl: str(`canonicalUrl::${path}`),
        keywords: keywords
          ? keywords.split(',').map((k) => k.trim()).filter(Boolean)
          : [],
        noindex: formData.get(`noindex::${path}`) === 'on',
        nofollow: formData.get(`nofollow::${path}`) === 'on',
      },
    }
  })
}
