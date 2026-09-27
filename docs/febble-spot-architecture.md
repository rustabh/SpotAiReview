# Febble Spot — Platform Architecture

Status: **Phase 1 in progress.** This document is the analysis + architecture requested
before implementation began, written against the *actual* existing codebase (not a
greenfield rewrite) — AiReview by Febble Spot becomes **Spot AI Review**, one module
inside the larger **Febble Spot** platform. The existing product, its live customers,
and its database keep working throughout; every change here is additive.

## 1. Product Architecture

```
                              FEBBLE SPOT
                     "One Smart Link. Your Complete Business."
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   DIGITAL IDENTITY            BUSINESS TOOLS              CUSTOMER TOOLS
        │                           │                           │
   Smart Link (/b/[slug])      Spot Menu (products/          Spot Order (cart,
   Digital Business Card       categories/variants/          table ordering,
   QR (business/table/         modifiers)                    dine-in/takeaway/
   review/menu/card)           Tables & Table Sessions        delivery)
   NFC (same destinations      Team & Roles                  Spot AI Review
   as QR)                      Analytics & AI Insights       (unchanged product,
                               Subscriptions & Billing        now one tab of the
                                                               Smart Link)
                                    │
                          ┌─────────┴─────────┐
                          │                   │
                    POS CONNECTOR         PAYMENTS
                    (interface)           (interface, already
                          │               built for Razorpay)
                 ┌────────┴────────┐
            MockPOSProvider   PetpoojaProvider (Phase 2,
            (Phase 1)         built only once real API
                               docs/credentials are in hand)
```

**One business = one `Business` row = one Smart Link.** What the Smart Link *shows*
is entirely driven by `BusinessCategory` defaults + a per-business feature override —
never a hardcoded "if restaurant" branch in a page component. A salon and a restaurant
render through the same `/b/[slug]` route; the module list differs because the data
differs, not because the code forks.

