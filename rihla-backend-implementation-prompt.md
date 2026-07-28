# Backend Implementation Prompt — Rihla Global (Next.js 16 + MongoDB + Cloudinary + Vercel)

> Paste this whole document as the task brief for the agent/developer building the backend.
> It is written to be executed against the **existing** frontend described in Section 1.

---

## 0. Role and objective

You are a senior full-stack engineer. You are taking an existing **static, presentational Next.js marketing site** and turning it into a **fully dynamic, database-backed product** with a complete admin CMS, media pipeline, lead capture with WhatsApp routing, and production-grade SEO — deployed on Vercel.

**Do not rewrite the visual design.** Every pixel, class name, animation, and layout of the current frontend must look identical after your work. You are replacing *where the data comes from*, not *how it looks*.

Deliver working, runnable code — not pseudocode, not a plan. Where a decision is genuinely ambiguous, pick the option marked **[DEFAULT]** in this document and note the choice in `DECISIONS.md`.

---

## 1. Current state of the codebase (what you are inheriting)

| Layer | Technology | Constraint |
|---|---|---|
| Framework | Next.js 16, App Router | Keep. Do not migrate to Pages Router. |
| UI | React 19, function components + hooks | Keep. |
| Language | **JavaScript (JSX)** — no TypeScript | **Keep JavaScript.** Do not introduce `.ts`/`.tsx`. Use JSDoc typedefs + Zod for type safety instead. |
| Styling | Tailwind CSS v4 via `@tailwindcss/postcss`, tokens in `@theme` | Keep. Do not add a component library. |
| Icons | `lucide-react` (components, not image files) | Keep. |
| Fonts | Google Fonts — Poppins + Inter, `@import` in CSS | Migrate to `next/font/google` for performance (see §11). |
| Lint | Oxlint | Keep; extend config to cover new folders. |
| Runtime | Node 25 | Pin in `package.json` `engines` and Vercel settings. |

**What exists today:**

- `app/layout.jsx` — the only server component. Sets metadata (title, description, favicon) and injects a pre-hydration theme script.
- `app/page.jsx` — a single `'use client'` component containing the **entire site**: ~15 sub-components (Navbar, Hero, forms, sections, footer) in one file.
- `app/globals.css` — Tailwind + design tokens (navy/green palette, fonts, fade-up animation).
- Route `/` is statically prerendered (`○ (Static)`), then hydrated. No data fetching anywhere.

**Hardcoded content constants in `page.jsx`:** `STATS`, `SERVICES`, `FEATURES`, `PROCESS`, `STORIES`, `NAV_LINKS`, `IMAGES`.

**Three dead forms** (each does `e.preventDefault(); setSubmitted(true)` with no network call):

| Form | Component | Fields |
|---|---|---|
| Consultation booking (hero) | `ConsultationForm` | name, email, visaType (Student/Work/Tourist/Business), phone |
| Quick contact (CTA band) | `QuickContactForm` | name, email |
| Newsletter (footer) | inline form | email |

**Known placeholders that must become CMS-managed:**

- Logo is a real local file: `public/Rihla logo.png`.
- **Every other image is an Unsplash hotlink** — hero, team, study/work cards, testimonial avatars.
- Floating buttons: a stub live-chat panel ("connect a live-chat provider here") and a WhatsApp link with a **hardcoded number `wa.me/15515586001`**.
- Footer contact details are placeholders (`info@rihlaglobal.com`, `+1 551…`, "500 Ebisu Street, Metro City").

---

## 2. Target architecture (the decisions, already made)

Implement the **co-located** shape — the backend lives inside this same Next.js app and deploys as Vercel serverless functions. Do **not** stand up a separate Express/Nest/FastAPI service.

```
Browser ──► Next.js (Vercel)
              ├── Public site  : Server Components, ISR + tag revalidation
              ├── /api/*       : Route Handlers (public write endpoints)
              ├── /admin/*     : Auth-gated CMS (React Server + Client Components)
              └── Server Actions for admin mutations
                      │
        ┌─────────────┼──────────────┬──────────────────┐
        ▼             ▼              ▼                  ▼
   MongoDB Atlas   Cloudinary    WhatsApp          Email (Resend)
   (all records)  (all media)   (lead routing)    (notify + autoreply)
```

**Locked-in stack additions:**

| Concern | Package / Service | Notes |
|---|---|---|
| Database | MongoDB Atlas + `mongoose` | Every persisted record goes here. Single global cached connection. |
| Media | Cloudinary (`cloudinary` Node SDK + `next-cloudinary`) | **Every** image, video, and PDF — uploads, downloads, and delivery. |
| Validation | `zod` | One schema per payload, shared by client form, API route, and server action. |
| Auth | `next-auth` v5 (Auth.js), Credentials provider, JWT strategy **[DEFAULT]** | Admin only. Sessions in httpOnly cookies. |
| Password hashing | `bcryptjs` | Cost factor 12. |
| Rate limiting | `@upstash/ratelimit` + `@upstash/redis` **[DEFAULT]** | Fall back to a Mongo TTL-collection limiter if Upstash is unavailable. |
| Bot defence | Honeypot field + Cloudflare Turnstile **[DEFAULT]** | Turnstile free tier; verify server-side. |
| Email | `resend` | Team notification + customer auto-reply. |
| Rich text | `@tiptap/react` (admin only) | Store as sanitized HTML; sanitize with `isomorphic-dompurify` on write. |
| Tables/forms in admin | `@tanstack/react-table`, `react-hook-form` + `@hookform/resolvers` | |
| Dates | `date-fns` | |
| Slugs | `slugify` | |
| Deployment | Vercel | `nodejs` runtime for anything touching Mongo/Cloudinary (**not** Edge). |

