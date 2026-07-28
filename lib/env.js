import { z } from 'zod'

/**
 * Central, build-safe environment access.
 *
 * Every key is optional or defaulted so `next build` never crashes on a missing
 * secret. Runtime consumers (connectDB, mailer, cloudinary, …) throw a readable
 * error only when a feature that genuinely needs a key is actually used.
 * The `flags` object lets integrations degrade gracefully in local dev.
 */
const schema = z.object({
  // Core
  NEXT_PUBLIC_SITE_URL: z.string().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // MongoDB
  MONGODB_URI: z.string().optional(),
  MONGODB_DB: z.string().default('rihla'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('rihla'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().optional(),

  // Auth
  AUTH_SECRET: z.string().optional(),
  AUTH_URL: z.string().optional(),
  ADMIN_SEED_EMAIL: z.string().optional(),
  ADMIN_SEED_PASSWORD: z.string().optional(),

  // WhatsApp
  WHATSAPP_BUSINESS_NUMBER: z.string().default('923243799558'),
  NEXT_PUBLIC_WHATSAPP_NUMBER: z.string().default('923243799558'),
  WHATSAPP_MODE: z.enum(['link', 'cloud_api']).default('link'),
  WHATSAPP_CLOUD_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_CLOUD_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_CLOUD_TEMPLATE_NAME: z.string().default('new_lead_alert'),
  WHATSAPP_GRAPH_VERSION: z.string().default('v21.0'),

  // Email
  RESEND_API_KEY: z.string().optional(),
  LEAD_NOTIFY_TO: z.string().optional(),
  LEAD_NOTIFY_FROM: z.string().default('noreply@rihlaglobal.com'),

  // Anti-spam
  TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),

  // Rate limiting
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Ops
  REVALIDATE_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables — see the errors above and .env.example')
}

export const env = parsed.data

/** Feature availability derived from which secrets are present. */
export const flags = {
  hasMongo: Boolean(env.MONGODB_URI),
  hasCloudinary: Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET),
  hasResend: Boolean(env.RESEND_API_KEY && env.LEAD_NOTIFY_TO),
  hasTurnstile: Boolean(env.TURNSTILE_SECRET_KEY),
  hasUpstash: Boolean(env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN),
  whatsappCloud:
    env.WHATSAPP_MODE === 'cloud_api' &&
    Boolean(env.WHATSAPP_CLOUD_PHONE_NUMBER_ID && env.WHATSAPP_CLOUD_ACCESS_TOKEN),
}
