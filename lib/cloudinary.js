import { v2 as cloudinary } from 'cloudinary'
import { env, flags } from './env.js'

if (flags.hasCloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export { cloudinary }

export function assertCloudinary() {
  if (!flags.hasCloudinary) {
    throw new Error('Cloudinary is not configured. Set CLOUDINARY_* env vars (see .env.example).')
  }
}

/** Signed params for a direct browser→Cloudinary upload (never proxy files). */
export function signUploadParams({ folder, publicId, tags } = {}) {
  assertCloudinary()
  const timestamp = Math.round(Date.now() / 1000)
  const toSign = { timestamp, folder: folder || env.CLOUDINARY_UPLOAD_FOLDER }
  if (publicId) toSign.public_id = publicId
  if (tags) toSign.tags = Array.isArray(tags) ? tags.join(',') : tags
  const signature = cloudinary.utils.api_sign_request(toSign, env.CLOUDINARY_API_SECRET)
  return {
    ...toSign,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
  }
}

/** Server-side upload from a URL (used by the migration script). */
export async function uploadUrl(url, opts = {}) {
  assertCloudinary()
  return cloudinary.uploader.upload(url, {
    folder: env.CLOUDINARY_UPLOAD_FOLDER,
    resource_type: 'auto',
    ...opts,
  })
}

export async function deleteAsset(publicId, resourceType = 'image') {
  assertCloudinary()
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
}

/** Tiny blurred base64 for next/image `placeholder="blur"`. */
export async function getBlurDataURL(publicId) {
  if (!flags.hasCloudinary) return undefined
  try {
    const url = cloudinary.url(publicId, {
      secure: true,
      format: 'webp',
      transformation: [{ width: 16, quality: 1, effect: 'blur:1000' }],
    })
    const res = await fetch(url)
    const buf = Buffer.from(await res.arrayBuffer())
    return `data:image/webp;base64,${buf.toString('base64')}`
  } catch {
    return undefined
  }
}

export function buildUrl(publicId, transforms = {}) {
  return cloudinary.url(publicId, { secure: true, ...transforms })
}
