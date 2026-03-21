# Plantopia — Product Flow Report
**Date**: March 21, 2026
**Audience**: Product Owner
**Purpose**: Current state of all user flows, gaps, and decision points for roadmap planning

---

## TL;DR

Plantopia is a working mobile PWA with 5 core flows: adding a plant, viewing your garden, plant detail & care tracking, health check-ins via AI photo analysis, and a care schedule. The AI layer (plant identification, health scoring, light analysis) is fully functional. The main gaps are around edit/delete, notification delivery, real authentication, and a few half-built features (snooze, mist/rotate scheduling).

---

## Current User Flows

---

### Flow 1 — Home / Garden View

**What the user sees:**
- Animated sun icon (top corner)
- A stats card showing: total plants, average health score, alert count
- A scrollable list of plant cards (photo, name, species, health badge, light indicator)

**What happens technically:**
- All plants and their latest health photo/score are fetched on load
- Average health and alert count (plants below score 60) calculated on the fly

**Actions available:**
| Action | Result |
|--------|--------|
| Tap "+" | Goes to Add Plant flow |
| Tap plant card | Goes to Plant Detail page with shared photo transition |

**Gaps / Decisions needed:**
- No search or filter on the garden list
- No sorting (e.g. by urgency, alphabetically)
- No quick-action from the garden view (e.g. swipe to water)
- Stats card shows averages — does the PO want trend arrows (vs. last week)?

---

### Flow 2 — Add Plant (4-Step Wizard)

**Steps:**

| Step | What happens | AI involved? |
|------|-------------|--------------|
| 1. Photo | User uploads/takes photo. App compresses image. | ✅ Plant identification |
| 2. Species | Shows AI matches with confidence %. User picks or searches manually. | ✅ Search fallback |
| 3. Light Setup | User picks light level manually or uploads room photo for analysis. | ✅ Optional light analysis |
| 4. Name & Confirm | User confirms/edits nickname, reviews setup, submits. | ✅ Initial health analysis run |

**On submit:**
- Photo uploaded to Supabase Storage
- Plant record created in database (with species, light setup)
- AI analyzes the photo and creates an initial health entry (score 0–100)

**Gaps / Decisions needed:**
- No duplicate detection (same plant added twice)
- No way to skip photo (photo is required at step 1)
- Light setup has ~9 preset options — no custom input
- Error states exist but recovery is limited (no retry mid-flow)
- After adding, user is redirected to home — should they go to the new plant's detail page?

---

### Flow 3 — Plant Detail Page

**Page structure (top to bottom):**

```
[ Hero photo + plant name + health gauge ]
[ Warning banner (if issues) + Check In button ]
[ 4 care action tiles: Water / Fertilize / Mist / Rotate ]
[ Tabs: Health | Care | Setup ]
```

#### Care Action Tiles
User taps a tile → icon animates → 5-second undo window → logs to database.

| Tile | Shows | Action logged |
|------|-------|---------------|
| Water | Next watering date (from species interval) | `water` |
| Fertilize | Next fertilize date | `fertilize` |
| Mist | Last mist date | `mist` |
| Rotate | Light setup label | `rotate` |

**Gaps:** Mist and Rotate use hardcoded intervals (3 and 7 days). No species-specific data for these.

---

#### Health Tab
- Current health score in a ring chart
- Trend line across last 7 check-ins
- AI assessment: summary text, 5-dimension breakdown (leaf health, growth, pests, hydration, appearance)
- Positive signs checklist
- Concerns list with severity (low/medium/high) and recommendations
- Check-in history timeline with thumbnails

#### Care Tab
- Full schedule: next due date per action, last completed date, frequency
- Species care guide: light, humidity, tip
- Activity log of last 10 care actions

#### Setup Tab
- Plant metadata: nickname, species, date added
- Light setup selected
- Light analysis results (if room photo was taken)

**Gaps / Decisions needed:**
- No edit button for nickname or light setup after creation
- No delete plant option
- No side-by-side photo comparison (old vs. new health check)
- No photo gallery to browse all health check-in photos
- Cannot add notes when logging a care action (field exists in DB, not in UI)

---

### Flow 4 — Health Check-In

**Entry points:** "Check In" button in the warning bar, or "New Check-in" in the Health tab.

**Steps:**
1. User takes/uploads a photo
2. Photo is compressed and sent to AI
3. Loading state shows (~10 seconds)
4. Results show: new score, change from previous (e.g. 75 → 82)
5. Overlay closes, page refreshes with new data

