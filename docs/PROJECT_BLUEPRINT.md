# AKON LANGGA — Project Blueprint

This document outlines the architecture, roadmap, and conventions for the AKON LANGGA Business Management System (AL-BMS).

---

## 1. Overview

AKON LANGGA is a Business Management System for an organic wellness brand spanning three product lines:

- Herbal Coffee
- Natural Handmade Skincare
- Holistic Wellness Essentials

The system serves two audiences:

- **Customers** — browse products, view bundles, contact the business, read FAQs.
- **Administrator (Business Owner)** — manage products, bundles, orders, and content.

---

## 2. Architecture

### Frontend

- **React + TypeScript + Vite** — SPA with strict typing.
- **Tailwind CSS + shadcn/ui** — design system built on brand tokens.
- **Framer Motion** — subtle, tasteful animations.
- **React Router** — file-route-style lazy loading with Suspense.
- **React Hook Form + Zod** — typed, validated forms (later phases).
- **React Helmet Async** — per-page SEO.

### Backend (later phases)

- **Supabase** — Postgres database, auth, storage, edge functions.
- Row Level Security (RLS) on every table.
- Snake_case for database identifiers; camelCase in app code; PascalCase for components.

### Layering

```
UI components  →  hooks  →  services  →  Supabase
   (render)     (logic)    (data)       (storage)
```

- `components/` — presentational + shadcn/ui primitives.
- `hooks/` — reusable logic (e.g., `useAuth`, `useCart`).
- `services/` — Supabase client and data access functions.
- `types/` — shared TypeScript interfaces.
- `constants/` — brand config, navigation, static data.
- `contexts/` — React context providers (auth, cart, theme).

---

## 3. Design System

### Color Tokens (HSL CSS variables → Tailwind)

| Token       | Hex       | Usage                  |
| ----------- | --------- | ---------------------- |
| background  | `#FFFDFB` | Website background     |
| surface     | `#FFF5F7` | Soft blush sections    |
| card        | `#FFFFFF`  | Cards                  |
| primary     | `#8B1E3F`  | Deep burgundy brand    |
| secondary   | `#D97A9A`  | Rose pink accent       |
| foreground  | `#2D2D2D`  | Primary text           |
| muted-foreground | `#666666` | Secondary text     |
| success     | `#4CAF50`  | Success states         |
| warning     | `#F59E0B`  | Warning states         |
| destructive | `#DC2626`  | Error states           |

### Typography

- Headings: **Playfair Display** (400–800).
- Body: **Inter** (300–700).
- Line height: 1.2 headings, 1.6 body.

### Spacing & Radius

- 8px spacing system via Tailwind defaults.
- `--radius: 0.75rem` with `sm`/`md`/`lg` derivatives.

### Shadows

- `soft`, `card`, `elevated` — burgundy-tinted, layered.

---

## 4. Roadmap

### Phase 1 — Foundation _(current)_

- Architecture, layout, navigation, routing, theme.
- Reusable components and placeholder pages.
- No backend, no business logic, no CRUD.

### Phase 2 — Backend & Catalog

- Connect Supabase.
- Auth: admin (email/password) + optional customer accounts.
- Database schema: products, bundles, categories, faqs, orders.
- RLS policies on every table.
- Product listing, detail, and filtering.

### Phase 3 — Commerce

- Shopping cart (client state + persistence).
- Checkout flow (Stripe integration).
- Order management.
- Admin dashboard: product CRUD, order review, content management.

### Phase 4 — Polish

- SEO sitemap, structured data.
- Performance auditing, image optimization.
- Accessibility audit (WCAG AA).
- Analytics integration.

---

## 5. Coding Conventions

- **Database:** snake_case.
- **React variables:** camelCase.
- **React components:** PascalCase.
- Components stay under ~250 lines; extract logic into hooks.
- Prefer composition over duplication.
- No placeholders in shipped features — placeholder pages are explicit and labeled with `TODO`.
- Strict TypeScript: no `any` unless unavoidable.

---

## 6. Deployment

- **GitHub** for source control.
- **Vercel** for hosting, connected to the GitHub repo.
- Environment variables managed via Vercel project settings (Supabase keys, etc.).