---

## 3. Environment variables

Create `.env.example` (committed) and `.env.local` (gitignored) with exactly these keys:

```bash
# ---- Core ----
NEXT_PUBLIC_SITE_URL=https://www.rihlaglobal.com
NODE_ENV=development

# ---- MongoDB ----
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/rihla?retryWrites=true&w=majority
MONGODB_DB=rihla

# ---- Cloudinary ----
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_UPLOAD_FOLDER=rihla
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=

# ---- Auth ----
AUTH_SECRET=              # openssl rand -base64 32
AUTH_URL=http://localhost:3000
ADMIN_SEED_EMAIL=
ADMIN_SEED_PASSWORD=

# ---- WhatsApp ----
WHATSAPP_BUSINESS_NUMBER=923243799558          # E.164 without '+', from 0324-3799558
NEXT_PUBLIC_WHATSAPP_NUMBER=923243799558
WHATSAPP_MODE=link                             # 'link' | 'cloud_api'
WHATSAPP_CLOUD_PHONE_NUMBER_ID=
WHATSAPP_CLOUD_ACCESS_TOKEN=
WHATSAPP_CLOUD_TEMPLATE_NAME=new_lead_alert
WHATSAPP_GRAPH_VERSION=v21.0

# ---- Email ----
RESEND_API_KEY=
LEAD_NOTIFY_TO=
LEAD_NOTIFY_FROM=noreply@rihlaglobal.com

# ---- Anti-spam ----
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=

# ---- Rate limiting ----
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ---- Revalidation ----
REVALIDATE_SECRET=
```

Add a startup guard: `lib/env.js` parses `process.env` through a Zod schema and throws a readable error at boot if a required key is missing.

---

## 4. Target folder structure

```
/
├── app/
│   ├── layout.jsx                 # root: fonts, JSON-LD, theme script, global metadata
│   ├── page.jsx                   # SERVER component now — fetches CMS content, composes sections
│   ├── globals.css
│   ├── sitemap.js                 # dynamic sitemap from DB
│   ├── robots.js
│   ├── manifest.js
│   ├── not-found.jsx
│   ├── error.jsx
│   ├── opengraph-image.jsx        # dynamic OG image (next/og)
│   │
│   ├── (site)/                    # public route group
│   │   ├── services/[slug]/page.jsx
│   │   ├── blog/page.jsx
│   │   ├── blog/[slug]/page.jsx
│   │   ├── contact/page.jsx
│   │   ├── privacy/page.jsx
│   │   └── terms/page.jsx
│   │
│   ├── admin/                     # auth-gated CMS
│   │   ├── layout.jsx             # session check + sidebar shell
│   │   ├── login/page.jsx
│   │   ├── page.jsx               # dashboard overview
│   │   ├── leads/page.jsx
│   │   ├── leads/[id]/page.jsx
│   │   ├── forms/page.jsx         # form builder
│   │   ├── forms/[id]/page.jsx
│   │   ├── content/
│   │   │   ├── services/page.jsx
│   │   │   ├── features/page.jsx
│   │   │   ├── process/page.jsx
│   │   │   ├── stats/page.jsx
│   │   │   ├── testimonials/page.jsx
│   │   │   ├── faqs/page.jsx
│   │   │   └── blog/page.jsx
│   │   ├── media/page.jsx         # Cloudinary media library
│   │   ├── settings/page.jsx      # site settings, contact info, socials, WhatsApp
│   │   ├── seo/page.jsx           # per-page meta + schema controls
│   │   └── users/page.jsx
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.js
│       ├── leads/route.js                 # POST — all public form submissions
│       ├── newsletter/route.js            # POST + DELETE (unsubscribe)
│       ├── forms/[slug]/submit/route.js   # POST — dynamic form-builder submissions
│       ├── upload/sign/route.js           # POST — signed Cloudinary upload params
│       ├── media/route.js                 # GET list / DELETE (admin)
│       ├── revalidate/route.js            # POST — tag revalidation webhook
│       ├── whatsapp/webhook/route.js      # GET verify + POST inbound (cloud_api mode)
│       └── health/route.js
│
├── components/
│   ├── site/                      # Hero, Navbar, ServicesGrid, Testimonials, Footer, …
│   ├── forms/                     # ConsultationForm, QuickContactForm, NewsletterForm, DynamicForm
│   ├── admin/                     # DataTable, MediaPicker, RichTextEditor, ImageUploader, …
│   ├── seo/JsonLd.jsx
│   └── ui/                        # shared primitives (Button, Input, Modal, Toast)
│
├── lib/
│   ├── env.js
│   ├── db.js                      # cached mongoose connection
│   ├── auth.js                    # Auth.js config
│   ├── cloudinary.js              # server SDK config + upload/delete/signature helpers
│   ├── whatsapp.js                # link builder + Cloud API sender
│   ├── mailer.js                  # Resend wrappers + templates
│   ├── ratelimit.js
│   ├── turnstile.js
│   ├── sanitize.js
│   ├── seo.js                     # buildMetadata(), canonical helper
│   ├── schema.js                  # JSON-LD generators
│   ├── cache.js                   # CACHE_TAGS constants + revalidate helpers
│   ├── logger.js
│   └── validators/                # Zod schemas — one file per entity
│
├── models/                        # Mongoose models (see §5)
├── services/                      # data-access layer — the ONLY place models are touched
├── actions/                       # 'use server' server actions for admin mutations
├── scripts/
│   ├── seed.js                    # seeds current hardcoded content into MongoDB
│   └── migrate-images.js          # pulls Unsplash placeholders into Cloudinary
├── middleware.js                  # protects /admin/*
├── .env.example
├── vercel.json
└── DECISIONS.md
```

