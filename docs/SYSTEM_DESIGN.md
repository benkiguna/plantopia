# Plantopia — System Design Document

> **Related files:**
> - `CLAUDE.md` (project root) — Claude Code configuration
> - `/docs/BUILD_PLAN.md` — 8-phase implementation plan
> - This file lives at `/docs/SYSTEM_DESIGN.md`

---

## 1. Product Vision

Plantopia is a mobile-first personal plant care PWA that uses photo-based AI health analytics, environmental profiling, and continuous data collection to give users a living, evolving dashboard for every plant they own.

**Core loop:** Upload photo → AI analyzes → Health score + insights → Care actions → Upload again later → Compare over time → Smarter recommendations.

---

## 2. System Architecture

```
┌───────────────────────────────────────────────────────┐
│               CLIENT (Next.js PWA)                     │
│  Mobile-first · Service Worker · Offline-capable       │
│  Camera API · Push Notifications · Image Compression   │
├───────────────────────────────────────────────────────┤
│                                                        │
│  ┌──────────┐  ┌──────────┐  ┌────────────────────┐   │
│  │ Onboard  │  │  Plant   │  │  Health Timeline   │   │
│  │  Flow    │→ │  Profile │→ │  & Analytics       │   │
│  └──────────┘  └──────────┘  └────────────────────┘   │
│                                                        │
├───────────────── API Routes ──────────────────────────┤
│  /api/analyze/identify  — Plant species identification │
│  /api/analyze/health    — Photo health scoring         │
│  /api/plants            — CRUD operations              │
│  /api/schedule          — Care schedule calculation     │
│                                                        │
├───────────────── External Services ───────────────────┤
│                                                        │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │    Supabase      │    │     Claude API            │   │
│  │  • Auth          │    │  • Plant identification   │   │
│  │  • Postgres DB   │    │  • Health scoring         │   │
│  │  • Storage       │    │  • Trend analysis         │   │
│  │  • Edge Funcs    │    │  • Care recommendations   │   │
│  └─────────────────┘    └──────────────────────────┘   │
│                                                        │
└───────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### `profiles`
| Column     | Type      | Notes              |
|------------|-----------|---------------------|
| id         | uuid (PK) | = auth.uid()        |
| email      | text      | from auth           |
| name       | text      | display name        |
| created_at | timestamp | default now()       |

### `species`
| Column        | Type      | Notes                    |
|---------------|-----------|--------------------------|
| key           | text (PK) | e.g. "monstera"          |
| name          | text      | e.g. "Monstera Deliciosa"|
| water_days    | int       | default watering interval |
| light         | text      | light requirement         |
| humidity      | text      | humidity preference       |
| fertilize_days| int       | fertilizing interval      |
| tip           | text      | species-specific advice   |

### `plants`
| Column      | Type      | Notes                          |
|-------------|-----------|--------------------------------|
| id          | uuid (PK) | auto-generated                 |
| user_id     | uuid (FK) | → profiles.id                  |
| species_key | text (FK) | → species.key                  |
| nickname    | text      | user-given name                |
| light_setup | text      | bright_direct/indirect/med/low |
| pot_size    | text      | small/medium/large             |
| soil_type   | text      | e.g. "well_draining_mix"       |
| created_at  | timestamp |                                |

### `health_entries`
| Column      | Type      | Notes                      |
|-------------|-----------|----------------------------|
| id          | uuid (PK) |                            |
| plant_id    | uuid (FK) | → plants.id                |
| photo_url   | text      | Supabase Storage path      |
| health_score| int       | 0-100 from AI              |
| ai_notes    | text      | AI analysis summary        |
| issues      | jsonb     | [{name, severity, rec}]    |
| user_notes  | text      | optional user observations  |
| created_at  | timestamp |                            |

### `care_logs`
| Column   | Type      | Notes                           |
|----------|-----------|----------------------------------|
| id       | uuid (PK) |                                 |
| plant_id | uuid (FK) | → plants.id                     |
| action   | text      | water/fertilize/mist/rotate/repot|
| notes    | text      | optional                        |
| created_at| timestamp|                                  |

**RLS Policy:** All tables filtered by `user_id = auth.uid()` (plants owns the user_id, child tables join through plants).

---

## 4. AI Analysis Pipeline

### Plant Identification (onboarding)
```
Input:  Plant photo (base64, max 1MB)
Prompt: Identify this houseplant. Return JSON:
        { matches: [{ species, confidence, care_summary }] }
Output: Top 3 species matches with confidence percentages
```

### Health Analysis (regular check-in)
```
Input:  New photo + species + last 3 health entries (photos + scores)
Prompt: Compare current photo to history. Score health 0-100.
        Return JSON: { health_score, trend, observations, issues, comparison }
Output: Score, trend direction, specific issues with severity
```

### Progressive Intelligence
- **Photo 1:** Baseline score established, no comparison possible
- **Photos 2-5:** Trend detection starts (improving/declining/stable)
- **Photos 6+:** Seasonal patterns, growth rate, environment correlation
- **Environment data** enriches analysis: "Brown edges + low humidity setup → recommend humidifier"

---

## 5. User Flows

### Onboarding (first plant)
```
Welcome → Upload Photo → AI Identifies (confirm/correct)
→ Set Light Conditions → Name Plant → Dashboard
```

### Regular Check-in
```
Dashboard → Tap Plant → Take Photo → AI Compares to History
→ Score + Insights → Log Care Actions → Return
```

### Quick Care Action
```
Dashboard → Tap "Water" on card → Logged + Next Date Recalculated
→ Visual confirmation (drop animation)
```

---

## 6. Design System

### Aesthetic: Organic Modern
Large photography dominates. Breathing whitespace. Nature-inspired motion. Feels like a native mobile app, not a website.

### Typography
- **Display:** Fraunces (variable, optical size 9-144, weight 400-900)
- **Body:** Outfit (weight 300-800)

### Colors
| Token        | Value     | Usage                    |
|-------------|-----------|--------------------------|
| `--forest`  | `#0D2818` | primary text, headings   |
| `--green`   | `#2D6A1E` | primary brand, buttons   |
| `--green-l` | `#4A9D2F` | gradient endpoints       |
| `--cream`   | `#FFFAF5` | page background          |
| `--cream-d` | `#F5EDE0` | card backgrounds         |
| `--coral`   | `#D94F3B` | alerts, urgent states    |
| `--amber`   | `#E5970F` | warnings, medium health  |
| `--sky`     | `#4AADE5` | water actions, info      |
| `--bark`    | `#7A6548` | secondary text, captions |

### Motion
- Tap feedback: `scale(0.96)` on press, spring back
- Card entrance: staggered `fadeUp` with 60ms delay per card
- Health ring: `stroke-dashoffset` transition (1.2s cubic-bezier)
- Water action: 10 droplets `translateY` + fade cascade
- Page transitions: `fadeIn 0.3s`
- Floating plants: gentle `translateY` oscillation (4s ease infinite)

### Mobile Layout
- Max width: 430px centered
- Bottom nav: fixed, glass-morphism (blur 20px, 82% white opacity)
- Hero images: 220px (home cards), 320-360px (detail view)
- Spacing scale: 8, 12, 14, 16, 18, 20, 24, 28, 32
- Border radius scale: 12, 14, 16, 18, 20, 22, 24, 28
