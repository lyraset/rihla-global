import { z } from 'zod'

// Version-agnostic primitives (avoids Zod v3/v4 churn around .email()/.url()).
const email = z
  .string()
  .trim()
  .toLowerCase()
  .refine((v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v), { message: 'Invalid email address' })

const name = z.string().trim().min(1, 'Name is required').max(120)
const phone = z.string().trim().min(6, 'Invalid phone number').max(20)

const utm = z
  .object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  })
  .partial()
  .optional()

const source = z
  .object({
    page: z.string().max(256).optional(),
    referrer: z.string().max(512).optional(),
    utm,
  })
  .optional()

// Shared across every public submission.
const base = {
  website: z.string().optional(), // honeypot — must be empty
  turnstileToken: z.string().optional(),
  source,
}

export const consultationSchema = z.object({
  type: z.literal('consultation'),
  name,
  email,
  phone,
  visaType: z.enum(['Student', 'Work', 'Tourist', 'Business']),
  message: z.string().max(2000).optional(),
  ...base,
})

export const contactSchema = z.object({
  type: z.literal('contact'),
  name,
  email,
  phone: z.string().max(20).optional(),
  message: z.string().max(2000).optional(),
  ...base,
})

export const newsletterSchema = z.object({
  type: z.literal('newsletter'),
  email,
  ...base,
})

/** The single public payload accepted by POST /api/leads. */
export const leadSchema = z.discriminatedUnion('type', [
  consultationSchema,
  contactSchema,
  newsletterSchema,
])

/** Flatten a ZodError into `{ field: message }` for the API envelope. */
export function fieldErrors(zodError) {
  const out = {}
  for (const issue of zodError.issues) {
    const key = issue.path.join('.') || '_'
    if (!out[key]) out[key] = issue.message
  }
  return out
}
