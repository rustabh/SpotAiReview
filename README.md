# Spot AI Review

**Turn Real Experiences Into Better Reviews.**

Live: https://spotaireview.vercel.app

Spot AI Review is an AI-assisted customer feedback and review-writing platform, built as a product inside the **Febble Spot** ecosystem. It works for any kind of business — restaurants, salons, clinics, hotels, retail, agencies, real estate, gyms, coaching institutes, and more.

The AI never invents a customer's experience. It only helps a customer put their own, real experience into words — the customer stays in control of the final review and always posts it themselves.

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **PostgreSQL** + **Prisma ORM**
- **Auth.js (NextAuth v5)** — credentials-based auth, JWT sessions, role-based access control
- **AI provider abstraction** (`src/lib/ai`) — pluggable OpenAI / Anthropic / offline Mock provider, selected via Super Admin settings or env vars
- **QR generation** via the `qrcode` package (PNG + SVG, generated on demand)
- Charts via **Recharts**

## Getting started

```bash
pnpm install
cp .env.example .env   # fill in DATABASE_URL, AUTH_SECRET, etc.
pnpm db:push            # sync the Prisma schema to your database
pnpm db:seed             # seed demo categories, plans, a super admin and a demo business owner
pnpm dev
```

Seeded logins (see `prisma/seed.ts`):

- **Super Admin:** `admin@febblespot.com` / `Admin@12345`
- **Business Owner:** `owner@demo.com` / `Owner@12345` (comes with 3 demo businesses, each with a campaign, QR code and sample feedback)

Visit `/r/<campaign-slug>` (printed by the seed script, or visible on any campaign's detail page in the dashboard) to try the public customer feedback flow.

## AI provider

By default `AI_PROVIDER=mock`, so the whole product works end-to-end without any API key — the mock provider deterministically rewrites the customer's own words into three review variants. To use a real model, set `AI_PROVIDER=openai` or `AI_PROVIDER=anthropic` and the matching API key in `.env` (or change it live from **Super Admin → Settings**, which takes priority over the env var).

## Project structure

```
prisma/schema.prisma       Full data model (see the file for entity notes)
prisma/seed.ts             Demo categories, plans, super admin, business owner, businesses
src/lib/ai/                AIProvider interface + Mock/OpenAI/Anthropic implementations, grounded prompts
src/lib/rbac.ts            Server-side role/ownership guards (the IDOR choke point)
src/actions/               Server actions — all mutations and reads go through these
src/app/(auth)/            Login, register, forgot/reset password
src/app/dashboard/         Business Owner app
src/app/admin/             Super Admin app
src/app/r/[slug]/          Public, no-login customer feedback flow
```

## What's implemented (Phase 1 + parts of Phase 2)

- Super Admin: businesses, business owners (create + audited "Login as Owner"), categories (fully dynamic, not restaurant-specific), plans, platform/AI settings, audit log
- Business Owner: multiple businesses per account, QR/NFC campaigns, review settings (tone/length/languages), team members with roles, subscription/plan switching (payment gateway not wired — architecture is Razorpay/Stripe-ready), full funnel analytics, AI insights
- Public flow: language selection, star rating, category-specific experience attributes, free-text feedback, grounded AI review drafts (natural/short/detailed), regenerate/shorter/more natural/more professional, copy + Google redirect, private feedback path for lower ratings — never blocking the public review
- Full analytics funnel event tracking (scan → started → completed → AI generated → copied → Google click)

Not yet built (by design — see spec's phased rollout): real payment processing, email delivery (reset/verification links are shown inline since no mail provider is configured), file upload storage (logo/cover use URLs for now), WhatsApp/SMS channels, white-label/agency mode.
