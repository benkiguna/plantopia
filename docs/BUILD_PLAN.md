# Plantopia — Phased Build Plan

> Each phase is scoped to one Claude Code session. Start each session with:
> "Read /docs/BUILD_PLAN.md and implement Phase X."

---

## Phase 1: Project Scaffold + Design System

**Goal:** Empty app that runs, with the design system and mobile shell ready.

**Tasks:**
1. Initialize Next.js 15 with TypeScript, Tailwind, App Router
2. Configure Fraunces + Outfit fonts via `next/font/google`
3. Set up Tailwind theme with project colors:
   - `--forest: #0D2818`, `--green: #2D6A1E`, `--green-light: #4A9D2F`
   - `--cream: #FFFAF5`, `--coral: #D94F3B`, `--amber: #E5970F`, `--sky: #4AADE5`
4. Create mobile shell layout: sticky top bar, bottom navigation (Garden, +Add, Insights)
5. Build UI primitives in `/components/ui`:
   - `HealthRing` (SVG circular progress)
   - `ActionButton` (tap-responsive with scale animation)
   - `Card` (rounded, shadow, hover lift)
   - `Badge` (colored tag)
   - `BottomNav` (fixed, glass-morphism blur)
6. Add PWA manifest and basic service worker
7. Create placeholder pages: `/`, `/plant/[id]`, `/add`

**Done when:** `npm run dev` shows a mobile-width app shell with bottom nav, correct fonts and colors, and placeholder content on all three routes.

---

## Phase 2: Supabase + Data Layer

**Goal:** Database, auth, and type-safe data access working.

**Tasks:**
1. Set up Supabase project (document connection in `.env.local.example`)
2. Create SQL migrations for tables:
   - `profiles` (id, email, name, created_at)
   - `plants` (id, user_id, species_key, nickname, light_setup, pot_size, soil_type, created_at)
   - `health_entries` (id, plant_id, photo_url, health_score, ai_notes, issues, user_notes, created_at)
   - `care_logs` (id, plant_id, action, notes, created_at)
   - `species` (key, name, water_days, light, humidity, fertilize_days, tip)
3. Set up Row Level Security policies (users see only their own data)
4. Create Supabase client in `/lib/supabase.ts` (server + client)
5. Generate TypeScript types from schema
6. Seed `species` table with 8-10 common houseplants
7. Create data access functions in `/lib/data`:
   - `getPlants(userId)`, `getPlant(plantId)`
   - `createPlant(...)`, `updatePlant(...)`
   - `addHealthEntry(...)`, `getHealthTimeline(plantId)`
   - `addCareLog(...)`, `getCareLog(plantId)`
8. Set up Supabase Auth with email/magic link
9. Add auth middleware to protect all routes except `/login`

**Done when:** You can sign up, create a plant via Supabase dashboard, and query it back with correct types. RLS blocks cross-user access.

---

## Phase 3: Plant Registration Flow (Add Plant)

**Goal:** Full onboarding flow: photo → identify → light → name → save.

**Tasks:**
1. Build `/add` as a multi-step flow with shared state (React context or URL params)
2. **Step 1 — Photo Capture:**
   - Camera button triggers `<input type="file" accept="image/*" capture="environment">`
   - Client-side image compression (canvas resize to max 1200px, JPEG 0.8 quality)
   - Show uploaded photo preview with retake option
   - Upload compressed image to Supabase Storage `plant-photos` bucket
3. **Step 2 — Species Identification:**
   - POST photo to `/api/analyze/identify` which calls Claude API with the image
   - Prompt: "Identify this plant species. Return top 3 matches with confidence %."
   - Display results as selectable cards with species name, confidence, basic care info
   - "None of these" option → manual text search against `species` table
   - If AI confidence < 60% on all matches, show clarification UI: "Can you take a closer photo of a leaf?"
4. **Step 3 — Light Setup:**
   - 4 options: Bright Direct, Bright Indirect, Medium, Low
   - Each with icon, label, and one-line description
   - Optional: "Take a photo of where this plant lives" for AI light assessment
5. **Step 4 — Name & Confirm:**
   - Text input for nickname (placeholder = species name)
   - Preview card showing photo, name, species, light setup
   - "Add to Garden" button → insert to `plants` table + first `health_entries` row
   - Redirect to home with success toast

**Done when:** A user can photograph a plant, get AI identification, configure light, name it, and see it appear on the home screen.

---

## Phase 4: Home Screen + Plant Cards

**Goal:** Garden view with large photo cards, health indicators, and quick actions.

**Tasks:**
1. Fetch user's plants with latest health entry (JOIN query)
2. Build plant card component:
   - Full-width, 220px tall photo area (Supabase storage URL via next/image)
   - Plant illustration SVG fallback if no photo
   - Health ring overlay (bottom-right corner, glass-morphism background)
   - Plant name + species as text overlay on gradient at bottom of image
   - Urgent "NEEDS WATER" badge (pulsing animation) when overdue
   - Health trend indicator (↑ +5, ↓ -3, → stable) comparing last two entries
   - Watering streak counter
3. Quick action buttons below each card: Water, Feed, Check-in
   - Water: insert `care_log` entry, recalculate next water date, show drop animation
   - Feed: insert `care_log` entry for fertilize
   - Check-in: navigate to `/plant/[id]/check-in`