**Hard rule:** Route handlers, server actions, and pages must call `services/*`. They must never import from `models/*` directly.

---

## 5. Data models (Mongoose)

All models: `{ timestamps: true }`, `toJSON` transform that maps `_id → id` and strips `__v`, and indexes as listed. All content models carry `isPublished`, `order`, and `updatedBy`.

### 5.1 `Lead`
```js
{
  type: { type: String, enum: ['consultation','contact','newsletter','custom'], required: true, index: true },
  formSlug: String,                  // set when type === 'custom'
  name: String,
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  phone: String,                     // store E.164 normalized
  visaType: { type: String, enum: ['Student','Work','Tourist','Business', null] },
  message: String,
  answers: { type: Map, of: mongoose.Schema.Types.Mixed },   // dynamic form payload
  attachments: [{ url: String, publicId: String, format: String, bytes: Number, originalName: String }],
  status: { type: String, enum: ['new','contacted','in_progress','won','lost','spam'], default: 'new', index: true },
  assignedTo: { type: ObjectId, ref: 'AdminUser' },
  notes: [{ body: String, author: { type: ObjectId, ref: 'AdminUser' }, createdAt: Date }],
  source: { page: String, referrer: String, utm: { source: String, medium: String, campaign: String, term: String, content: String } },
  meta: { ip: String, userAgent: String, country: String },
  whatsapp: { sent: Boolean, sentAt: Date, messageId: String, error: String, deepLink: String },
  email: { notified: Boolean, autoRepliedAt: Date },
  isRead: { type: Boolean, default: false, index: true }
}
```
Indexes: `{ createdAt: -1 }`, `{ type: 1, status: 1, createdAt: -1 }`, text index on `name, email, message`.

> Note: `email` appears as both a scalar and a sub-object above — rename the notification tracker to `notifications: { emailSent, emailSentAt, autoRepliedAt }` to avoid the collision.

### 5.2 `Service`
```js
{ title, slug (unique, index), shortDescription, description (HTML),
  icon (lucide icon name string), image: MediaRef, gallery: [MediaRef],
  bullets: [String], priceFrom: Number, currency: String, duration: String,
  faqs: [{ question, answer }],
  seo: SeoSubdoc, order, isPublished, isFeatured, updatedBy }
```

### 5.3 `Feature`
`{ title, description, icon, order, isPublished }`

### 5.4 `ProcessStep`
`{ stepNumber, title, description, icon, image: MediaRef, order, isPublished }`

### 5.5 `Stat`
`{ label, value: Number, suffix: String ('+','%'), prefix: String, order, isPublished }`
(Backs the 10+/98%/5000+/50+ counters.)

### 5.6 `Testimonial`
`{ name, quote, destination, rating (1-5), photo: MediaRef, videoUrl: MediaRef, company, order, isPublished, isFeatured }`

### 5.7 `Faq`
`{ question, answer (HTML), category, order, isPublished }` — feeds the `FAQPage` schema.

### 5.8 `BlogPost`
`{ title, slug (unique), excerpt, body (HTML), coverImage: MediaRef, author: { name, photo, bio },
   tags: [String], readingMinutes, seo: SeoSubdoc, publishedAt, isPublished }`

### 5.9 `Media`
```js
{ publicId: { type: String, unique: true, required: true },
  url, secureUrl, resourceType: { enum: ['image','video','raw'] },
  format, bytes, width, height, pages,          // pages for PDFs
  folder, originalFilename, alt, caption, tags: [String],
  usedIn: [{ model: String, docId: ObjectId, field: String }],
  uploadedBy: { type: ObjectId, ref: 'AdminUser' } }
```

### 5.10 `SiteSettings` (singleton — enforce one document)
```js
{ brandName, tagline, logo: MediaRef, logoDark: MediaRef, favicon: MediaRef,
  contact: { email, phone, whatsapp, addressLine1, addressLine2, city, region, postalCode, country, mapEmbedUrl, geo: { lat, lng } },
  hours: [{ day, opens, closes, closed: Boolean }],
  socials: { facebook, instagram, linkedin, youtube, tiktok, x },
  hero: { headline, subheadline, ctaLabel, ctaHref, backgroundImage: MediaRef },
  navLinks: [{ label, href, order }],
  footer: { about, columns: [{ title, links: [{ label, href }] }], copyright },
  whatsapp: { enabled, number, defaultMessage, showFloatingButton },
  liveChat: { provider: enum['none','crisp','tawk','custom'], embedId },
  analytics: { gaMeasurementId, gtmId, metaPixelId, clarityId },
  seoDefaults: SeoSubdoc,
  maintenanceMode: Boolean }
```

### 5.11 `FormDefinition` + `FormField` (the admin form builder)
```js
FormDefinition {
  name, slug (unique), description, submitLabel, successMessage,
  fields: [{ key, label, type: enum['text','email','tel','number','textarea','select','multiselect','radio','checkbox','date','file','hidden'],
             placeholder, helpText, required, options: [{ label, value }],
             validation: { min, max, minLength, maxLength, pattern }, order, width: enum['full','half'] }],
  notifications: { emailTo: [String], sendWhatsapp: Boolean, whatsappTemplate: String, autoReply: Boolean, autoReplySubject, autoReplyBody },
  redirectUrl, isActive, embedLocations: [String]
}
```

### 5.12 `AdminUser`
`{ name, email (unique, lowercase), passwordHash, role: enum['superadmin','editor','viewer'], avatar: MediaRef, lastLoginAt, isActive }`

