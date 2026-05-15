# Spec: Teacher Courses (browse)

> **Status:** `draft`
> **Owner of approval:** Sujay
> **Last updated:** 2026-05-14

---

## 0. Source of truth

**Visual reference:** `../VipassanaTeacherApp/app.html` lines `1007–1068` (the `function Courses` component) and `app.html:447–540` (shared CSS).

The browse-and-filter list of every open course in Nepal. The teacher lands here from the home "See all →" link or the bottom-nav Courses tab. Each card surfaces the match score, type, dates, languages, distance/time/altitude, and a "View & Apply →" CTA that opens the course detail screen (spec 06).

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `05-teacher-courses` |
| Route | `/(teacher)/courses` |
| Source file | `app/(teacher)/courses/index.tsx` |
| Prototype reference | `app.html:1007–1068` |
| Roles | `teacher` |
| Related specs | [`04-teacher-home`](./04-teacher-home.md) (See all entry), `06-teacher-course-detail` (card tap target), `07-teacher-course-brief` (confirmed flow, separate path) |

---

## 2. Purpose

The single browseable inventory of every open course for which an AT (this teacher) is potentially eligible. Provides:

- A search box (centre / city / type substring match).
- Two filter rows: course type + centre.
- Cards sorted by match score, each showing dates, languages, distance, match meter, and a CTA.

Tapping a card or its CTA opens the course-detail screen, which is where applications are submitted.

---

## 3. Visual Layout (top → bottom)

> **Container** — `<View>` with `Colors.cr` (`#F8F3EB`) as the screen background. The header + search/filters area sits on `Colors.white` so the cards below appear to "float" on the cream backdrop with an 8 px divider gap (`app.html:1040`).

### 3.1 Header (white, padding `56 18 12`)

- **Title** — `t('courses.title')` = `Open Courses` / `खुला शिविरहरू`. 26 px, weight 800, `Colors.tx`.
- **Subtitle** — `${teacher.center} · ${teacher.region} 🇳🇵`. 13 px, `Colors.tx2`, 2 px margin-top. Falls back to "Nepal Vipassana Centers" when the teacher record has no centre/region.
- **Caption** — `${filteredCount} ${t('courses.seeking')}`. 12 px, `Colors.tx3`, 1 px margin-top. Updates as filters / search change.

### 3.2 Search + filters area (white, padding-bottom 10)

- **Search bar** (`.sbar`, prototype `app.html:514`):
  - margin `0 18 13`, bg white, 1.5 px `Colors.bd` border, radius 13, padding `11 × 14`.
  - Row of: `🔍` SVG icon at 18 px (`Icons.Search` shape — circle + tail), search input (fontSize 13.5, color `Colors.tx`, transparent bg, no border, `flex: 1`), and a `×` clear button (only when `q` non-empty; 16 px, `Colors.tx3`).
  - Placeholder: `t('courses.search')` = `Search courses…` / `शिविर खोज्नुहोस्…`.

- **Type filter row** (`.frow`, prototype `app.html:515`):
  - `flex row gap 7 overflow-x auto`, padding `0 18 4`.
  - Hides webkit scrollbar (web-only — fine to no-op on native).
  - Chips: `All / 1-Day / 10-Day / Satipatthana / 20-Day / 30-Day`.
  - Chip style (`.fchip`): padding `7 × 14`, radius 20, 13 px / weight 600, 1.5 px `Colors.bd2` border, bg white, fg `Colors.tx2`. Active state: bg `Colors.sf`, border `Colors.sf`, fg white.

- **Centre filter row** (`.frow` with `.fchip.sm` modifier, prototype `app.html:1032`):
  - Left padding `18`, then a 📍 emoji (13 px, `Colors.tx3`), then a horizontally scrollable row of "All + {each distinct centre}".
  - `.sm` chips: 11 px / padding `5 × 11` (smaller variant).
  - Centre labels are shortened by stripping the leading "Dhamma " / "Dharma " prefix so "Dhamma Pokhara" → "Pokhara". (Prototype helper `shortCenterName(n) => n.replace(/^Dhamma /, '')`. We extend to handle "Dharma " too.)

