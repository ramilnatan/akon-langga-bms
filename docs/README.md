# AKON LANGGA BMS

### Business Management System for AKON LANGGA — Organic Wellness & Skincare

**Nourish from Within, Glow on the Outside.**

AKON LANGGA BMS is a web-based business management system supporting the AKON LANGGA wellness and skincare business. It combines a customer-facing shopping experience with business management functionality in one application.

Built by **Engr. Ramil V. Natan**, this project demonstrates practical full-stack development, Supabase integration, customer order management, version-controlled collaboration, and production deployment.

**Live Application:** https://akonlangga.vercel.app/  
**GitHub Repository:** https://github.com/ramilnatan/akon-langga-bms

---

## Application Preview

### Customer Storefront

<img width="1366" height="691" alt="image" src="https://github.com/user-attachments/assets/be9f6b04-663c-4506-b961-e543b9c34bd8" />

### Customer My Orders

<img width="1353" height="689" alt="image" src="https://github.com/user-attachments/assets/67a1d3c1-5d13-4f0e-afd5-8a1f51794df9" />

### Admin Dashboard Overview

<img width="1363" height="706" alt="image" src="https://github.com/user-attachments/assets/0e4040c0-9139-4a88-aa3a-af9fb9ec8bad" />



---

## Project Highlights

- **Customer Storefront** — Browse available products and bundles.
- **Shopping Cart and Checkout** — Supports the customer purchasing workflow, including guest checkout.
- **Customer My Orders** — Authenticated customers can view their own order history, order details, and order status.
- **Business Management Tools** — Supports the administrative functionality implemented in the application.
- **Supabase Integration** — Uses Supabase for application data and authentication-related functionality.
- **Production Deployment** — Deployed through Vercel, with source control and pull-request reviews through GitHub.

## Technology Stack

| Area | Technology |
|---|---|
| Frontend | React 18, TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| UI Components | Radix UI |
| Backend and Data | Supabase |
| Routing | React Router |
| Forms and Validation | React Hook Form, Zod |
| Icons | Lucide React |
| Animation | Framer Motion |
| Charts | Recharts |
| Source Control | Git, GitHub |
| Hosting and Deployment | Vercel |

## Featured Delivery: Customer My Orders

Customer My Orders is a completed feature delivered through a dedicated Git feature branch and GitHub Pull Request #2.

The implementation was reviewed, tested using a Vercel Preview deployment, merged into `main` after approval, and verified on the live application.

The feature allows authenticated customers to:

- View their own orders, newest first.
- Review order references, dates, statuses, and totals.
- See the associated product or bundle details.
- Access loading, error, retry, and empty states.

Guest checkout remains available, and guest orders are not automatically displayed in the authenticated customer's My Orders page.

## Development and Delivery Workflow

The project follows a controlled, reviewable development workflow:

1. Implement changes on a dedicated feature branch.
2. Run local checks and test the feature.
3. Push the branch to GitHub.
4. Deploy and test a Vercel Preview.
5. Review the pull request and automated checks.
6. Merge after approval.
7. Verify the production deployment.

This workflow supports incremental improvements while reducing the risk of unintended changes to existing functionality.

## Run Locally

### Prerequisites

- Node.js and npm
- Authorized access to the project's Supabase configuration for features that require backend connectivity

### Installation

```bash
git clone https://github.com/ramilnatan/akon-langga-bms.git
cd akon-langga-bms
npm install
```

Create a local `.env` file containing the required client configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_or_anon_key
```

Use the appropriate client-safe key for your Supabase project. Never commit `.env` files, database passwords, service-role keys, or other private credentials.

### Available Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
npm run preview
```

- `dev` starts the local development server.
- `build` runs the TypeScript build checks and creates the production build.
- `lint` runs ESLint.
- `typecheck` runs the configured TypeScript application check.
- `preview` serves the built application locally for preview.

## Project Status

**Status: Deployed to production; ongoing development.**

AKON LANGGA BMS is live and continues to evolve through incremental, reviewed improvements. The `main` branch includes the completed Customer My Orders feature.

## About the Builder

**Engr. Ramil V. Natan**  
Licensed Electronics Engineer | Telecommunications Engineering | Software Development and AI-Assisted Building

This project reflects an engineering-led approach to digital product development: understand the requirements, implement carefully, verify the changes, review the code, and deploy responsibly.

## License and Use

This repository is maintained for the AKON LANGGA project. All rights reserved unless otherwise stated by the repository owner.

---

**AKON LANGGA**  
*Nourish from Within, Glow on the Outside.*