### 5.13 `SeoSubdoc` (reused everywhere)
```js
{ metaTitle, metaDescription, canonicalUrl, keywords: [String],
  ogTitle, ogDescription, ogImage: MediaRef, twitterCard,
  noindex: Boolean, nofollow: Boolean,
  schemaType: String, schemaOverrides: Mixed,
  changefreq: enum['always','hourly','daily','weekly','monthly','yearly','never'],
  priority: Number }
```

### 5.14 `MediaRef` (embedded shape, not a collection)
`{ publicId, url, alt, width, height, blurDataURL }`

### 5.15 `AuditLog`
`{ actor: ObjectId, action, model, docId, before: Mixed, after: Mixed, ip }` — write on every admin create/update/delete.

---

## 6. Database connection

`lib/db.js` — cached across serverless invocations (mandatory on Vercel, otherwise you exhaust the Atlas connection pool):

```js
import mongoose from 'mongoose';
import { env } from './env';

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(env.MONGODB_URI, {
      dbName: env.MONGODB_DB,
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

Atlas setup instructions to include in the README: create an M0 cluster, a dedicated DB user with `readWrite` on `rihla` only, and network access allowing `0.0.0.0/0` (Vercel functions have no fixed egress IPs) — noting that credential secrecy is what protects the DB in that configuration.

---

## 7. Cloudinary pipeline

**Rule: nothing binary is ever committed to `public/` or stored in Mongo.** Images, videos, and downloadable PDFs all live in Cloudinary; Mongo stores only the `MediaRef`.

### 7.1 Folder convention
```
rihla/
  brand/          logo, favicon, OG defaults
  hero/
  services/
  process/
  testimonials/
  team/
  blog/
  documents/      PDFs (resource_type: 'raw')
  leads/          attachments uploaded by visitors
  misc/
```

### 7.2 `lib/cloudinary.js`
Export:
- `cloudinary` — configured v2 SDK (`secure: true`).
- `signUploadParams({ folder, resourceType, publicId, tags })` → returns `{ signature, timestamp, apiKey, cloudName, folder }`.
- `uploadBuffer(buffer, opts)` — `upload_stream` wrapper for server-side uploads.
- `deleteAsset(publicId, resourceType)`.
- `getBlurDataURL(publicId)` — fetch a 16px-wide, `q_1`, blurred variant as base64 for `next/image` `placeholder="blur"`.
- `buildUrl(publicId, transforms)`.

### 7.3 Upload flow (use **signed direct-to-Cloudinary uploads**, never proxy files through the serverless function — Vercel's 4.5 MB body limit will bite you)

1. Admin picks a file in `<ImageUploader />`.
2. Client `POST /api/upload/sign` with `{ folder, resourceType, filename }`. The route authenticates the admin session, then returns signed params.
3. Client `POST`s the file directly to `https://api.cloudinary.com/v1_1/<cloud>/<resource_type>/upload` with the signature.
4. On success, client calls a server action `registerMedia(cloudinaryResponse)` which writes a `Media` document (including generated `blurDataURL` and `alt`).
5. `MediaPicker` reads from the `Media` collection, not from Cloudinary's Admin API (faster, no rate limits).

### 7.4 Deletion
Deleting from the media library must: check `usedIn` and warn if referenced → call `cloudinary.uploader.destroy(publicId, { resource_type })` → delete the `Media` doc → write an `AuditLog` entry. Never orphan one without the other.

### 7.5 Delivery
- Configure `next.config.mjs`:
  ```js
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/<cloud_name>/**' }],
    formats: ['image/avif', 'image/webp'],
  }
  ```
- Use `next-cloudinary`'s `<CldImage>` (or `next/image` with a Cloudinary loader) everywhere, with `f_auto,q_auto,dpr_auto` and explicit `sizes`.
- PDFs: upload as `resource_type: 'raw'`, serve via `fl_attachment` so the browser downloads rather than previews. Track downloads by routing through `/api/download/[publicId]` which logs then 302-redirects.

### 7.6 Migration script
`scripts/migrate-images.js` — iterate the current `IMAGES` constant and testimonial avatars, `cloudinary.uploader.upload(unsplashUrl)` each into the right folder, create `Media` docs, and print a mapping table so seeding can reference real `publicId`s. **After this runs, no Unsplash hotlinks may remain in the codebase.**

---

## 8. API contracts

All responses use this envelope:
```json
{ "ok": true,  "data": { }, "meta": { } }
{ "ok": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "fields": { "email": "Invalid email" } } }
```
Status codes: 200/201 success, 400 validation, 401 unauthenticated, 403 unauthorized, 404, 409 duplicate, 429 rate limited, 500.
Every handler: `export const runtime = 'nodejs'` and `export const dynamic = 'force-dynamic'`.

### 8.1 `POST /api/leads` — the single public lead endpoint

Request:
```json
{
  "type": "consultation",
  "name": "Ali Raza",
  "email": "ali@example.com",
  "phone": "+923001234567",
  "visaType": "Student",
  "message": "optional",
  "source": { "page": "/", "referrer": "...", "utm": { } },
  "website": "",                 // honeypot — must be empty
  "turnstileToken": "..."
}
```

Pipeline, in order — if any step fails, the *lead is still saved*; only notification failures are logged, never surfaced as an error to the visitor:

1. Rate limit by IP: **5 requests / 10 minutes**. Exceeded → 429.
2. Honeypot check: `website` non-empty → return a fake 201 (silently drop, mark `status: 'spam'`).
3. Verify Turnstile token server-side.
4. Zod validation per `type` (consultation requires name+email+phone+visaType; contact requires name+email; newsletter requires email only).
5. Normalize: lowercase email, phone → E.164 via `libphonenumber-js` defaulting to `PK`.
6. Dedupe: same email + type within 60 seconds → return the existing lead, 200.
7. Persist `Lead`.
8. **Fan out concurrently** (`Promise.allSettled`, never blocking the response beyond ~2s):
   - Resend notification to `LEAD_NOTIFY_TO` with a formatted lead card + admin deep link.
   - Resend auto-reply to the visitor (per-type template, unsubscribe footer for newsletter).
   - WhatsApp dispatch (§9).