- **Divider strip** — 8 px tall, `Colors.cr` bg (the cream backdrop), purely visual separator between the white filter zone and the card list.

### 3.3 Course cards

One card per filtered course, sorted by **match score descending** (the prototype shows scrape order; we sort to surface best matches first since `enrichCoursesWithMatch` already does that). Card chrome = `.card` shape used elsewhere (white, radius 16, padding 15, margin `0 18 11`, `Shadows.card`).

Per card:

- **Top row** (`flex row justify-between align-start marginBottom 6`):
  - **Left** (`flex: 1`, padding-right 9):
    - **Type chip row** (`flex row gap 5 align-center marginBottom 3`):
      - Type emoji — 16 px. Mapped from `TYPE_EMOJI`: `10-Day → 🪷`, `Satipatthana Sutta → 📿`, `20-Day → 🌿`, `30-Day → 🌳`, `45-Day → 🌲`, `60-Day → 🏔️`, `Teen Course → 🧒`, `Children's Anapana → 👦`, `Executive → 💼`, default → `🪷`.
      - Type pill — `.chip.sf` (`Colors.sfl` bg, `Colors.sfd` text, 11 px / weight 600, padding `3 × 9`, radius 20). Label: `course.type`.
    - **Centre name** — 15 px weight 700, 3 px margin-top.
    - **City** — 12.5 px, `Colors.tx2`.
    - **Distance/time/altitude** — 10.5 px, `Colors.tx3`, 1 px margin-top. Renders only when `distanceKm` is set: `📍 ${distanceKm} km · ~${travelHrs} hrs · ${altitude} m`.
  - **Right** (`textAlign: right`):
    - **Match badge** — reuses the home screen's `MatchBadge` (tiered pill, `XX% match`).
    - **Need count** — `${needCount} AT needed`, 11 px `Colors.tx3` weight ~500, 3 px margin-top.

- **Chip row** (`flex row gap 5 wrap marginBottom 7`):
  - Date chip — `.chip.gy` (`Colors.cr2` bg, `Colors.tx2` text). Label: `📅 ${course.dates}`.
  - One language chip per `course.languages[i]` — `.chip.bl` (`Colors.bll` bg, `Colors.bl` text). Label: `langLabel(code)` so `ne` → `Nepali`.

- **Match meter** — same component used on home. 5 px tall horizontal bar showing match %.

- **CTA row** (`flex row justify-end marginTop 9`):
  - `View & Apply →` button — `.btn.pr.sm`: saffron gradient, padding `7 × 15`, radius 10, 12.5 px / weight 700, white text. **Stops propagation** so tapping the button vs the card body both route to the same place (course detail).

- **Card tap target** — entire card surface routes to `routeTo.teacherCourseDetail(course.id)`.

### 3.4 Empty state

When `filteredCount === 0`:

- Single inline card with the `.card` chrome.
- Body: 12.5 px `Colors.tx2`, italic. Copy: `t('courses.noResults')` = `No courses match your filters` / `तपाईंका फिल्टरसँग मिल्ने कुनै शिविर छैन`.
- Below: a soft "Clear filters" link (`Colors.sf`, 13 px / weight 700) that resets `f`, `fC`, and `q` to defaults.

### 3.5 Bottom spacer

`<View style={{ height: 20 + insets.bottom }} />` so the last card never hugs the home indicator.

---

## 4. Component Inventory

