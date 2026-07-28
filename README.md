# Rihla Global — Visa Consultant

Marketing site for Rihla Global Visa Consultant Pvt. Ltd., built with **Next.js (App Router)**, **React 19** and **Tailwind CSS v4**.

## Getting started

```bash
npm install       # install dependencies
npm run dev       # start the dev server at http://localhost:3000
```

## Scripts

| Command                 | Description                                   |
| ----------------------- | --------------------------------------------- |
| `npm run dev`           | Start the development server (localhost:3000) |
| `npm run build`         | Create an optimized production build          |
| `npm run start`         | Serve the production build                     |
| `npm run lint`          | Run Oxlint                                      |
| `npm run seed`          | Seed hardcoded content into MongoDB (idempotent) |
| `npm run migrate:images`| Pull Unsplash placeholders into Cloudinary       |

## Project structure

```
app/
  layout.jsx     Root layout — metadata, fonts, pre-hydration theme script
  page.jsx       The single-page site (client component; forms POST to the API)
  globals.css    Tailwind v4 + theme tokens + custom styles
  api/           Route Handlers — health, leads, newsletter, upload/sign
lib/             env, db, cache, integrations (cloudinary, mailer, whatsapp, …)
models/          Mongoose schemas
services/        Data-access layer (the ONLY place models are touched)
actions/         'use server' mutations
scripts/         seed.js, migrate-images.js
public/
  Rihla logo.png Logo / favicon
```

---

# Backend

A co-located backend (Next.js Route Handlers + MongoDB + Cloudinary), deployed as
Vercel serverless functions. Built to the spec in
`rihla-backend-implementation-prompt.md`.

## Status — Phases 1–4 implemented

| Phase | Area | State |
| --- | --- | --- |
| 1 | Foundations (env, DB, models, services, seed, health) | ✅ done |
| 2 | Media (Cloudinary config, signed upload, migrate script) | ✅ done |
| 3 | Leads (`/api/leads`, `/api/newsletter`, anti-spam, email, WhatsApp) | ✅ done |
| 4 | Auth.js + admin shell (login, dashboard, leads inbox) | ✅ done |
| 5 | Admin CMS (content editors, settings, audit log) | ✅ done |
| 6 | Frontend data-refactor (home reads all content from DB) | ✅ done |
| 7 | SEO (metadata, sitemap, robots, JSON-LD, OG) | ⏳ pending |
| 8 | Form builder (drag-drop field builder) | ⏳ pending (form text editable via Settings) |
| 9 | Hardening, CSP, cron digest | ⏳ partial (headers shipped) |
| — | Media library UI (upload via CMS) | ⏳ pending (image fields accept URLs today) |

## Admin dashboard (`/admin`)

Auth.js (Credentials + JWT). `/admin/*` is gated by `proxy.js` and re-checked in
the panel layout + every server action.

**Credentials live in MongoDB, never in env.** Only infrastructure secrets
(`MONGODB_URI`, `AUTH_SECRET`) come from env — logins are checked against the
`adminusers` collection with a bcrypt hash, so it behaves identically in prod.

### Creating an admin

```bash
npm run create-admin -- <email-or-username> <password> [name] [role]
npm run create-admin -- admin admin123          # superadmin by default
```

Credentials are passed as **CLI arguments** — not env vars, not committed to the
repo. Run it once against any `MONGODB_URI` (local or Atlas). Re-running with the
same identifier updates the password, so it doubles as a password reset.

You can sign in with either an **email or a plain username** (`admin` works).
Roles: `superadmin` / `editor` / `viewer`.

> ⚠️ `admin` / `admin123` is fine for local dev but far too weak for production —
> create a strong-password admin before going live.

### Using it

1. Set `MONGODB_URI` and `AUTH_SECRET` (`openssl rand -base64 32`) in `.env.local`.
2. `npm run create-admin -- admin admin123`
3. `npm run seed` (optional — loads the site content).
4. Visit `/admin` and sign in. You get: a **dashboard** (lead counts, breakdown,
   recent), a **leads inbox** (filter by type/status, full-text search,
   pagination), and a **lead detail** view (status control, internal notes,
   "Reply on WhatsApp"/email, delete) — every mutation writes an `AuditLog`.

