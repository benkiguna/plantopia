# Plantopia

Mobile-first personal plant care PWA with photo-based AI health analytics. Users upload plant photos, the app identifies species, tracks health over time via image comparison, and manages care schedules.

## Tech Stack
- Next.js 15 (App Router, TypeScript strict)
- Tailwind CSS + Fraunces (display) + Outfit (body) fonts
- Supabase (auth, Postgres DB, image storage)
- Claude API (plant identification, health analysis from photos)
- PWA with service worker for offline + push notifications

## Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run test` — Vitest unit tests
- `npm run test:e2e` — Playwright end-to-end tests
- `npx supabase db push` — apply migrations
- `npx supabase gen types typescript` — regenerate DB types

## Architecture
- `/app` — Next.js pages and layouts (mobile-first responsive)
- `/app/api` — API routes (plant CRUD, AI analysis, image upload)
- `/components` — React components (no default exports, use named)
- `/components/ui` — design system primitives
- `/lib` — utilities, Supabase client, Claude API wrapper
- `/lib/ai` — prompt templates and response parsers for plant analysis
- `/types` — shared TypeScript types
- `/supabase/migrations` — SQL migrations
- `/public` — PWA manifest, icons, service worker

## Code Style
- TypeScript strict, no `any`
- Named exports only
- Functional components with hooks
- Tailwind utilities, no custom CSS files
- Image optimization: next/image with Supabase storage URLs
- All API routes return typed JSON responses
- Error boundaries on every page

## Important
- NEVER store API keys client-side. AI calls go through `/app/api/analyze`
- All plant photos stored in Supabase Storage bucket `plant-photos`
- Image uploads must compress to max 1MB before upload (client-side)
- Health scores are 0-100 integers derived from AI analysis
- Care schedules calculate from species defaults + user environment data
- Auth is MOCK only — `MOCK_USER_ID` hardcoded, no real login flow yet
- AI model is Gemini (not Claude) — see `lib/ai/gemini.ts`

## Application Image
**Read `APP_IMAGE.md` before starting any feature or bug fix.**
It contains the live registry of routes, components, data models, API contracts,
feature status, known issues, and architectural decisions.
**Update `APP_IMAGE.md` after completing any significant change.**