9. Respond `201 { ok: true, data: { id, whatsappUrl } }` where `whatsappUrl` is the visitor-facing `wa.me` deep link.
10. `revalidateTag('leads')`.

### 8.2 `POST /api/newsletter`
Same pipeline, `type: 'newsletter'`. Upsert on email; `409` if already subscribed and active. Also `GET /api/newsletter/unsubscribe?token=` — signed HMAC token, marks inactive, renders a confirmation page.

### 8.3 `POST /api/forms/[slug]/submit`
Loads the `FormDefinition` by slug → builds a **Zod schema dynamically** from `fields[]` → validates → stores as `Lead { type: 'custom', formSlug, answers }` → runs that form's own `notifications` config. File fields upload to Cloudinary `rihla/leads/` first via the signed-upload flow and are stored in `attachments[]`.

### 8.4 `POST /api/upload/sign` — admin session required. Returns Cloudinary signature; rate limit 30/min per user.

### 8.5 `GET /api/media` (admin) — paginated, filterable by `folder`, `resourceType`, `tags`, `q`. `DELETE /api/media?publicId=` per §7.4.

### 8.6 `POST /api/revalidate` — header `x-revalidate-secret`; body `{ tags: ['services'] }`. Calls `revalidateTag` for each.

### 8.7 `GET|POST /api/whatsapp/webhook` — only active when `WHATSAPP_MODE=cloud_api`. `GET` handles Meta's `hub.challenge` verification; `POST` verifies the `X-Hub-Signature-256` HMAC and records delivery/read receipts onto the matching `Lead`.

### 8.8 `GET /api/health` — `{ ok, db: 'up'|'down', cloudinary: 'up'|'down', uptime }`.

---

## 9. WhatsApp integration — number `0324-3799558`

Normalize once, everywhere: **`+92 324 3799558` → E.164 `923243799558`**. Never hardcode it in a component; always read from `SiteSettings.contact.whatsapp` with the env var as fallback. **Delete the existing `wa.me/15515586001` hardcode.**

Implement **both** modes behind `WHATSAPP_MODE`:

### 9.1 `link` mode **[DEFAULT — ship this first]**
No API approval needed, works immediately.

- `lib/whatsapp.js → buildWaLink({ number, text })` returns `https://wa.me/<number>?text=<encodeURIComponent(text)>`.
- **Visitor side:** on successful form submit, the thank-you state renders a prominent "Continue on WhatsApp" button opening a pre-filled message:
  > `New enquiry from rihlaglobal.com%0A%0AName: {name}%0AEmail: {email}%0APhone: {phone}%0AVisa type: {visaType}%0AMessage: {message}%0ARef: {leadId}`
  
  Open with `window.open(url, '_blank', 'noopener')` — do **not** auto-redirect; that breaks the confirmation UX and gets blocked by popup blockers.
- **Floating button:** reads `SiteSettings.whatsapp.{enabled, number, defaultMessage, showFloatingButton}`.
- **Admin side:** every lead row in the CMS has a one-click "Reply on WhatsApp" deep link pre-filled with the lead's own number.
- Store the generated link on `Lead.whatsapp.deepLink`.

### 9.2 `cloud_api` mode (server-initiated, for automatic alerts)
Requires a Meta Business account, a verified WhatsApp Business phone number, and an **approved message template** (business-initiated messages outside the 24-hour window must be templated).

```js
POST https://graph.facebook.com/{WHATSAPP_GRAPH_VERSION}/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {ACCESS_TOKEN}
{
  "messaging_product": "whatsapp",
  "to": "923243799558",
  "type": "template",
  "template": {
    "name": "new_lead_alert",
    "language": { "code": "en" },
    "components": [{ "type": "body", "parameters": [
      { "type": "text", "text": "{name}" },
      { "type": "text", "text": "{visaType}" },
      { "type": "text", "text": "{phone}" }
    ]}]
  }
}
```
Wrap in a retry (3 attempts, exponential backoff), record `messageId`/`error` on the lead, and **never let a WhatsApp failure fail the submission**. Document the template-approval steps in `README.md`.

> **Flag to the client:** `link` mode is instant but requires a human to tap through; `cloud_api` mode is fully automatic but requires Meta Business verification and template approval (typically a few days). Ship `link` mode now, keep `cloud_api` behind the flag.

---

## 10. Admin dashboard / CMS

### 10.1 Auth
- Auth.js v5, Credentials provider, JWT session, 8-hour expiry with rolling refresh.
- `middleware.js` matches `/admin/:path*` (excluding `/admin/login`) and redirects unauthenticated users to `/admin/login?callbackUrl=`.
- **Also re-check the session inside every server action and admin route handler** — middleware alone is not an authorization boundary.
- Roles: `superadmin` (everything incl. users + settings), `editor` (content + media + leads), `viewer` (read-only).
- `scripts/seed.js` creates the first superadmin from `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`, then forces a password change on first login.
- Login: rate limited 5 attempts / 15 min per IP+email; generic error message (never reveal whether the email exists).

### 10.2 Shell
Responsive sidebar + topbar, dark/light matching the public site's navy/green tokens, breadcrumb, global search, toast notifications, and an unsaved-changes guard on every editor.

### 10.3 Screens