| Element | Type | Source |
|---|---|---|
| Search-bar magnifying glass icon | SVG | **new** `Icons.Search` — port of prototype's circle-with-tail at `app.html:135` (or inline as part of this screen) |
| Search input | TextInput | RN built-in |
| Clear (`×`) button | TouchableOpacity | inline |
| Filter chips (`.fchip`, `.fchip.sm`) | TouchableOpacity | inline (same logic as `FilterChip` in `src/components/ui` if it matches; otherwise inline) |
| Course card | TouchableOpacity + View | inline (mirrors the match-card layout from home, with extra meta lines) |
| Type chip (`.chip.sf`) | inline | — |
| Date/lang chips | inline | same shape as home |
| Match badge | `MatchBadge` | reuse from home (or extract to a shared component if not already) |
| Meter | `Meter` | reuse from home (or extract) |
| "View & Apply →" button | `.btn.pr.sm` | inline |

> **New shared component:** consider extracting `MatchBadge` and `Meter` into `src/components/ui/MatchPill.tsx` since this is the second place they appear (after home). Defer until the third use.

---

## 5. Design Tokens

| Element | Token |
|---|---|
| Header bg | `Colors.white` |
| Screen bg below filters | `Colors.cr` |
| Search bar bg | `Colors.white`, border `Colors.bd` |
| `.fchip` border | `Colors.bd2` |
| `.fchip.on` bg | `Colors.sf` |
| Type chip (`.chip.sf`) | `Colors.sfl` bg, `Colors.sfd` text |
| Date chip (`.chip.gy`) | `Colors.cr2` bg, `Colors.tx2` text |
| Language chip (`.chip.bl`) | `Colors.bll` bg, `Colors.bl` text |
| Match meter | high `Colors.fo` / mid `Colors.bl` / low `Colors.tx3` over `Colors.cr3` track |
| Apply button | `Gradients.primaryCta` (saffron) |

Inline literal fonts (same policy as login/home/onboarding).

---

## 6. Strings & i18n

Most keys exist under `courses.*` already. Reuse + add the few missing ones.

| Key | EN | NE |
|---|---|---|
| `courses.title` | `Open Courses` | `खुला शिविरहरू` |
| `courses.search` | `Search courses…` | `शिविर खोज्नुहोस्…` |
| `courses.seeking` | `courses seeking teachers` | `शिक्षक खोज्दै` |
| `courses.allTypes` | `All` | `सबै` |
| `courses.noResults` | `No courses match your filters` | `तपाईंका फिल्टरसँग मिल्ने कुनै शिविर छैन` |
| `courses.clearFilters` | `Clear filters` | `फिल्टर हटाउनुहोस्` |
| `courses.viewAndApply` | `View & Apply →` | `हेर्नुहोस् र आवेदन दिनुहोस् →` |
| `courses.needAt` | `{{count}} AT needed` | `{{count}} AT चाहिएको` |
| `courses.filterLocation` | (icon only — no label needed) | — |
| `courses.subtitleFallback` | `Nepal Vipassana Centers` | `नेपाल विपस्सना केन्द्रहरू` |

Type-filter chips (`All`, `1-Day`, `10-Day`, `Satipatthana`, `20-Day`, `30-Day`) match course types exactly; no translation needed for those (proper nouns).

---

## 7. Local State

| Name | Type | Initial | Purpose |
|---|---|---|---|
| `q` | `string` | `''` | search query |
| `typeFilter` | `string` | `'All'` | active type chip |
| `centerFilter` | `string` | `'All'` | active centre chip |

Filtered list + sort is a `useMemo` over `(courses, profile, q, typeFilter, centerFilter)`.

---

## 8. Behavior

| Trigger | Action |
|---|---|
| Mount | `coursesStore.loadCourses()` (if not already loaded), `applicationsStore.loadApplications(userId)` for need-count subtraction (future) |
| Type query | `setQ` updates filter; debounce not needed at our scale (~250 courses) |
| Tap `×` | clear `q` |
| Tap type chip | `setTypeFilter` |
| Tap centre chip | `setCenterFilter` |
| Tap card body | `router.push(routeTo.teacherCourseDetail(course.id))` |
| Tap `View & Apply →` | same as card body — stop propagation so the gesture isn't logged twice |
| Tap "Clear filters" in empty state | reset all three filters to defaults |