**Spot AI Review does not move.** `/r/[slug]` (today's QR/NFC review flow) keeps
working exactly as-is — it becomes one of several campaign/module types a business can
run, reachable both standalone (today's flow) and as a tab inside the Smart Link.

## 2. User Roles

Unchanged at the top, extended underneath:

| Role | Scope | New in this phase |
|---|---|---|
| `SUPER_ADMIN` | Whole platform | Manage business types/feature defaults, POS connectors, feature flags |
| `BUSINESS_OWNER` (`BusinessMember.role = OWNER`) | Their business(es) | Configure modules, menu, tables, POS, orders |
| `MANAGER` | One business | Existing — gains menu/order management by default |
| `STAFF` | One business | Existing — gains order view/update by default |
| *(new, Phase 3)* `KITCHEN`, `CASHIER` | One business | Narrower order-only permission sets — modeled as `BusinessMember.permissions` (already a `Json?` column), not new enum values, so this needs no migration when it lands |
| Anonymous customer | One `CustomerSession` | Unchanged principle: **no login**, ever, for ordering/reviews/menu/card |

## 3. Feature Matrix (category defaults)

`BusinessCategory.defaultFeatures` (new `Json` column) ships a features object; each
`Business.featureOverrides` (new `Json` column, nullable) can flip any individual flag
without needing a developer or a new category. Effective value = override ?? category
default ?? platform default (false).

| Feature key | Restaurant/Cafe | Salon/Spa/Clinic | Retail | Agency/Services |
|---|---|---|---|---|
| `menu` | on | off | off | off |
| `products` | off | off | on | off |
| `services` | off | on | off | on |
| `tables` | on | off | off | off |
| `ordering` | on | off | optional | off |
| `appointments` | off | on | off | optional |
| `pos` | optional | off | optional | off |
| `reviews` | on | on | on | on |
| `digitalCard` | on | on | on | on |

Read with `getEffectiveFeatures(business)` (`src/lib/features.ts`, added this phase) —
the single function every UI surface and API route calls; nothing else is allowed to
read `category.defaultFeatures` or `business.featureOverrides` directly.

## 4. Database Schema (this phase's additions)

All additive — no existing column dropped or renamed, no existing row touched.

```
BusinessCategory  + defaultFeatures Json
Business          + featureOverrides Json?

ProductCategory    (businessId, name, order)
Product            (businessId, categoryId, name, price, isVeg?, spiceLevel?, tags,
                     isAvailable, posExternalId?)
ProductVariant     (productId, name, priceDelta, posExternalId?)
ProductModifierGroup (productId, name, minSelect, maxSelect, isRequired)
ProductModifierOption (groupId, name, priceDelta, posExternalId?)

RestaurantTable    (businessId, number, section?, capacity?, status, qrToken unique)
TableSession       (businessId, tableId, code unique, status, openedAt, closedAt)

Order              (businessId, tableSessionId?, type, status, customerName?,
                     customerPhone?, deliveryAddress Json?, subtotal, taxAmount,
                     chargesAmount, totalAmount, currency, code unique,
                     idempotencyKey unique, posOrderId?, posSyncStatus,
                     specialInstructions?)
OrderItem          (orderId, productId, productName snapshot, variantId?,
                     variantName snapshot, quantity, unitPrice, lineTotal,
                     specialInstructions?)
OrderItemModifier  (orderItemId, modifierOptionId, name snapshot, priceDelta)

POSIntegration     (businessId, provider, status, lastMenuSyncAt?, lastOrderSyncAt?,
                     lastError?)
POSCredential      (posIntegrationId, encryptedPayload — app-level AES-encrypted,
                     never read outside src/lib/pos/**)
POSSyncLog         (posIntegrationId, type, status, message?, createdAt)
```

Snapshots (`productName`, `variantName`, modifier `name` on order rows) are
deliberate: an order must keep showing what the customer actually ordered even if the
menu item is renamed or deleted later — the same principle Spot AI Review already
follows by never mutating a submitted `CustomerFeedback` row.

`idempotencyKey` on `Order` is `@unique` — see §9.

## 5. API Architecture

Existing pattern kept: Next.js Server Actions for anything invoked from this app's own
UI (no public REST surface needed there), reserving `/api/v1/*` route handlers for
things an external system calls into — POS webhooks, and later a public ordering API
if a business ever needs one outside this app's own pages.

```
src/actions/
  menu.ts          — CRUD for ProductCategory/Product/Variant/Modifier (owner/manager)
  tables.ts         — create/deactivate tables, open/close/merge sessions
  orders.ts         — createOrder (customer, anonymous), updateOrderStatus (staff),
                       cancelOrder
  pos.ts            — connect/disconnect, syncMenuNow, getConnectionHealth

src/app/api/v1/
  webhooks/pos/[provider]/route.ts   — signature-verified inbound POS events
```

`/api/v1/` is versioned from day one per the spec even though v1 is also, today, the
only version — this avoids ever needing a breaking migration later.

## 6. Folder Structure (additions)

```
src/lib/pos/
  types.ts            — POSProvider interface (§9)
  mock-provider.ts    — MockPOSProvider
  petpooja-provider.ts — Phase 2, built against real docs/credentials only
  index.ts            — getPOSProvider(business) factory

src/lib/features.ts   — getEffectiveFeatures(), FEATURE_KEYS
src/lib/order-code.ts — human-readable order code generator (SP####)

src/app/b/[slug]/                — the Smart Link itself (new customer-facing route)
  page.tsx                       — dynamic module list per business
  menu/page.tsx
  order/page.tsx                 — cart + checkout
  services/page.tsx
  layout.tsx

src/app/dashboard/catalogue/     — owner menu/product builder (NOT /dashboard/menu —
                                    that path is already the mobile hamburger nav page)
src/app/dashboard/tables/        — owner table + QR management
src/app/dashboard/orders/        — order queue dashboard
src/app/dashboard/settings/pos/  — POS connection settings

src/components/smart-link/       — customer-facing module components
src/components/menu/             — owner menu-builder components
src/components/orders/           — order dashboard components
```

`/r/[slug]` (Spot AI Review) and everything under `src/app/dashboard/analytics`,
`campaigns`, `feedback` etc. are untouched.

## 7. Component Architecture

Same conventions already in place: server components fetch data and pass typed props;
`"use client"` only where interaction/state is required (cart state, modifier
selection, live order status polling). The cart is a client-side reducer
(`useCart` hook) backed by the anonymous `CustomerSession`, mirroring how the existing
review flow already tracks an anonymous session without a login.

## 8. Authentication Architecture

Unchanged. Business owner/staff auth stays Auth.js credentials-based; customers
ordering, reviewing, or viewing a menu/card **never** authenticate — an anonymous
`CustomerSession` row (already the pattern for reviews) is reused for orders too, so a
Smart Link visit that leads to both a menu view and, later, a review, is one
continuous session, not two disconnected anonymous identities.

## 9. POS Connector Architecture

```ts
// src/lib/pos/types.ts
interface POSProvider {
  testConnection(): Promise<{ ok: boolean; error?: string }>;
  syncMenu(): Promise<{ categories: PosCategory[]; products: PosProduct[] }>;
  createOrder(order: OrderPayload): Promise<{ posOrderId: string }>;
  getOrderStatus(posOrderId: string): Promise<PosOrderStatus>;
  cancelOrder(posOrderId: string): Promise<void>;
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
}
```

`getPOSProvider(business)` returns `MockPOSProvider` when no `POSIntegration` row
exists or a provider isn't yet built, and the real provider once one is connected —
**the order flow calls only this interface**, never a provider class directly, so
Petpooja (or anything after it) drops in without touching `actions/orders.ts`.

`MockPOSProvider` (Phase 1): keeps an in-memory/DB-backed fake menu and order status
ladder (`RECEIVED → ACCEPTED → PREPARING → READY → COMPLETED` on a timer) so the full
ordering flow — including "POS" status updates reaching the customer — works
end-to-end with zero external dependency, exactly per the "no fake buttons, use a
mock behind the real interface" rule.

**Petpooja is not implemented yet.** Per the brief's own rule (§64), inventing
endpoints against undocumented behavior is worse than not building it — it becomes
implemented once Petpooja's official API docs and this merchant's credentials are
available, as `PetpoojaProvider implements POSProvider`, with zero changes to
`actions/orders.ts` or the customer-facing order flow.

Credentials: `POSCredential.encryptedPayload` is encrypted at rest with a server-only
key (`POS_CREDENTIAL_ENCRYPTION_KEY`, AES-256-GCM), decrypted only inside
`src/lib/pos/**`. Every action/query the dashboard uses returns status/timestamps
only — `connect`, `status`, `lastMenuSyncAt` — never the credential payload itself.

## 10. AI Architecture

Unchanged provider abstraction (`src/lib/ai/`) gains two call sites, both opt-in per
business and both bound by the same never-fabricate rule the review generator already
follows:

- **Menu description assist** — owner-triggered, drafts a description from the
  product's own name/category/tags; owner edits and saves, nothing auto-publishes.
- **AI Business Insights** (Phase 3) — reads only this business's own orders/reviews/
  feedback rows and states observed patterns ("Paneer Tikka is your most-ordered
  item this month") — never a claim not traceable to a query result.

## 11. Analytics Architecture

Extends `AnalyticsEvent` with new `AnalyticsEventType` values (`MENU_VIEWED`,
`PRODUCT_VIEWED`, `CART_ITEM_ADDED`, `ORDER_PLACED`) rather than a parallel events
table — one funnel, one dashboard query pattern, whether the event is a review-flow
step or an order-flow step.

## 12. QR / NFC Architecture

`RestaurantTable.qrToken` is a table-scoped opaque token, resolved the same way a
`ReviewCampaign.slug` is today — `/order/[qrToken]` looks up business + table in one
query, exactly mirroring `/r/[slug]`. Business QR, menu QR, and digital-card QR are
just `ReviewCampaign`-style destinations with a `purpose` discriminator rather than
new one-off tables — the existing `QRCode`/`NFCDevice` models and their analytics
already generalize; a table is the one genuinely new destination type, everything
else reuses what Spot AI Review already built.

---

## What Phase 1 actually ships, in order

1. ✅ **This document.**
2. **Schema foundation** (this commit): feature-flag columns, and every model in §4 —
   additive, safe to migrate on the live database, ships with zero UI yet.
3. **POS interface + MockPOSProvider** (this commit) — no UI yet, but the order flow
   has something real to call from day one.
4. Menu builder (owner) → digital menu (customer, read-only) — no ordering yet.
5. Tables + table QR generation (owner).
6. Cart + checkout + order creation (customer) → MockPOSProvider.
7. Order dashboard (owner/staff) with status updates.
8. Wire the post-order "How was your experience?" prompt into the existing Spot AI
   Review flow (reuse `CustomerSession`/`CustomerFeedback`, don't fork it).
9. Basic funnel analytics for the new events.

Each step ships and is verified independently, the same way every feature this
session has built so far has — not as one large uninspectable change.

Phase 2 (POS real integration, payments-in-order, webhook system) and Phase 3
(multi-location, teams beyond today's roles, AI insights, appointments, subscriptions
limits enforcement, PWA ordering, WhatsApp) follow once Phase 1's flow is live and
used, per the brief's own sequencing.
