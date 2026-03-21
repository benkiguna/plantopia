# Plantopia — Application Image
<!-- LIVING DOCUMENT: Update this file whenever routes, components, data models, features, or known issues change. -->
<!-- AI INSTRUCTION: Before adding a feature or fixing a bug, read the relevant sections. After completing work, update the affected sections. -->

**Last Updated**: 2026-03-21
**Version**: 0.2.0
**Stage**: Pre-auth MVP

---

## 1. System Overview

| Property | Value |
|----------|-------|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Storage | Supabase Storage (`plant-photos` bucket) |
| AI | Google Gemini (via `lib/ai/gemini.ts`) |
| Animations | Framer Motion v12 |
| Icons | Phosphor Icons (`@phosphor-icons/react`) |
| Fonts | Fraunces (display/serif), Outfit (body), JetBrains Mono |
| Auth | Supabase Auth — email/password + Google OAuth |
| PWA | Service worker registered, push not implemented |
| Deployment | Vercel (inferred from Next.js) |

**Key constraints:**
- All API calls to AI go through `/app/api/` — never client-side
- Images compressed to max 1MB client-side before upload
- Health scores are integers 0–100
- Real Supabase Auth with email/password and Google OAuth

---

## 2. Route Registry

| Route | Type | Purpose | Auth Required |
|-------|------|---------|---------------|
| `/` | Client (RSC shell) | Garden home — plant list + stats | Yes |
| `/add` | Client | Add plant wizard (4 steps) | Yes |
| `/plant/[id]` | Server RSC | Plant detail — health, care, setup | Yes |
| `/schedule` | Server RSC | Care schedule — overdue/today/week | Yes |
| `/insights` | Static | Placeholder insights page | Yes |
| `/auth` | Client | Login / Sign-up (email + Google) | No |
| `/auth/callback` | API GET | Supabase OAuth callback | No |
| `/api/plants` | API POST | Create new plant | Yes |
| `/api/plants/[id]` | API GET/PATCH/DELETE | Fetch / update / delete plant | Yes |
| `/api/care` | API POST | Log care action | Yes |
| `/api/analyze/identify` | API POST | AI: identify plant from photo | Yes |
| `/api/analyze/health` | API POST | AI: health analysis from photo | Yes |
| `/api/analyze/light` | API POST | AI: light level from room photo | Yes |
| `/api/analyze/search` | API POST | AI: search species by name | Yes |
| `/api/species` | API GET/POST | Species lookup/creation | Yes |
| `/api/image/convert` | API POST | Image format conversion utility | Yes |

---

## 3. Key Component Registry

### Pages & Shells
| Component | File | Responsibility |
|-----------|------|----------------|
| `RootLayout` | `app/layout.tsx` | Fonts, global background, PageTransition, PushPromptView |
| `MobileShell` | `components/MobileShell.tsx` | Max-width container, TopBar. BottomNav hidden. |
| `PageTransition` | `components/PageTransition.tsx` | `AnimatePresence mode="popLayout"` keyed by pathname |
| `GardenView` | `components/GardenView.tsx` | Home page — fetches plants client-side, sun icon, stats, card list |
| `AddPlantFlow` | `components/add-plant/AddPlantFlow.tsx` | 4-step state machine for adding a plant |

### Plant Detail
| Component | File | Responsibility |
|-----------|------|----------------|
| `PlantDetailHero` | `components/plant-detail/PlantDetailHero.tsx` | Hero photo with `layoutId` (shared element transition), health gauge, name |
| `PlantActionRow` | `components/plant-detail/PlantActionRow.tsx` | Warning icon (expandable) + Check In button |
| `QuickCareActions` | `components/plant-detail/QuickCareActions.tsx` | 4 animated care tiles with 5s undo |
| `PlantDetailTabs` | `components/plant-detail/PlantDetailTabs.tsx` | Tab switcher: Health / Care / Setup |
| `CheckInOverlay` | `components/plant-detail/CheckInOverlay.tsx` | Camera overlay: idle → analyzing → success/error |
| `HealthGauge` | `components/plant-detail/HealthGauge.tsx` | 270° SVG arc gauge for health score |