| Screen | Requirements |
|---|---|
| **Dashboard** | Cards: leads today / this week / total, conversion by status, unread count. Line chart of leads over 30 days, breakdown by `type` and by `visaType`. Recent 10 leads. Quick links. |
| **Leads inbox** | Server-side paginated table (`@tanstack/react-table`): columns type, name, email, phone, visaType, status, source, createdAt. Filters by type/status/date range, full-text search, sort. Bulk actions: mark read, change status, assign, delete, export CSV. Row click → detail drawer with full payload, UTM data, attachments, internal notes thread, status timeline, "Reply on WhatsApp" and "Reply by email" buttons. Unread badge in the sidebar. |
| **Form builder** | CRUD on `FormDefinition`. Drag-to-reorder fields, per-field type/label/placeholder/required/validation/options/width, live preview of the rendered form, per-form notification settings (email recipients, WhatsApp on/off, auto-reply subject+body with `{{field}}` interpolation), and an embed snippet (`<DynamicForm slug="…" />` plus a public URL). Submissions land in the Leads inbox filtered by `formSlug`. |
| **Content → Services** | CRUD, drag-reorder, publish toggle, feature toggle, rich-text description, icon picker (searchable list of lucide icon names — render live previews), image + gallery via MediaPicker, bullets repeater, FAQ repeater, per-service SEO panel. |
| **Content → Features / Process / Stats** | Simple CRUD + drag-reorder + publish toggle. Stats editor validates numeric `value` and free-text `suffix`. |
| **Content → Testimonials** | CRUD with photo/video upload, star rating, destination, feature toggle. |
| **Content → FAQs** | CRUD, categories, drag-reorder. Feeds `FAQPage` schema automatically. |
| **Content → Blog** | Full editor: title (auto-slug with manual override), excerpt, Tiptap body, cover image, tags, author, schedule `publishedAt`, draft/publish, per-post SEO + live Google/Facebook preview. |
| **Media library** | Grid + list view, folder filter, type filter (image/video/raw), search, drag-and-drop multi-upload with progress bars, inline alt-text and caption editing, "used in" panel, copy-URL, delete with usage warning. |
| **Settings** | Tabbed: Brand (name, tagline, logo, favicon), Contact (email, phone, WhatsApp, address, geo, map embed), Hours, Socials, Hero, Navigation (drag-reorder nav links), Footer (columns + links), WhatsApp (enabled, number, default message, floating button), Live chat provider, Analytics IDs, Maintenance mode. |
| **SEO** | Global defaults (title template, description, OG image, Twitter handle), per-page overrides, robots.txt directives, sitemap priority/changefreq per content type, schema-markup toggles with a live JSON-LD preview, and a "Validate" button linking out to Google's Rich Results Test. |
| **Users** | superadmin only. Invite, role assignment, deactivate, force password reset, last-login column. |
| **Audit log** | Filterable list of all admin mutations with before/after diff. |

### 10.4 Mutations
All admin writes are **Server Actions** in `actions/`, each of which: `'use server'` → assert session + role → Zod-validate → call the `services/` layer → write `AuditLog` → `revalidateTag(...)` → `revalidatePath('/admin/...')` → return `{ ok, data | error }`. Wire into forms with `useActionState` + `useOptimistic`.


---

## 11. Refactoring the frontend to be data-driven

This is required work, not optional. The current single-file client component cannot consume server data.

1. **Split `app/page.jsx`.** Move each of the ~15 sub-components into `components/site/<Name>.jsx`. Keep the markup and Tailwind classes byte-identical.
2. **Invert the client boundary.** `app/page.jsx` becomes a **Server Component** that fetches CMS data and passes it down as props. Only leaves that need interactivity keep `'use client'`: `Navbar` (mobile menu, scroll state), `ThemeToggle`, the three forms, `StatsCounter` (IntersectionObserver), `FloatingButtons`, `TestimonialSlider`.
3. **Replace every hardcoded constant** — `STATS`, `SERVICES`, `FEATURES`, `PROCESS`, `STORIES`, `NAV_LINKS`, `IMAGES` — with calls into `services/`, e.g.:
   ```js
   const [stats, services, features, process, testimonials, settings] = await Promise.all([
     getStats(), getServices(), getFeatures(), getProcessSteps(), getTestimonials(), getSiteSettings(),
   ]);
   ```
4. **Caching:** wrap each service function in `unstable_cache` with a tag from `lib/cache.js` (`CACHE_TAGS.services`, `.testimonials`, `.settings`, …) and `revalidate: 3600`. Admin mutations call `revalidateTag`, so the site is effectively static but updates within seconds of a CMS edit.
5. **Keep the route statically generated** where possible — with ISR + tag revalidation the page ships prerendered HTML and still reflects CMS changes.
6. **Loading + error UX:** add `loading.jsx` skeletons matching the real layout (to protect CLS) and `error.jsx` boundaries.
7. **Empty states:** every section must render gracefully when its collection is empty — never crash, never show a bare heading with nothing under it.
8. **Fonts:** replace the CSS `@import` of Poppins/Inter with `next/font/google`, exposing CSS variables consumed by the `@theme` block. This removes a render-blocking request and eliminates layout shift.
9. **Forms:** each of the three forms gets `react-hook-form` + Zod resolver, inline field errors, a disabled/pending submit state, an accessible `role="status"` success message, a network-error path, the honeypot input (visually hidden, `tabIndex={-1}`, `autoComplete="off"`), the Turnstile widget, and the WhatsApp CTA on success.
10. **Contact details** in the footer, navbar, and floating buttons all read from `SiteSettings` — zero placeholders left in code.

---

## 12. SEO implementation