Filter logic (mirrors prototype `app.html:1015–1020`):

```
typeMatch    = typeFilter === 'All' || course.type.includes(typeFilter)
centerMatch  = centerFilter === 'All' || course.center === centerFilter
queryMatch   = q === '' ||
               course.center.toLowerCase().includes(q.toLowerCase()) ||
               course.city.toLowerCase().includes(q.toLowerCase()) ||
               course.type.toLowerCase().includes(q.toLowerCase())
```

Sort: by `match` descending; tie-broken by `startDate` ascending. (Prototype is unsorted; we sort because our match algorithm produces meaningful variation.)

---

## 9. Data Dependencies

| Store | Reads |
|---|---|
| `authStore` | `userId` (for the home-region subtitle derivation) |
| `teachersStore` | `findTeacher(userId)` → `region` / `preferredRegions` for the subtitle |
| `coursesStore` | `courses` (already enriched with match via home's pre-pass, or re-run here) |
| `profileStore` | `profile` — input for `enrichCoursesWithMatch` if home hasn't run yet |
| `applicationsStore` | (future) read `applications` to mark already-applied courses with a different CTA state |
| `settingsStore` | `language` — drives the chip / search localization |

---

## 10. Navigation

| Direction | Source | Target |
|---|---|---|
| In | Home "See all →" link | this screen |
| In | Home "Browse All Courses" empty-state button | this screen |
| In | Bottom-nav `Courses` tab | this screen |
| Out — card tap | tap | `/(teacher)/courses/[id]` (spec 06) |

---

## 11. Acceptance Checklist

- [ ] Header layout matches prototype at 390 × 844 (title 26 px, subtitle 13 px, caption 12 px).
- [ ] Search bar with magnifying-glass icon, placeholder, clear `×` button, focus state OK.
- [ ] Type filter row scrolls horizontally on overflow without showing a scrollbar on web.
- [ ] Centre filter row scrolls similarly, prefixed with 📍.
- [ ] Active chips switch to saffron (sf bg, white text).
- [ ] Cards sort by match desc; secondary sort by start date asc.
- [ ] Card distance/time/altitude line shows only when `distanceKm > 0`.
- [ ] Match badge + meter render correctly across tiers.
- [ ] Empty state: no-results card + "Clear filters" link works.
- [ ] Tapping the card OR the "View & Apply →" button both navigate to detail.
- [ ] EN + NE both render without overflow.

---

## 12. Intentional Deltas from Prototype

| Delta | Prototype | Our app | Why |
|---|---|---|---|
| Sort order | Insertion order | Match score desc + start date asc | Our matcher produces real differentiation; best-fit courses should surface first |
| Subtitle source | Hardcoded "Dhamma Shringa · Kathmandu Valley 🇳🇵" | Derived from `teacher.region` / `teacher.flag` | Data-driven |
| Distance/time/altitude on card | Always shown if `distanceKm` set | Same | (no delta — listed for completeness) |
| Centre short-name | `shortCenterName(n) => n.replace(/^Dhamma /, '')` | Same, plus also strip leading `Dharma ` | We renamed Shringa to "Dharma Shringa" — prefix-strip needs both |

---

## 13. Open Questions

- [ ] Should we surface already-applied state on the card (e.g. ✓ Applied badge instead of "View & Apply →") by joining against `applications`? Default: defer until spec 08 (Applications screen) — applications context is clearer there.
- [ ] The prototype's type-filter uses `course.type.includes(filter)` so `"Satipatthana"` chip matches `"Satipatthana Sutta"`. We keep this loose-match behavior.

---

## 14. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-14 | Sujay + Claude | Initial draft from prototype `app.html:1007–1068` |
