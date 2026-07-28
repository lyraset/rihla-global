/**
 * Pull the current Unsplash placeholder images into Cloudinary, create Media
 * documents, and attach them to the relevant records (hero, testimonials).
 * Idempotent — Cloudinary public_ids are deterministic and Media is upserted.
 *
 *   npm run migrate:images        (requires CLOUDINARY_* env vars)
 */
import mongoose from 'mongoose'
import { connectDB } from '../lib/db.js'
import { flags } from '../lib/env.js'
import { uploadUrl, getBlurDataURL } from '../lib/cloudinary.js'
import { registerMedia } from '../services/media.js'
import { SiteSettings } from '../models/SiteSettings.js'
import { Testimonial } from '../models/Testimonial.js'

const IMAGES = {
  hero: { url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1200&q=70', folder: 'rihla/hero', alt: 'Aircraft wing above the clouds' },
  team: { url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=70', folder: 'rihla/team', alt: 'Rihla Global consultant team in a meeting' },
  study: { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=70', folder: 'rihla/services', alt: 'Students studying abroad' },
  work: { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=70', folder: 'rihla/services', alt: 'Professionals working abroad' },
}

const TESTIMONIAL_PHOTOS = {
  'Aisha R.': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=70',
  'Daniel K.': 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=70',
  'Meera S.': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=70',
}

async function push(url, { folder, alt }) {
  const res = await uploadUrl(url, { folder })
  const blurDataURL = await getBlurDataURL(res.public_id)
  await registerMedia({
    publicId: res.public_id,
    url: res.url,
    secureUrl: res.secure_url,
    resourceType: res.resource_type,
    format: res.format,
    bytes: res.bytes,
    width: res.width,
    height: res.height,
    folder,
    originalFilename: res.original_filename,
    alt,
    blurDataURL,
  })
  return { publicId: res.public_id, url: res.secure_url, alt, width: res.width, height: res.height, blurDataURL }
}

async function main() {
  if (!flags.hasCloudinary) {
    console.error('Cloudinary is not configured. Set CLOUDINARY_* in .env.local first.')
    process.exit(1)
  }
  await connectDB()
  console.log('Migrating placeholder images into Cloudinary…')

  const mapping = {}
  for (const [key, spec] of Object.entries(IMAGES)) {
    mapping[key] = await push(spec.url, spec)
    console.log(`  ✓ ${key} → ${mapping[key].publicId}`)
  }

  // Attach hero background to site settings
  await SiteSettings.updateOne({ key: 'main' }, { $set: { 'hero.backgroundImage': mapping.hero } })

  // Attach testimonial photos by name
  for (const [name, url] of Object.entries(TESTIMONIAL_PHOTOS)) {
    const ref = await push(url, { folder: 'rihla/testimonials', alt: `${name} portrait` })
    await Testimonial.updateOne({ name }, { $set: { photo: ref } })
    console.log(`  ✓ testimonial ${name} → ${ref.publicId}`)
  }

  console.log('\nMapping (use these publicIds in the CMS):')
  console.table(
    Object.fromEntries(Object.entries(mapping).map(([k, v]) => [k, v.publicId])),
  )

  await mongoose.connection.close()
  console.log('Done. No Unsplash URLs remain in the database.')
  process.exit(0)
}

main().catch((err) => {
  console.error('Image migration failed:', err)
  process.exit(1)
})