**AI analysis returns:**
- Overall score (0–100)
- Dimension breakdown (5 categories)
- List of positive signs
- List of concerns with severity and recommendations
- Summary text

**Re-analyze option:** User can re-run analysis on an existing photo (e.g. after model improvement) without taking a new photo.

**Gaps / Decisions needed:**
- Analysis takes ~10 seconds — no progress indicator, just a spinner
- No ability to manually override a score
- No ability to add a note to a health check-in

---

### Flow 5 — Care Schedule Page

**What the user sees:**
- All pending care tasks grouped into: Overdue / Today / This Week / Later
- Each item shows: plant thumbnail, plant name, action type, due date

**Actions per item:**
| Action | Result |
|--------|--------|
| Complete | Logs care action, removes from list |
| Snooze | ⚠️ Not implemented — shows placeholder alert |

**Gaps / Decisions needed:**
- Snooze is a dead button — implement or remove?
- Only tracks Water and Fertilize — Mist/Rotate not on schedule
- No notifications (push service worker is registered but not delivering)
- Schedule doesn't auto-refresh (requires page reload)
- No bulk "Complete all overdue" action

---

## AI Capabilities Summary

| Capability | Where Used | Status |
|-----------|------------|--------|
| Plant identification from photo | Add Plant Step 1 | ✅ Live |
| Species search by name | Add Plant Step 2 (manual fallback) | ✅ Live |
| Light level analysis from room photo | Add Plant Step 3 (optional) | ✅ Live |
| Health analysis from plant photo | Add Plant (initial) + Check-In | ✅ Live |
| Re-analysis of stored photo | Health Tab | ✅ Live |

---

## Species & Care Data

- **47 species** currently in the database
- All 6 user plants now have species assigned (fixed)
- Water and fertilize intervals come from the species record
- Mist and rotate use hardcoded intervals (3 and 7 days)
- Species missing from DB: any plant identified by AI but not in our seed can be created on-the-fly during the Add flow

---

## Missing / Incomplete Features

| Feature | Status | Notes |
|---------|--------|-------|
| Edit plant (name, light) | ❌ Missing | No UI at all |
| Delete plant | ❌ Missing | No UI at all |
| Push notifications | ❌ Incomplete | Service worker registered, no delivery |
| Snooze care task | ❌ Stub | Shows placeholder alert |
| Care notes | ❌ UI missing | DB field exists, not surfaced |
| Real authentication | ❌ Mock only | Single hardcoded user |
| Mist/rotate schedule | ❌ Hardcoded | Not species-aware, not on schedule page |
| Photo gallery | ❌ Missing | Can't browse all health check photos |
| Photo comparison | ❌ Missing | Can't compare old vs. new check-in |
| Bulk care actions | ❌ Missing | Can't water all plants at once |
| Manual health score | ❌ Missing | Score only set by AI |
| Search / filter garden | ❌ Missing | No search on home page |
| Offline support | ❌ Incomplete | SW registered, not implemented |

---

## What's Working Well

- End-to-end AI health analysis with actionable recommendations
- Framer Motion page transitions and shared photo element animation
- Care countdown using species-specific intervals + actual care history
- Animated care action tiles with undo
- Skeleton loaders that match actual page layout
- Multi-step add plant wizard with AI at every step
- 47 species with proper care data

---

## Suggested Decision Points for PO

1. **Priority: Edit & Delete** — Users will inevitably need to correct a nickname or remove a plant. This is table stakes.

2. **Priority: Push Notifications** — The schedule page exists but is passive. Notifications would make the app genuinely useful for reminders.

3. **Priority: Snooze** — Either implement (pick a snooze duration: 1 day, 3 days, 1 week) or remove the button. Currently a broken promise.

4. **Auth** — When does this move from mock to real? All data is currently shared under one hardcoded user ID.

5. **Mist & Rotate Scheduling** — Should these appear on the schedule page? Should they have species-specific intervals? Currently they appear only on the plant detail tile.

6. **Care Notes** — The DB supports notes per care log. Should the UI surface this? (e.g. "Noticed yellowing leaves" when watering)

7. **Photo Gallery / Timeline** — As users build up months of health check-ins, is there value in a visual timeline view?

8. **Bulk Actions** — "Water all overdue plants" is a common user need. Worth adding to schedule page?

9. **Offline** — PWA manifest is in place. How important is offline support for the initial release?

10. **Redirect after Add Plant** — Currently goes to home after adding. Should it go directly to the new plant's detail page?