### Tabs
| Component | File | Responsibility |
|-----------|------|----------------|
| `HealthTab` | `components/plant-detail/tabs/HealthTab.tsx` | Health score, AI analysis breakdown, check-in history |
| `CareTab` | `components/plant-detail/tabs/CareTab.tsx` | Care schedule, species guide, activity log |
| `SetupTab` | `components/plant-detail/tabs/SetupTab.tsx` | Plant metadata, light setup, light analysis |

### Garden Home
| Component | File | Responsibility |
|-----------|------|----------------|
| `GardenPulseHeader` | `components/GardenPulseHeader.tsx` | Animated SVG stats card (plants, avg health, alerts) |
| `PlantCard` | `components/PlantCard.tsx` | Plant summary card with `layoutId` photo for transition |

### Add Plant Steps
| Component | File | Responsibility |
|-----------|------|----------------|
| `PhotoCaptureStep` | `components/add-plant/PhotoCaptureStep.tsx` | Step 1: take/upload photo, compress, run identification |
| `SpeciesSelectStep` | `components/add-plant/SpeciesSelectStep.tsx` | Step 2: pick AI match or manual search |
| `LightSetupStep` | `components/add-plant/LightSetupStep.tsx` | Step 3: pick light level or analyze room photo |
| `NameConfirmStep` | `components/add-plant/NameConfirmStep.tsx` | Step 4: confirm nickname + submit |

---

## 4. Data Model

### `plants`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `user_id` | uuid | FK → profiles.id |
| `species_key` | text | FK → species.key (nullable) |
| `nickname` | text | User-given name |
| `light_setup` | text | e.g. `bright_indirect` |
| `light_photo_url` | text | Supabase URL (nullable) |
| `light_analysis` | jsonb | AI light analysis result (nullable) |
| `pot_size` | text | nullable |
| `soil_type` | text | nullable |
| `location` | text | nullable |
| `created_at` | timestamptz | Used as base date when no care logs exist |
| `updated_at` | timestamptz | |

### `species`
| Column | Type | Notes |
|--------|------|-------|
| `key` | text | PK (e.g. `monstera_deliciosa`) |
| `name` | text | Display name |
| `water_days` | int | Watering interval |
| `fertilize_days` | int | Fertilizing interval |
| `light` | text | Light requirement |
| `humidity` | text | `low` / `medium` / `high` |
| `tip` | text | Care tip shown in app |

**Current count**: 47 species (as of 2026-03-21)

### `health_entries`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `plant_id` | uuid | FK → plants.id |
| `photo_url` | text | Supabase Storage URL |
| `health_score` | int | 0–100 |
| `issues` | jsonb | Array of `{ name, severity, recommendation }` |
| `ai_notes` | text | AI summary text |
| `analysis` | jsonb | Full analysis object (dimensions, positive_signs, concerns) |
| `created_at` | timestamptz | |

**Analysis JSON shape:**
```ts
{
  overall_score: number,          // 0–100
  summary: string,
  positive_signs: string[],
  concerns: { issue: string, severity: 'low'|'medium'|'high', recommendation: string }[],
  dimensions: {
    leaf_health: number,
    growth_vitality: number,
    pest_disease: number,
    hydration: number,
    overall_appearance: number
  }
}
```

### `care_logs`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK |
| `plant_id` | uuid | FK → plants.id |
| `action` | text | `water` / `fertilize` / `mist` / `rotate` / `repot` / `prune` |
| `notes` | text | nullable — DB supports it, UI does not yet |
| `created_at` | timestamptz | |

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | PK (matches Supabase auth UID) |
| `email` | text | nullable |
| `name` | text | nullable |
| `push_subscription` | jsonb | Web Push subscription object |
| `created_at` | timestamptz | |

---

## 5. API Registry

### `POST /api/plants`
**Purpose:** Create a new plant end-to-end (upload photo, create species if needed, run initial health analysis)