### Editing the site (CMS)

**Everything on the public site is editable at `/admin` — no code changes, no redeploy.** Edits go live within a page refresh.

- **Content** (`/admin/content`) — a generic editor drives every content type: **Services** (incl. prices), **Features**, **Process steps**, **Stats**, **Testimonials**, **FAQs**, **Countries** (flags + visa types), **Pages** (Privacy, Terms, About), **Blog**. Create / edit / delete / reorder / publish-toggle each.
- **Settings** (`/admin/settings`) — brand name & tagline, **hero text** (badge, headline, sub-headline, CTAs, trust badges), **contact & address**, **social links**, **WhatsApp** number & widget, and the **consultation form** text + visa-type options.
- **Audit log** (`/admin/audit`) — every admin change is recorded.

The whole engine is config-driven: [lib/cms/collections.js](lib/cms/collections.js) declares each content type's fields, which auto-generates its list + edit screens and CRUD. Adding a new editable type is one registry entry. The public homepage ([app/page.jsx](app/page.jsx) → [components/site/SiteContent.jsx](components/site/SiteContent.jsx)) reads it all from the DB with sensible fallbacks, so it never looks broken before seeding.

Legal/info pages render at `/privacy`, `/terms`, `/about` (any published `Page` slug).

## Local setup

1. `cp .env.example .env.local` and set at least `MONGODB_URI` (everything else is
   optional and degrades gracefully — see the file's comments).
2. **MongoDB Atlas:** create a free M0 cluster, a DB user with `readWrite` on the
   `rihla` database, and allow network access from `0.0.0.0/0` (Vercel functions
   have no fixed egress IP — credential secrecy is what protects the DB).
3. `npm run seed` — ports the site's content (services, features, stats,
   testimonials, settings) into MongoDB. Set `ADMIN_SEED_EMAIL` /
   `ADMIN_SEED_PASSWORD` first to also create the first admin.
4. `npm run dev`, then submit any form — a `Lead` is created in MongoDB.

### Optional integrations

- **Cloudinary** (media): set `CLOUDINARY_*`, then `npm run migrate:images`.
- **Resend** (email): set `RESEND_API_KEY` + `LEAD_NOTIFY_TO`; verify your sending
  domain (SPF/DKIM) so auto-replies land in inboxes.
- **Cloudflare Turnstile** (bot defence): set `TURNSTILE_*`; skipped when unset.
- **Upstash Redis** (rate limiting): set `UPSTASH_*`; otherwise a Mongo TTL
  limiter is used.

## API endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | DB / Cloudinary / email status |
| POST | `/api/leads` | Consultation + contact submissions |
| POST | `/api/newsletter` | Subscribe (409 if already active) |
| GET | `/api/newsletter?email=&token=` | Signed unsubscribe |
| POST | `/api/upload/sign` | Signed Cloudinary params (admin-only, locked until Phase 4) |

All responses use `{ ok, data, meta }` / `{ ok, error }`. Try:

```bash
curl -s localhost:3000/api/health
curl -s -X POST localhost:3000/api/leads -H 'content-type: application/json' \
  -d '{"type":"consultation","name":"Test","email":"t@example.com","phone":"+923001234567","visaType":"Student"}'
```

## WhatsApp

Number **0324-3799558** → E.164 `923243799558`. `link` mode (default) needs no API
approval: a successful submission returns a `wa.me` deep link and the UI shows a
"Continue on WhatsApp" button. `cloud_api` mode (automatic server alerts) needs
Meta Business verification + an approved `new_lead_alert` template — keep it behind
`WHATSAPP_MODE` until then.

## Deployment

Import into [Vercel](https://vercel.com) (auto-detects Next.js). Add every
`.env.example` key under Production/Preview/Development — secrets must **not** be
`NEXT_PUBLIC_*`. Point Preview deployments at a **separate** Atlas DB and Cloudinary
folder. Security headers ship via `vercel.json`. Any Node host also works via
`npm run build` + `npm run start`.

See `DECISIONS.md` for choices made and what each remaining phase entails.
