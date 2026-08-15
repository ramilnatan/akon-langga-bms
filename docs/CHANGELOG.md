# Changelog

All notable changes to the AKON LANGGA Business Management System are documented here.
This project follows [Keep a Changelog](https://keepachangelog.com/) conventions.

## [Unreleased]

### Added — Phase 1: Foundation

- Project scaffolding with React, TypeScript, and Vite.
- Brand design tokens (color palette, typography, spacing, shadows) wired into Tailwind CSS.
- Playfair Display + Inter font loading via Google Fonts.
- Reusable layout components: `Container`, `Section`, `PageHeader`, `Navbar`, `Footer`.
- Reusable feedback components: `LoadingSpinner`, `EmptyState`.
- `MainLayout` (customer storefront) and `AdminLayout` (placeholder) shells.
- Sticky, responsive navigation with animated mobile menu.
- Footer with quick links and social icon placeholders.
- Placeholder pages: Home (hero), Products, Bundles, About, Contact, FAQ, Admin.
- Custom 404 Not Found page.
- React Router configuration with lazy-loaded pages and Suspense fallback.
- React Helmet Async for per-page SEO meta tags.
- Framer Motion entrance animations on Home and About sections.
- Centralized brand constants (`src/constants/brand.ts`) and shared types (`src/types/`).
- Project documentation: README, CHANGELOG, PROJECT_BLUEPRINT.

### Pending (later phases)

- Supabase connection and database schema.
- Authentication (admin + customer).
- Product catalog and CRUD.
- Shopping cart and checkout.
- Admin dashboard.
