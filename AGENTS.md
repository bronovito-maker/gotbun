
# Project Agent Instructions

This file provides guidance to AI agents (DeepSeek TUI, Claude Code, etc.) when working with code in this repository.

## Build and Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Lint
npm run lint
```

## Architecture Overview

GotBun Riccione Coupon 2x1 is a single-page promotional landing that collects leads, generates a dynamic 2-for-1 coupon code, and forwards the data to an n8n webhook for CRM/email automation.

**Stack**: Next.js 15 (App Router) · TypeScript · React 19 · Custom CSS · n8n webhook

**Runtime**: Node.js (server-side API route). No internal database — the coupon is generated on the fly and delivered statelessly.

### Directory Map

```
app/
├── layout.tsx              # Root layout: metadata, <html lang="it">, globals.css
├── page.tsx                # Landing page (client component): form UI, client validation, fetch to API
├── globals.css             # All visual styling (~536 lines, custom design system with CSS variables)
├── icon.svg                # Favicon
└── api/
    └── claim-coupon/
        └── route.ts        # POST handler: server validation, coupon generation, n8n webhook delivery

lib/
├── coupon.ts               # Pure functions: generateCouponCode() (crypto random), addDays()
└── validation.ts           # Server-side input validation, phone normalization (+39 prefix)

gotbun.json                 # n8n workflow import file (Airtable + Brevo nodes)
```

### Key Components

| Component | File | Responsibility |
|-----------|------|----------------|
| Landing Page | `app/page.tsx` | Client component. Renders hero, steps, benefit section, and the claim form. Reads `source`/`campaign` query params from the URL. Performs client-side validation before POSTing to the API. Shows success state with coupon code, expiry date, and official order link. In development mode, renders a debug panel with the n8n payload preview and webhook delivery status. |
| API Route | `app/api/claim-coupon/route.ts` | Server-side POST handler. Validates the request body via `validateCouponClaim()`, generates a coupon code via `generateCouponCode()`, computes expiry at `createdAt + 14 days`, and forwards the payload to the n8n webhook if `N8N_WEBHOOK_URL` is configured. Returns the coupon code, expiry, official order URL, and a `webhookSent` boolean. Gracefully degrades when the webhook URL is absent. |
| Coupon Library | `lib/coupon.ts` | Exports `generateCouponCode()` (prefix `GOTBUN-2X1-` + 6-char alphanumeric suffix via `crypto.randomBytes`) and `addDays(date, days)`. |
| Validation Library | `lib/validation.ts` | Exports `validateCouponClaim(body)` which type-guards and validates name (≥2 chars), email (regex), phone (≥8 chars, normalized to +39), privacy consent (must be true). Returns either `{ success: true, data }` or `{ success: false, errors }`. |
| Global Styles | `app/globals.css` | Custom CSS design system with CSS custom properties for colors, typography using `clamp()`, responsive grid layout, and component classes (hero, form card, success card, burger visual, steps grid, debug box). |

### Data Flow

```
URL query params (source, campaign)
        │
        ▼
┌──────────────────┐
│   Landing Page   │  Client component reads query params, stores in form state
│   (app/page.tsx) │
└──────┬───────────┘
       │ User submits form
       │ Client-side validation (validateClientForm)
       ▼
┌──────────────────┐
│  POST /api/      │
│  claim-coupon    │
└──────┬───────────┘
       │ Server-side validation (validateCouponClaim)
       │ Generate coupon code (generateCouponCode)
       │ Compute expiresAt (addDays, +14 days)
       ▼
┌──────────────────┐
│  Send webhook    │  POST to N8N_WEBHOOK_URL (if configured)
│  (n8n)           │  Payload: event, brand, name, email, phone, consent flags,
│                  │  couponCode, couponType, createdAt, expiresAt, source, campaign
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Response        │  { success, couponCode, expiresAt, officialOrderUrl, webhookSent }
│  to client       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Success card    │  Displays coupon code, expiry date, debug info (dev only),
│  (page.tsx)      │  and link to official order site (https://gotbun.it)
└──────────────────┘
```

**n8n downstream flow** (outside this codebase):
```
n8n webhook → Validate payload → Create Airtable Lead → Create/Update Brevo Contact → Send Brevo Transactional Email
```

## Configuration Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Next.js configuration (currently default, no custom settings). |
| `tsconfig.json` | TypeScript compiler options for Next.js. |
| `package.json` | Dependencies (next, react, react-dom, typescript) and scripts. |
| `.env.local` | **Not committed.** Set `N8N_WEBHOOK_URL` to the n8n production webhook. When absent, the API still works — it generates the coupon and returns `webhookSent: false`. |
| `gotbun.json` | n8n workflow template for import. Requires manual Airtable/Brevo credential configuration after import. |

## Extension Points

- **Add a new coupon type**: modify the `couponType` literal in `route.ts` (currently hardcoded `"2x1"`) and update `generateCouponCode()` in `lib/coupon.ts` to accept a type parameter.
- **Change coupon expiry**: edit the `14` argument in `addDays(createdAtDate, 14)` in `route.ts`.
- **Add new form fields**: add the field to `CouponClaimInput` in `lib/validation.ts`, update the validation logic, add the input to `page.tsx`, and include it in the webhook payload in `route.ts`.
- **Add a second webhook**: create an additional `send*Webhook` function in `route.ts` following the same pattern, keyed off another environment variable.
- **Style customization**: all visual design tokens live in CSS custom properties under `:root` in `app/globals.css`. Modify colors, spacing, or typography there.
- **SEO / metadata**: edit the `metadata` export in `app/layout.tsx`.

## Commit Messages

Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