**Input:**
```ts
{
  speciesKey: string,
  speciesName: string,
  careInfo: object,
  nickname: string,
  lightSetup: string,
  photoUrl: string,       // Supabase URL (already uploaded)
  photoBase64: string,    // For AI analysis
  lightPhotoUrl?: string,
  lightAnalysis?: object
}
```

**Output:** `{ plant, healthEntry, analysis }`

**Side effects:** Creates species row if not exists, creates health entry, runs AI analysis

---

### `POST /api/care`
**Purpose:** Log a care action

**Input:** `{ plantId, action, notes? }`

**Output:** `{ careLog }`

**Side effects:** Inserts `care_logs` row, calls `revalidatePath(/plant/[id])`

---

### `POST /api/analyze/identify`
**Purpose:** AI plant identification from photo

**Input:** `{ imageBase64: string }`

**Output:**
```ts
{
  matches: { speciesKey, speciesName, confidence, careInfo }[],
  needsClarification: boolean,
  clarificationMessage?: string
}
```

---

### `POST /api/analyze/health`
**Purpose:** AI health analysis — new check-in OR re-analyze existing

**Input (new):** `{ plantId, imageBase64 }`

**Input (re-analyze):** `{ plantId, healthEntryId }`

**Output:** `{ health_score, healthEntry, analysis }`

**Side effects:** Uploads photo (if new), creates/updates health entry, `revalidatePath(/plant/[id])`

---

### `POST /api/analyze/light`
**Purpose:** AI light level analysis from room photo

**Input:** `{ imageBase64: string }`

**Output:**
```ts
{
  light_level: string,
  light_source: string,
  estimated_daily_hours: number,
  notes: string,
  confidence: number
}
```

---

### `POST /api/analyze/search`
**Purpose:** Search species by name using AI

**Input:** `{ query: string }`

**Output:** `{ results: PlantSearchResult[] }`

---

## 6. Care Schedule Logic

Located in `lib/data/care.ts`

**Next care date calculation:**
```
baseDate = lastCareLog.created_at ?? plant.created_at ?? today
nextDate = baseDate + species.water_days (or fertilize_days)
```

**Overdue:** `nextDate < now`

**Intervals by action:**
| Action | Interval Source |
|--------|----------------|
| water | `species.water_days` (fallback: 7) |
| fertilize | `species.fertilize_days` (fallback: 30) |
| mist | Hardcoded 3 days |
| rotate | Hardcoded 7 days |

**Note:** Mist and rotate are NOT shown on the `/schedule` page. Only water and fertilize appear there.

---

## 7. AI Capabilities

| Capability | Route | Model | Input | Output |
|-----------|-------|-------|-------|--------|
| Plant identification | `/api/analyze/identify` | Gemini | Plant photo (base64) | Species matches with confidence |
| Health analysis | `/api/analyze/health` | Gemini | Plant photo (base64) | Score, dimensions, concerns, summary |
| Light analysis | `/api/analyze/light` | Gemini | Room photo (base64) | Light level, source, hours |
| Species search | `/api/analyze/search` | Gemini | Text query | Species list with care info |

**Prompt templates:** `lib/ai/` directory

---

## 8. Feature Registry

### Live ✅
- Garden home with stats and plant cards
- Add plant wizard (4 steps, AI-powered)
- Plant detail page (hero, care tiles, 3 tabs)
- Health check-in via photo (AI analysis)
- Re-analyze existing health photo
- Quick care actions (water, fertilize, mist, rotate) with undo
- Care schedule page (water + fertilize only)
- Species database (47 species with care data)
- Page transitions with shared photo element (Framer Motion)
- Animated care tiles (water fill, flask tilt, vapor lines, sun rotate)
- Skeleton loading states
- Image compression (client-side, max 1MB)
- Edit plant metadata (nickname + all 9 light presets) via inline SetupTab form
- Delete plant with animated confirmation modal (removes health + care logs)
- Persistent auth session with auto sign-out redirect via AuthProvider
- Sign-out button in Garden home header

