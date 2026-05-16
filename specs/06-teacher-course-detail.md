# Spec: Teacher Course Detail (View & Apply)

> **Status:** `code_done`
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-15

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `06-teacher-course-detail` |
| Route (Expo Router) | `/(teacher)/courses/[id]` |
| Source file | `app/(teacher)/courses/[id].tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines `1071–1153` |
| Roles | `teacher` |
| Related specs | `05-teacher-courses`, `07-teacher-course-brief` |

---

## 2. Purpose

The first screen a teacher sees when they tap a course card in the browse list. It explains the course (centre, dates, languages, gender requirement, location, type), shows who the current confirmed AT is and what gender is still being recruited, runs the five eligibility checks against the teacher's profile, and gates the **Apply to Serve this Course** CTA.

If the teacher has already applied or been confirmed, the apply zone collapses to the appropriate state (`Application Submitted` for pending, `View Course Brief` button for approved).

---

## 3. Layout zones (top → bottom)

### 3.1 Forest-gradient hero (`#2A4A30` → `Colors.fo`, 160deg)

- Decorative lotus watermark (`LotusHero`, opacity `0.08`, size `210`)
- Subtle mountain silhouette (`MountainSilhouette`, `rgba(255,255,255,0.07)`)
- **Back row** — chevron SVG (`M15 18L9 12L15 6`, stroke `rgba(255,255,255,0.85)`) + "Back" label (13 px / 500). `marginBottom: 13`, pulled flush via `marginLeft: -2`.
- **Type kicker** — `course.type`, 12.5 px, `rgba(255,255,255,0.7)`
- **Centre name** — 22 px / 800 / lineHeight 26, white
- **City + flag** — 13.5 px, `rgba(255,255,255,0.78)`, marginTop 2
- **Travel line** — `📍 {distanceKm} km · {travelLabel} · {altitude} m`, 11.5 px, `rgba(255,255,255,0.62)`, marginTop 3. Computed by `travelFor(origin, centerName)` from `src/utils/travel.ts`. Origin prefers `profile.homeLat/homeLng`, falls back to `preferredRegions[0]` anchor map.
- **Pill row** — `MatchBadge` (tiered colour by score) + `1 AT needed` translucent pill (`rgba(255,255,255,0.18)`, white text, 12 px / 600)

### 3.2 Info table card

White card, 5 rows separated by `1px solid Colors.bd`. Each row: left label (13 px / 500 / `Colors.tx2`), right value (13 px / 600 / `Colors.tx`, `maxWidth: 60%`, right-aligned).

| Label | Value |
|---|---|
| 📅 Dates | `course.dates` |
| 🗣 Languages | `langLabel(lc).join(', ')` |
| 👤 Gender | `Male` / `Female` / `Any` derived from `course.genderRequired` |
| 📍 Location | `${course.city} ${course.flag}` |
| 🎓 Type | `course.type` |

### 3.3 AT Pair section

Section header row (sph): `🧘 AT Pair` left (12 px / 700 uppercase / `Colors.tx2`, letterSpacing 0.84) + `🛠 Admin-managed` badge right (9.5 px / 600 / cream-2 bg).

Card body:

- **If `course.coTeacher` exists** — avatar (46×46, radius 14, border 1.5, F→pink `#FBE8F0`/`#F0C8D8`, M→forest `Colors.fol`/`Colors.fom`) with `🙏🏻` (F) or `🧘` (M) emoji at 22 px. Right column: name (14.5 px / 700) + `✓ Confirmed` chip (`Colors.fol` / `Colors.fo`, 10 px / 600). Sub-line (11.5 px / `Colors.tx2`, marginTop 2): `{Female|Male} AT · {languages joined}`.
- **Else** — italic "No co-teacher assigned yet" (12.5 px / `Colors.tx2`).

Below that, when `resolveOpenSlots(course)` yields any `M` or `F` slots:

- `<DashedDivider />` — custom 1 px dashed line (outer overflow-hidden clips an inner 2 px View with all-4 dashed borders; works on web + iOS + Android, unlike RN's broken `borderStyle: 'dashed'` for single-side borders).
- `CENTER IS LOOKING FOR` label (11 px / 600 / uppercase / `Colors.tx3`, letterSpacing 0.55) + one `Male AT` / `Female AT` chip per open slot (`Colors.sfl` / `Colors.sfd`, 11 px / 600).

### 3.4 Eligibility checklist

Header: `Your Eligibility Check` (12 px / 700 uppercase / `Colors.tx2`, paddingHorizontal 18, marginTop 18, marginBottom 9).

Card with 5 rows, each:

- Round 22×22 icon, `Colors.fol`/`Colors.fo` for pass or `Colors.url`/`Colors.ur` for fail. SVG check (`M5 12L10 17L20 7`) or X (`M6 6L18 18M18 6L6 18`), stroke 3.
- Label (13 px / 700 / `Colors.tx`) + sublabel (11.5 px / `Colors.tx2`, lineHeight 16).

The five checks (in order):

| Key | Label | Logic |
|---|---|---|
| `language` | Language match | `course.languages.some(lc => profile.languages[langLabel(lc)] === 'primary')` |
| `location` | Location preference | Course city includes any `preferredRegions[i]` first-word, case-insensitive |
| `restGap` | Rest gap | `teachingHistory[0].date` parsed; > 21 days old → pass |
| `authorization` | Course authorization | `profile.authorizations.includes(course.type)` |
| `availability` | Availability | `availableMonths.includes(startMonth) && !festivalMonths.includes(startMonth)` |

Sublabels are translated (`courseDetail.check_*_sub`) with interpolation: `Course: Nepali/English · Your languages: Nepali, English, Hindi ✓`, `{city} is in your preferred regions`, `Last taught {lastTaught} · 3+ weeks ✓`, `Authorized for {type}`, `Calendar open for {dates}`.

### 3.5 Apply zone

Renders one of three states:

- **Unapplied** — orange-gradient `Apply to Serve this Course 🙏` button (`[Colors.sf, Colors.sfd]`, padding 15/22, radius 13, 15 px / 700 white). Below: `Your profile will be shared with the center coordinator` note (11 px / `Colors.tx3`).
- **Approved (`existingApp.status === 'approved'`)** — forest-green `View Course Brief` button that navigates to `routeTo.teacherApplicationBrief(existingApp.id)`.
- **Pending or just-submitted** — `Application Submitted!` box (`Colors.fol` bg, 1.5 px `Colors.fom` border, radius 14). Content: ✅ (26 px), title (15 px / 700 / `Colors.fo`), `The admin will review and notify you. Sadhu! 🙏`.

---

## 4. Data model additions

### 4.1 Per-slot open gender (`Course.openSlots`)

Replaces the single `genderRequired` for the "Looking for" rendering. Each entry describes one open slot's gender:

```ts
type SlotGender = 'M' | 'F' | 'Any';
interface Course {
  openSlots?: SlotGender[];
  // …
}
```

| `openSlots` | Renders |
|---|---|
| `["M"]` | `[Male AT]` |
| `["M", "F"]` | `[Male AT] [Female AT]` |
| `["Any"]` or missing & genderRequired Any | row hidden |

`resolveOpenSlots(course)` falls back to `Array(needCount - filled).fill(genderRequired)` so existing courses keep working with no schema change required.

Persisted as `open_slots_json TEXT` on `courses` (migration `0005_course_open_slots`). Treated as an admin-set field by `syncUpsert` — the dhamma.org scrape will never overwrite it.

### 4.2 Demo data alignment

For the demo flow on course `1753781245` (Dharma Shringa) the seed enrichment now writes:

- `dates: "Jul 7–18, 2026"`, `startDate: 2026-07-07`, `endDate: 2026-07-18`
- `genderRequired: "M"`, `openSlots: ["M"]`, `needCount: 1`
- `coTeacher: { name: "Asha Mehta", gender: "F", languages: ["ne","en"], phone: "+977 98••• ••772" }`

Plus teacher-001 gets `availableMonths: [6,8]` + `festivalMonths: [4,5,7,9,10]` (was `[8]` + `[4,5,6,7,9,10]`) so the Jul 7-18 availability check lights up green.

Both updates ship via `enrichDemoCourses=v3` and `backfillTeacherDemoMonths=v1` so existing dev DBs pick them up on next boot. The pre-existing approved application that pinned teacher-001 to this course is dropped by `dropDemoShringaJulApplication=v1` so the Apply CTA renders in the unapplied state.

---

## 5. Browse-screen integration (status pills)

When the teacher has an existing application for a course, the `View & Apply →` CTA on the browse card collapses to a status pill (`app/(teacher)/courses/index.tsx`):

| Status | Pill |
|---|---|
| `approved` | green `✓ Confirmed — Tap for brief` |
| `pending` | orange `✓ Applied · Pending review` |
| `rejected` | red `✗ Not selected` |
| `withdrawal_requested` | grey `↩︎ Withdrawal requested` |

The card itself stays tappable so the teacher can drill into the detail screen.

---

## 6. i18n

All copy goes through `courseDetail.*` keys in `en.json` + `ne.json`. Notable Nepali choices:

- `Apply to Serve this Course 🙏` → `यस पाठ्यक्रम सेवा गर्न आवेदन दिनुहोस् 🙏`
- `Center is looking for` → `केन्द्रले खोजिरहेको छ`
- `Male AT / Female AT` → `पुरुष/महिला सहायक आचार्य`
- `Acharya` (आचार्य) used everywhere in place of generic `शिक्षक` (handled in spec 05's commit, applies app-wide).

---

## 7. Acceptance checklist

- [x] Hero forest gradient renders with lotus + mountain silhouette
- [x] Back chevron returns to courses browse (or falls back to push if no history)
- [x] Travel line shows real km / `~Xh Ym` / altitude for any centre in `centers.json`
- [x] Info table renders all 5 rows with prototype-faithful sizes
- [x] AT Pair card renders pink-bordered F avatar with `🙏🏻` for Asha Mehta
- [x] Dashed divider renders visibly on web (RN's `borderStyle: 'dashed'` workaround)
- [x] Eligibility checks all green on demo course; vary genuinely on others (verified for 5 sample courses)
- [x] Apply CTA renders for unapplied courses; pending → submitted box; approved → View Brief button
- [x] Per-slot looking-for chips render correctly for `["M"]`, `["M","F"]`, `["Any"]`, missing
- [x] Multi-slot schema persists via `open_slots_json` and survives sync
- [x] Status pills render on courses browse for approved/pending/rejected
- [x] Typecheck clean
- [x] All tests pass (95/95)

---

## Implementation notes

### Phase 3 refactor (Apr 2026)
Screen reduced from 839 → 230 LOC. Sub-components extracted to `src/components/teacher/courseDetail/`:
- `CourseHero` — gradient hero with back chevron, kicker, match badge, AT-needed pill, LotusHero + MountainSilhouette decorations
- `CourseInfoTable` — 5-row info card (owns private `InfoRow`)
- `ATPairCard` — section header + co-teacher card / empty state + dashed divider + looking-for chips
- `EligibilityCheck` — 5-row checklist with `CheckIcon`/`XIcon` SVGs; exports the `buildPrototypeChecks(course, profile, t)` helper + `Check` type
- `ApplyCta` — 3 mutually-exclusive states (assigned / submitted / default)

Screen retains all data fetching (`enrichedCourse`, `travel`, `matchProfile` memos) and `onApply` async submit. No data JSON file — eligibility is computed live from profile + course.