4. Stats strip at top: total plants, avg health %, plants needing care
5. Urgent care banner when any plant is overdue for water
6. Empty state for new users: illustration + "Add your first plant" CTA

**Done when:** Home screen loads real data, cards show photos with health overlays, quick actions write to database and update UI optimistically.

---

## Phase 5: Plant Detail View

**Goal:** Deep-dive into a single plant with tabs for health, care, insights, setup.

**Tasks:**
1. Build `/plant/[id]` page with hero image (320px, parallax-ish scroll)
2. Back button, camera check-in button in header overlay
3. Quick care action row: Water, Feed, Mist, Rotate (all write to `care_logs`)
4. Tab system with 4 tabs:
   - **Health:** SVG trend chart (smooth bezier line), health timeline with vertical dot connector
   - **Care:** Species care guide (water, light, fertilize, humidity) + activity log from `care_logs`
   - **AI Insights:** Latest AI analysis text + species-specific pro tip
   - **Setup:** Environment settings (light, pot, soil, location) with edit capability
5. Health timeline entries: date, score, AI notes, linked photo (tap to view full)
6. "Upload New Photo for Analysis" button → reuses check-in flow

**Done when:** Tapping a plant from home opens full detail with real data across all 4 tabs. Care actions persist to database.

---

## Phase 6: Photo Check-in + AI Health Analysis

**Goal:** Users upload regular photos; AI compares to history and scores health.

**Tasks:**
1. Build `/plant/[id]/check-in` page:
   - Camera/upload UI (reuse photo capture component from Phase 3)
   - Optional user notes text field
   - "Analyze" button
2. Build `/api/analyze/health` endpoint:
   - Accepts: new photo (base64), plant species, previous health entries (last 3 photos + scores)
   - Claude API prompt:
     ```
     You are a plant health analyst. Given:
     - Species: {species}
     - Current photo: {photo}
     - Previous assessments: {history}
     - Environment: {light, humidity}
     
     Analyze the plant and return JSON:
     {
       "health_score": 0-100,
       "trend": "improving" | "stable" | "declining",
       "observations": ["string"],
       "issues": [{"name": "string", "severity": "low|medium|high", "recommendation": "string"}],
       "comparison_to_previous": "string"
     }
     ```
   - Parse response, insert new `health_entries` row
3. Show results screen: health score with animation, trend arrow, AI observations, specific issues with severity badges
4. "Save & Return" → navigate to plant detail, health tab

**Done when:** A user can photograph a plant, receive an AI health score with specific observations, and see the new data point appear on the health timeline chart.

---

## Phase 7: Care Schedule + Reminders

**Goal:** Smart scheduling engine with push notification reminders.

**Tasks:**
1. Calculate next care dates from species defaults + last `care_log` entries
2. Build schedule view (accessible from bottom nav or plant detail):
   - Grouped by urgency: Overdue → Today → This Week → Later
   - Each item: plant photo thumbnail, plant name, action type, due date
   - Swipe-to-complete or tap to mark done
3. Implement web push notifications:
   - Service worker notification handler
   - Permission request flow (first time only, explain value before asking)
   - Supabase Edge Function or cron to check due dates and send pushes
4. Morning digest notification: "3 plants need care today: Monty (water), Figaro (mist), Ziggy (fertilize)"
5. Snooze option: "Remind me in 2 hours" / "Skip today"

**Done when:** Care schedule shows calculated due dates from real data. Push notifications fire for overdue items (test with service worker in dev).

---

## Phase 8: Polish, Performance, Testing

**Goal:** Production-ready quality, performance, and test coverage.

**Tasks:**
1. Add loading skeletons for all data-fetching states
2. Implement optimistic UI updates for all care actions
3. Add error boundaries with friendly recovery UI
4. Image optimization: lazy loading, blur placeholders, WebP conversion
5. Offline support: cache plant data in service worker, queue care actions
6. Animations: page transitions, card appear stagger, water drop effect, health ring fill
7. Write Vitest unit tests for: data access functions, schedule calculation, AI response parsing
8. Write Playwright e2e tests for: sign up → add plant → check-in → view health flow
9. Lighthouse audit: target 95+ on mobile performance, accessibility, PWA
10. Responsive breakpoints: works on 320px to 768px (tablet optional)

**Done when:** All tests pass, Lighthouse scores 95+, app works offline for basic actions, animations are smooth on mid-range phones.

---

## How to Use This Plan with Claude Code

**Starting a phase:**
```bash
claude
> Read CLAUDE.md and /docs/BUILD_PLAN.md. Implement Phase 1.
```

**Mid-phase course correction:**
```bash
> The bottom nav isn't using glass-morphism. Check the design specs in BUILD_PLAN.md Phase 1 task 5 and fix it.
```

**Reviewing before moving on:**
```bash
> Review the "Done when" criteria for Phase 3. Does our current implementation meet all of them? List any gaps.
```

**Key tips:**
- One phase per Claude Code session. Use `/clear` between phases.
- Use Plan Mode (Shift+Tab twice) before each phase to let Claude read the codebase and propose an approach. Review the plan before approving.
- After Phase 2, always start sessions with: "Read the codebase structure first, then implement Phase X."
- If Claude goes off-track, use `/rewind` to go back rather than trying to fix forward.
- Commit after each phase. Use: "Commit all changes with message: Phase X complete — [summary]"