### Partial / Stub ⚠️
| Feature | Status | What's missing |
|---------|--------|----------------|
| Push notifications | ⚠️ Stub | SW registered, no delivery implementation |
| Care schedule snooze | ⚠️ Stub | Button exists, shows placeholder alert |
| Care notes | ⚠️ DB only | `notes` column in `care_logs`, no UI |
| Insights page | ⚠️ Placeholder | Route exists, no content |
| Mist/rotate on schedule | ⚠️ Missing | Only water/fertilize on schedule page |
| Offline support | ⚠️ Stub | SW registered, no caching strategy |

### Not Started ❌
| Feature | Notes |
|---------|-------|
| Photo gallery / health timeline view | Browse all check-in photos |
| Side-by-side photo comparison | Old vs. new health check |
| Bulk care actions | "Water all overdue" etc. |
| Photo gallery / health timeline view | Browse all check-in photos |
| Side-by-side photo comparison | Old vs. new health check |
| Bulk care actions | "Water all overdue" etc. |
| Manual health score override | Score is AI-only |
| Garden search / filter | No search on home page |
| Plant sharing | Share plant card / report |
| Offline data sync | — |

---

## 9. Known Issues & Tech Debt

| ID | Type | Description | Severity |
|----|------|-------------|----------|
| T-01 | ~~Resolved~~ | `MOCK_USER_ID` replaced with real Supabase Auth (PLANT-10) | — |
| T-02 | Bug | `GardenPulseHeader` uses `useRef<SVGLinearGradientElement>` — shimmer may break on some browsers | Low |
| T-03 | Tech Debt | Mist/rotate intervals hardcoded in `QuickCareActions` (3d/7d) — not species-aware | Medium |
| T-04 | UX Gap | No error recovery UI on failed health check-in — user sees error, no retry button in overlay | Medium |
| T-05 | UX Gap | After adding a plant, user goes to home — should probably go to new plant detail | Low |
| T-06 | Tech Debt | `GardenView` fetches health entries N+1 style (one query per plant) — should batch | Medium |
| T-07 | Missing | No plant edit/delete — users cannot correct mistakes | High |
| T-08 | Missing | `care_logs.notes` not surfaced in UI | Low |
| T-09 | UX Gap | Schedule page doesn't auto-refresh — requires full page reload | Low |

---

## 10. Page Transition System

Using Framer Motion `layoutId` for shared element transitions between home and detail page.

**Shared element:** Plant photo
- **On PlantCard** (`components/PlantCard.tsx`): `layoutId={`plant-photo-${plant.id}`}`
- **On PlantDetailHero** (`components/plant-detail/PlantDetailHero.tsx`): `layoutId={`plant-photo-${plantId}`}`

**Wrapper:** `PageTransition` in `app/layout.tsx` — `AnimatePresence mode="popLayout"` keyed by pathname.

**Timing:**
- Page fade in: 200ms easeOut
- Page fade out: 180ms easeIn
- Photo layout animation: 400ms cubic-bezier(0.25, 0.1, 0.25, 1)
- Hero text entrance: 300ms delay 200ms easeOut

**Rule:** Any new page that shares a visual element with another page should use `layoutId` for the transition.

---

## 11. Design System Notes

**Colors (Tailwind custom):**
- `neon-emerald` — healthy plant indicator
- `coral` — alerts, warnings
- `sky` — water action
- `amber` / `amber-glow` — fertilize, sun, active nav
- `charcoal` — dark background base
- `glass-emerald` — emerald with transparency

**Component patterns:**
- `glass-card` utility class — frosted glass card style
- Care tile: `h-32 rounded-[32px] bg-[#1A1C1B]/80 border-white/5`
- Pill badges: `rounded-full px-2.5 py-1 backdrop-blur-md border border-white/10`

**Typography:**
- Display headings: `font-display` (Fraunces, italic for hero names)
- Body: `font-sans` (Outfit)
- Labels/mono: `font-mono` (JetBrains Mono), `uppercase tracking-widest text-[10px]`

---