### 12.1 Metadata
- `app/layout.jsx`: `metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL)`, a `title.template` of `%s | Rihla Global`, default description, `openGraph`, `twitter`, `robots`, `alternates.canonical`, `icons`, `verification`.
- Every dynamic route exports `generateMetadata()` sourcing from its document's `seo` subdocument, falling back to `SiteSettings.seoDefaults`. Build this once in `lib/seo.js → buildMetadata(doc, fallbacks)` and reuse it.
- `generateStaticParams()` on `/services/[slug]` and `/blog/[slug]`.
- `app/opengraph-image.jsx` using `next/og` ImageResponse for a branded fallback OG card; per-document `ogImage` from Cloudinary wins when set.

### 12.2 `app/sitemap.js`
Generate from the DB, not a static list:
```js
export default async function sitemap() {
  const [services, posts] = await Promise.all([getPublishedServices(), getPublishedPosts()]);
  const base = env.NEXT_PUBLIC_SITE_URL;
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.8 },
    ...services.map(s => ({ url: `${base}/services/${s.slug}`, lastModified: s.updatedAt, changeFrequency: s.seo?.changefreq ?? 'monthly', priority: s.seo?.priority ?? 0.8 })),
    ...posts.map(p => ({ url: `${base}/blog/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly', priority: 0.6 })),
  ];
}
```
Exclude anything with `seo.noindex`. If the site ever exceeds 50,000 URLs, switch to `generateSitemaps()` for a sitemap index.

### 12.3 `app/robots.js`
```js
export default function robots() {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/_next'] }],
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: env.NEXT_PUBLIC_SITE_URL,
  };
}
```
Also set `noindex` headers on all `/admin/*` responses via `middleware.js`.

### 12.4 Schema markup (JSON-LD) — required

Build generators in `lib/schema.js` and render via a `<JsonLd data={...} />` component that emits `<script type="application/ld+json">` with `JSON.stringify`. **Inject in Server Components so the markup is in the initial HTML** — client-injected JSON-LD is unreliable for crawlers.

Required graph:

| Schema type | Where | Source |
|---|---|---|
| `Organization` | root layout | `SiteSettings` — name, url, logo, sameAs (socials), contactPoint with the WhatsApp/phone number |
| `WebSite` + `SearchAction` | root layout | site URL + `/search?q={search_term_string}` |
| `LocalBusiness` (or `TravelAgency` / `ProfessionalService`) | home | address, geo, openingHoursSpecification, telephone, priceRange |
| `Service` | each `/services/[slug]` | title, description, provider→Organization, areaServed, offers |
| `BreadcrumbList` | every non-home page | route segments |
| `FAQPage` | home + service pages that have FAQs | `Faq` collection / `Service.faqs` |
| `Review` + `AggregateRating` | testimonials section | `Testimonial` docs — **only emit AggregateRating if real ratings exist**; do not fabricate |
| `Article` / `BlogPosting` | `/blog/[slug]` | headline, image, datePublished, dateModified, author, publisher |
| `ContactPage` | `/contact` | |
| `WebPage` | fallback on every page | |

Nest them under a single `@graph` with `@id` cross-references rather than emitting many disconnected blocks. Allow per-document overrides through `seo.schemaOverrides`. Validate every type against Google's Rich Results Test before sign-off.

### 12.5 On-page SEO hygiene
Exactly one `<h1>` per page; logical heading order; descriptive `alt` on every image (sourced from `Media.alt`, and make alt text a **required** field in the media library); descriptive internal link text; `hreflang` only if a second locale is added; canonical on every page; 301s for any legacy URLs; breadcrumbs rendered visually as well as in JSON-LD.

### 12.6 Analytics
Inject GA4 / GTM / Meta Pixel IDs from `SiteSettings.analytics` using `next/script` with `strategy="afterInteractive"`. Fire a `generate_lead` event on every successful form submission. Ship a cookie-consent gate before any non-essential script loads.

---

## 13. Vercel deployment

- Framework preset: Next.js. Build `next build`, install `npm ci`, Node 25.
- All env vars added for Production / Preview / Development; secrets never in `NEXT_PUBLIC_*`.
- `vercel.json`:
  ```json
  {
    "headers": [
      { "source": "/(.*)", "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" },
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
      ]},
      { "source": "/admin/(.*)", "headers": [{ "key": "X-Robots-Tag", "value": "noindex, nofollow" }] }
    ],
    "crons": [{ "path": "/api/cron/digest", "schedule": "0 3 * * *" }]
  }
  ```
- Add a CSP header (start in report-only) allowing `res.cloudinary.com`, `challenges.cloudflare.com`, and the analytics domains.
- Attach the custom domain, force HTTPS, enable Vercel Analytics + Speed Insights.
- Preview deployments must point at a **separate Atlas database** and a separate Cloudinary folder — never at production data.
- Daily cron `/api/cron/digest` emails a lead summary; protect it with `CRON_SECRET`.

---

## 14. Security requirements

- Zod validation on **every** input at the server boundary, including admin actions. Never trust a client-side check.
- Sanitize all rich-text HTML with DOMPurify **on write**, and again before render.
- Rate limit: public forms 5/10min per IP, login 5/15min, upload signing 30/min.
- bcrypt cost 12; passwords never logged; generic auth errors.
- httpOnly + secure + sameSite=lax session cookies.
- Server-side role checks in every action and admin route handler.
- Mongo injection: never interpolate raw user input into query operators; cast all IDs with `mongoose.isValidObjectId` before use.
- Signed Cloudinary uploads only — never expose `CLOUDINARY_API_SECRET` to the browser; restrict upload presets by folder, `max_file_size` (10 MB images / 25 MB PDFs), and `allowed_formats`.
- Verify Meta webhook signatures (`X-Hub-Signature-256`) before processing.
- Store IPs on leads only if a privacy policy discloses it; add a retention/purge job.

---

## 15. Performance targets

- Lighthouse mobile ≥ 95 across Performance / Accessibility / Best Practices / SEO.
- LCP < 2.0s, CLS < 0.05, INP < 200ms on a 4G throttle.
- Hero image `priority` + `fetchPriority="high"`; everything below the fold lazy.
- All Cloudinary delivery through `f_auto,q_auto,dpr_auto` with explicit `sizes`.
- `blurDataURL` placeholders on every image.
- `next/dynamic` for admin-only heavy components (Tiptap, charts, table).
- Keep the public bundle free of admin code — the route-group split handles this; verify with `@next/bundle-analyzer`.
- `unstable_cache` on every read path; no per-request DB hit on the home page.

---

## 16. Build order

**Phase 1 — Foundations.** Env schema, `lib/db.js`, all Mongoose models, `services/` layer, Zod validators, seed script that ports the existing hardcoded content into MongoDB, health endpoint.

**Phase 2 — Media.** Cloudinary config, signed-upload route, `registerMedia` action, `Media` model, MediaPicker + ImageUploader components, `migrate-images.js`. No Unsplash links remain after this phase.

**Phase 3 — Leads.** `/api/leads`, `/api/newsletter`, validation, honeypot, Turnstile, rate limiting, Resend templates, WhatsApp `link` mode. Wire the three existing forms to real submissions.

**Phase 4 — Auth + admin shell.** Auth.js, middleware, roles, login page, sidebar layout, dashboard overview, leads inbox with detail drawer.

**Phase 5 — CMS.** Content editors for services, features, process, stats, testimonials, FAQs, blog; media library; settings; audit log; server actions with tag revalidation.

**Phase 6 — Frontend refactor.** Split `page.jsx`, invert the client boundary, swap constants for DB reads, `next/font`, caching, loading/error/empty states.

**Phase 7 — SEO.** Metadata API, sitemap, robots, manifest, full JSON-LD graph, OG images, analytics, SEO admin screen.

**Phase 8 — Form builder.** `FormDefinition` model, builder UI, dynamic Zod schema generation, `DynamicForm` renderer, per-form notifications.

**Phase 9 — Hardening + deploy.** Security headers, CSP, rate-limit tuning, Vercel config, cron digest, Lighthouse pass, Rich Results validation, README + `DECISIONS.md`.

---

## 17. Deliverables

1. Working code for all phases, in JavaScript, matching the folder structure in §4.
2. `.env.example` with every key and an inline comment on where to obtain it.
3. `README.md`: local setup, Atlas setup, Cloudinary setup, Turnstile setup, Resend domain verification, WhatsApp Cloud API template-approval walkthrough, seeding, deployment, and how to add a new content type end-to-end.
4. `DECISIONS.md`: every ambiguous choice made and why.
5. `scripts/seed.js` and `scripts/migrate-images.js`, both idempotent.
6. A Postman/Thunder collection or `requests.http` covering every endpoint.
7. Screenshot-free acceptance walkthrough in the README mapping each item in §18 to how to verify it.

---

## 18. Acceptance criteria

- [ ] Submitting any of the three forms creates a `Lead` in MongoDB, sends a team email, sends an auto-reply, and offers a pre-filled WhatsApp link to **+92 324 3799558**.
- [ ] Editing a service, stat, testimonial, or nav link in `/admin` changes the public site within 60 seconds without a redeploy.
- [ ] Uploading an image in the admin puts it in the correct Cloudinary folder, creates a `Media` doc with alt text, and it renders through `next/image` with a blur placeholder.
- [ ] A PDF uploaded in the admin is downloadable from the public site and served from Cloudinary as `raw`.
- [ ] `/admin` is unreachable without a valid session, in both the browser and via direct API calls.
- [ ] A new form created in the form builder renders publicly, validates, submits, and its entries appear in the leads inbox.
- [ ] `/sitemap.xml` lists the home page plus every published service and blog post, and excludes noindexed docs.
- [ ] `/robots.txt` disallows `/admin` and `/api` and references the sitemap.
- [ ] Google Rich Results Test passes for Organization, LocalBusiness, Service, FAQPage, BreadcrumbList, and Article.
- [ ] `grep -r "unsplash\|15515586001\|500 Ebisu\|info@rihlaglobal" app components` returns nothing.
- [ ] Lighthouse mobile ≥ 95 on all four categories for the home page.
- [ ] The site renders identically to the current design in light and dark mode, desktop and mobile.
- [ ] Production build succeeds with zero Oxlint errors and no console errors at runtime.

---

## 19. Open items to confirm with the client

These do not block Phase 1–3; confirm before Phase 7 sign-off.

1. **Brand name** — the frontend uses "Rihla" / `rihlaglobal.com`; confirm the production domain, since it drives canonicals, sitemap, OG, and email sending domain.
2. **Real contact details** — physical address, business hours, and geo coordinates are needed for `LocalBusiness` schema; the current ones are placeholders.
3. **WhatsApp mode** — ship `link` mode now; confirm whether the client will pursue Meta Business verification for `cloud_api` automatic alerts.
4. **Email sending domain** — Resend requires DNS verification (SPF/DKIM) on the sending domain before auto-replies will land in inboxes.
5. **Live chat** — third-party widget (Crisp/Tawk) or leave the WhatsApp button as the only channel.
6. **Additional pages** — the current build is single-page; confirm whether `/services/[slug]`, `/blog`, `/contact`, `/privacy`, `/terms` are in scope (they are assumed in this spec, and `/privacy` is effectively required given lead-data collection).
7. **Languages** — English only, or EN + UR? Adding a locale later is far more expensive than designing for it now.
