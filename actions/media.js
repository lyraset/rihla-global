'use server'

import { requireAdmin } from '../lib/session.js'
import { registerMedia } from '../services/media.js'
import { getBlurDataURL } from '../lib/cloudinary.js'
import { revalidateTags, CACHE_TAGS } from '../lib/cache.js'

/**
 * Persist a Cloudinary upload as a Media document (called by the admin
 * ImageUploader after a successful direct upload). Admin-only.
 */
export async function registerMediaAction(res) {
  await requireAdmin()
  const blurDataURL =
    res.resource_type === 'image' ? await getBlurDataURL(res.public_id) : undefined

  const doc = await registerMedia({
    publicId: res.public_id,
    url: res.url,
    secureUrl: res.secure_url,
    resourceType: res.resource_type,
    format: res.format,
    bytes: res.bytes,
    width: res.width,
    height: res.height,
    pages: res.pages,
    folder: res.folder,
    originalFilename: res.original_filename,
    blurDataURL,
  })
  revalidateTags([CACHE_TAGS.media])
  return { ok: true, data: doc.toJSON() }
}
