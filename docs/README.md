# AKON LANGGA — Business Management System (AL-BMS)

> _"Nourish from Within, Glow on the Outside."_

AKON LANGGA is an organic wellness brand offering herbal coffee, natural handmade skincare, and holistic self-care essentials. This repository contains the Business Management System (BMS) that powers both the customer storefront and the administrator back office.

Last updated during Bolt behavior testing.

---

## Tech Stack

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Frontend    | React + TypeScript + Vite        |
| UI          | Tailwind CSS, shadcn/ui, Framer Motion |
| Routing     | React Router                     |
| Forms       | React Hook Form + Zod             |
| Icons       | Lucide React                      |
| SEO         | React Helmet Async                |
| Backend     | Supabase _(not yet connected)_    |
| Deployment  | GitHub + Vercel                   |

---

## Getting Started

```bash
npm install
npm run dev      # start the dev server
npm run build    # type-check + production build
npm run preview  # preview the production build
npm run lint     # run ESLint
```

---

## Project Structure

```
src/
  components/
    layout/      # Navbar, Footer, Container, Section, PageHeader
    feedback/    # LoadingSpinner, EmptyState
    ui/          # shadcn/ui primitives
  layouts/       # MainLayout, AdminLayout
  pages/         # Route-level pages
  hooks/          # Custom hooks
  contexts/       # React contexts
  services/       # API / Supabase client (later phase)
  types/          # Shared TypeScript types
  lib/            # Utilities (cn, etc.)
  utils/          # General utilities
  constants/      # Brand config, navigation, etc.
  assets/         # Static assets
docs/             # Project documentation
```

---

## Pages

| Route       | Page         | Status       |
| ----------- | ------------ | ------------ |
| `/`         | Home         | Placeholder  |
| `/products` | Products     | Placeholder  |
| `/bundles`  | Bundles      | Placeholder  |
| `/about`    | About        | Placeholder  |
| `/contact`  | Contact      | Placeholder  |
| `/faq`      | FAQ          | Placeholder  |
| `/admin`    | Admin        | Placeholder  |
| `*`         | Not Found    | Implemented  |

---

## Brand Identity

- **Primary Background:** `#FFF5F7` Soft Blush Pink
- **Primary Brand Color:** `#8B1E3F` Deep Burgundy
- **Secondary Accent:** `#D97A9A` Rose Pink
- **Cards:** `#FFFFFF`
- **Website Background:** `#FFFDFB`
- **Primary Text:** `#2D2D2D`
- **Secondary Text:** `#666666`
- **Success:** `#4CAF50` · **Warning:** `#F59E0B` · **Error:** `#DC2626`

**Typography:** Playfair Display (headings) + Inter (body).

---

## Development Phases

This repository is built incrementally. See `docs/PROJECT_BLUEPRINT.md` for the full roadmap.

- **Phase 1 — Foundation** _(current)_ — architecture, layout, navigation, routing, theme, reusable components.
- **Phase 2** — Supabase integration, auth, product catalog.
- **Phase 3** — Shopping cart, checkout, admin dashboard.

---

## License

All rights reserved. © AKON LANGGA.