## 12. Decision Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-21 | Hide BottomNav | 2 of 4 tabs broken (settings 404, collection mislabeled); will redesign when nav is complete |
| 2026-03-21 | Use `plant.created_at` as care base date | Prevents "In 7d" for plants that were never watered — correctly shows overdue |
| 2026-03-21 | `revalidatePath` added to `/api/care` | `router.refresh()` was serving stale cache after logging care actions |
| 2026-03-21 | 47 species seeded; all user plants linked | Plants showed "Unknown Species" and fallback care intervals |
| 2026-03-21 | Gemini used instead of Claude for AI | Lower cost for vision tasks at scale |
| 2026-03-21 | Real Supabase Auth implemented (PLANT-10) | MOCK_USER_ID removed; email+Google OAuth via /auth; RLS enabled on all tables; middleware protects all routes |
| 2026-03-21 | Edit plant (PLANT-8) — nickname + 9 light presets inline in SetupTab | All 9 light presets match AddPlantFlow; revalidatePath on save; Cancel discards changes |
| 2026-03-21 | Delete plant (PLANT-9) — AnimatePresence modal replaces browser confirm() | Explicit child record deletion before plant row; revalidatePath('/') on success |
| 2026-03-21 | AuthProvider (PLANT-11) — onAuthStateChange listener in layout | Redirects to /auth on SIGNED_OUT event; sign-out button in GardenView header; alerts threshold corrected to <50 |
| 2026-03-21 | Shared element transition via `layoutId` | Native app feel for photo expansion on card → detail navigation |

---

## 13. File Structure Quick Reference

```
app/
  layout.tsx              ← Root layout, PageTransition, global bg
  page.tsx                ← Home (renders GardenView)
  add/page.tsx            ← Add plant page
  plant/[id]/page.tsx     ← Plant detail (server RSC)
  schedule/               ← Care schedule
  api/
    plants/               ← Plant CRUD
    care/                 ← Log care actions
    analyze/
      identify/           ← AI: plant ID
      health/             ← AI: health analysis
      light/              ← AI: light analysis
      search/             ← AI: species search

components/
  GardenView.tsx          ← Home page client component
  PlantCard.tsx           ← Card with layoutId photo
  GardenPulseHeader.tsx   ← SVG stats card
  PageTransition.tsx      ← AnimatePresence wrapper
  MobileShell.tsx         ← Page shell (TopBar, max-width)
  add-plant/              ← 4-step wizard components
  plant-detail/
    PlantDetailHero.tsx   ← Hero with layoutId photo
    PlantActionRow.tsx    ← Warning + check-in bar
    QuickCareActions.tsx  ← 4 care tiles with animations
    CheckInOverlay.tsx    ← Camera → AI → result overlay
    HealthGauge.tsx       ← SVG arc gauge
    PlantDetailTabs.tsx   ← Tab switcher
    tabs/                 ← Health, Care, Setup tabs
  ui/
    TopBar.tsx
    BottomNav.tsx         ← Hidden (incomplete)

lib/
  ai/
    gemini.ts             ← Gemini client + analyzeHealth, etc.
    index.ts              ← Re-exports
  data/
    plants.ts             ← getPlant, getPlants, createPlant
    care.ts               ← getCareLog, addCareLog, getPlantCareSchedule
    species.ts            ← getAllSpecies, getSpecies, searchSpecies
  supabase/
    client.ts             ← Browser client, MOCK_USER_ID
    server.ts             ← Server client

supabase/migrations/      ← SQL migrations (apply with supabase db push)
types/database.ts         ← Generated Supabase types
```

---

<!-- AI MAINTENANCE INSTRUCTIONS
When you make a change to the codebase, update the relevant sections of this file:
- New route added → update Section 2 (Route Registry)
- New component added → update Section 3 (Component Registry)
- Schema change → update Section 4 (Data Model)
- New/changed API → update Section 5 (API Registry)
- Feature completed → move from Section 8 partial/missing to live
- Bug found → add to Section 9 (Known Issues)
- Bug fixed → remove from Section 9
- Architectural decision made → add to Section 12 (Decision Log)
- Design pattern established → add to Section 11 (Design System Notes)
-->
