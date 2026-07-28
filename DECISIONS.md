# DECISIONS

Ambiguous choices made while implementing the backend spec, and why.

## Scope of this delivery

The spec (`rihla-backend-implementation-prompt.md`) defines a 9-phase build. This
increment delivers **Phases 1–3** — the functional backend core:

- **Phase 1 — Foundations:** env schema, cached DB connection, all 13 Mongoose
  models, Zod validators, the `services/` data-access layer, an idempotent seed
  script, and `/api/health`.
- **Phase 2 — Media:** Cloudinary config + signed-upload helpers, the admin
  signed-upload route (locked pending auth), `registerMedia` action, and the
  `migrate-images` script.
- **Phase 3 — Leads:** `/api/leads` and `/api/newsletter` with the full pipeline
  (rate limit → honeypot → validation → Turnstile → normalize → dedupe → persist
  → post-response email + WhatsApp fan-out), and the three frontend forms wired to
  real submissions with a WhatsApp CTA on success.

**Not yet built (Phases 4–9):** Auth.js admin + CMS, the full frontend
data-refactor (`page.jsx` still renders hardcoded constants), SEO graph/sitemap,
form builder, cron digest, CSP. See "Remaining phases" in the README.

## Technical decisions

- **`"type": "module"` added to package.json.** Required so the Node-run scripts
  (`seed`, `migrate:images`) can use the same ESM `import` syntax as the app.
  Consequence: relative imports in `lib/`, `models/`, `services/`, `actions/`,
  `scripts/` use explicit `.js` extensions (Node ESM requires them; Next accepts
  them).
- **Node `engines: ">=20"`, not pinned to 25.** The spec asked to pin Node 25, but
  a floor of 20 is safer across Vercel/local and still satisfies every dependency.
- **env is build-safe.** Every key is optional/defaulted so `next build` never
  crashes on a missing secret. Runtime consumers throw a clear error only when a
  feature that needs a key is actually used. `flags` gates graceful degradation.
- **Zod written version-agnostically.** `zod@4` churned the `.email()`/`.url()`
  string helpers, so validators use `.refine()` for email instead — works on v3
  and v4.
- **Rate limiter falls back to a Mongo TTL counter** when Upstash isn't
  configured, so it still works on serverless without extra infra. Fails **open**
  (allows the request) if the backend errors — never blocks a real visitor.
- **Turnstile + Resend + WhatsApp cloud all no-op when unconfigured.** Local dev
  needs only `MONGODB_URI`; notifications are skipped, never fatal (per §8.1: a
  notification failure must never fail the lead).
- **Post-response fan-out uses `after()`** (next/server) so email/WhatsApp run
  after the visitor already got their response — correct on Vercel serverless.
- **`/api/upload/sign` is locked** behind `lib/session.js#requireAdmin`, which
  returns 401 until Auth.js lands in Phase 4. Secure-by-default rather than open.
  The `migrate-images` script uploads server-side (API secret) and works today.
- **`Lead` model:** renamed the spec's `email` notification sub-object to
  `notifications` to avoid colliding with the scalar `email` field (flagged in
  §5.1).
- **Frontend still uses Unsplash `<img>` placeholders.** Swapping them to
  Cloudinary/DB is Phase 6 (frontend refactor); `migrate-images` already seeds the
  Cloudinary assets and Media docs so that swap is ready.
- **vercel.json** ships the security headers now; the cron entry is deferred to
  Phase 9 (its `/api/cron/digest` route doesn't exist yet).

## Phase 4 (auth + admin) decisions

- **Auth.js v5 (`next-auth@5.0.0-beta.32`)** with a Credentials provider + JWT
  session (8h). Config is **split**: `lib/auth.config.js` is edge-safe (no
  providers, no Node imports) and used by the proxy/middleware; `lib/auth.js`
  adds the Credentials provider whose `authorize` uses mongoose + bcrypt (Node
  only). This is the canonical pattern for DB-backed auth with edge middleware.
- **`middleware.js` → `proxy.js`.** Next 16 deprecated the `middleware` file
  convention in favour of `proxy`; renamed to silence the warning and stay
  current. Same API (`export default auth(...)`, `config.matcher`).
- **`AUTH_SECRET` is now required** for the admin to function (JWT signing). A dev
  value is generated into `.env.local`; set a real one (`openssl rand -base64 32`)
  in every deployment environment.
- **Two-layer authorization.** The proxy is only a first gate; the panel layout
  and every server action independently call `requireAdmin`/`requireRole`
  (`lib/session.js`) — middleware is not treated as the authorization boundary.
- **Generic login errors.** Invalid credentials (and even a DB-connection failure
  during `authorize`) surface as the same "Invalid email or password" — no user
  enumeration.
- **Admin UI is plain React + server actions**, not the spec's
  `@tanstack/react-table` / `react-hook-form` / `tiptap` stack yet. Server
  components fetch, client components + server actions mutate, styled with the
  existing navy/green Tailwind tokens. The heavier libraries will be added in
  Phase 5 where they earn their weight (blog rich-text, big data tables).
- **`/upload/sign` is now truly protected** — `requireAdmin` reads the real
  session, so it returns 401 without a valid admin cookie (was a stub before).

## Phase 5 + 6 (full CMS + data-driven frontend) decisions

- **Config-driven CMS engine.** Rather than hand-writing ~10 editors, a single
  registry ([lib/cms/collections.js](lib/cms/collections.js)) declares each
  content type's fields; generic list/edit pages + CRUD actions render from it.
  Adding an editable type = one registry entry. The `model`/cache-tag stay
  server-side; only the plain `fields` array is passed to client form components.
- **Two new models:** `Country` (flag emoji + visa types) and `Page` (privacy /
  terms / about, rendered at `/[slug]`).
- **Everything editable:** services (incl. prices), features, process, stats,
  testimonials, FAQs, countries, pages, blog via Content; brand, hero text,
  contact/address, socials, WhatsApp, and consultation-form text via Settings.
- **Home page is now a Server Component** ([app/page.jsx](app/page.jsx)) that
  fetches all content and passes it to a client `SiteContent`. Set to
  `force-dynamic` so CMS edits show on the next refresh; reads go through
  `unstable_cache` with tags, and every mutation calls `revalidateTag`.
- **Empty-state fallbacks:** `SiteContent` ships the original hardcoded content as
  defaults, so the site looks complete even before `npm run seed` and never
  crashes on an empty collection.
- **Rich-text = raw HTML** stored/rendered as-is for now (admin-authored, so
  lower risk). DOMPurify sanitisation on write is deferred to hardening.
- **Icons are stored as lucide name strings** and mapped to components at render.
  Note: `lucide-react@1.x` **dropped brand icons** (Facebook/Instagram/…), so
  footer social links render as text-label pills, not brand glyphs.
- **Media fields accept a URL** for now (stored as a `MediaRef`). The Cloudinary
  upload UI (drag-drop media library) remains a follow-up; the signed-upload API
  and `migrate-images` script already exist.
- **Form builder (Phase 8):** the consultation form's text and visa-type options
  are editable via Settings; the full drag-drop field builder is still pending.
