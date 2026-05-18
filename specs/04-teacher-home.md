# Spec: Teacher Home

> **Status:** `draft`
> **Owner of approval:** Sujay
> **Last updated:** 2026-05-14

---

## 0. Source of truth

**Visual reference:** `../VipassanaTeacherApp/app.html` lines `940–1005` (the `function Home` component) and the supporting CSS at lines `447–540` (CSS variables, `.card`, `.sph`, `.chip`, `.spill`, `.mbadge`, `.meter`).

This screen is a **prototype-faithful port**, *not* a redesign. We use the prototype's exact gradient, paddings, font sizes, card style, and chip palette. Where we deviate, it is logged in §12.

A previous draft of this spec leaned on a "premium" design brief (#FCFBF8 cards, 28-radius, 8-pt grid). That direction was rejected — keep this spec faithful to the prototype.

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `04-teacher-home` |
| Route (Expo Router) | `/(teacher)/home` |
| Source file | `app/(teacher)/home.tsx` |
| Roles | `teacher` |
| Related specs | [`01-login`](./01-login.md) (sign-in entry), [`03-onboarding-teacher`](./03-onboarding-teacher.md) (post-onboarding entry), `05-teacher-courses` (See All target), `06-teacher-course-detail` (match-card tap), `07-teacher-course-brief` (upcoming-card tap) |

---

## 2. Purpose

Landing screen for a logged-in, onboarded teacher. Shows:

1. **Identity hero** — who they are, role, country, three lifetime stats.
2. **Upcoming Courses** — confirmed assignments they need to prepare for.
3. **Best Matches** — open courses with match score ≥ 83, top suggestions to apply to.
4. **Rest & Practice Reminder** — keeps the teacher's own meditation practice visible.

Every other teacher screen is reachable from here (directly or via the See-All / view-detail links).

---

## 3. Visual Layout (top → bottom, prototype-faithful)

> **Container** — `<ScrollView>` with `Colors.cr` (`#F8F3EB`) as the screen background (matches prototype `.screen` at line 467).

### 3.1 Hero — saffron, padding `58 18 26`

Background: `linear-gradient(160deg, #6B3600, var(--sf))` (saffron two-stop). Overflow hidden. Relative positioning so decorations stack inside.

- **Decorations** (z-behind):
  - `LotusHero` — white, opacity `0.09`, size `230`, right `-35`, bottom `-35`.
  - `MountainSilhouette` — default color (`rgba(255,255,255,0.07)` in app code).

- **Top row** (`flex justify-between align-center position-relative`):

  **Left column:**
  - `Namaste` — **fontSize 13**, color `rgba(255,255,255,0.72)`, `fontFamily: Noto Sans Devanagari`.
  - `<Display name> Ji 🙏` — **fontSize 23**, `fontWeight: 800`, color white. Display name = last word of `teacher.name` (e.g. "Bhikkhu Ananda" → "Ananda Ji 🙏").
  - `Assistant Teacher · Nepal 🇳🇵` — **fontSize 12.5**, color `rgba(255,255,255,0.7)`.

  **Right column** (`flex column align-end gap 9`):
  - **Avatar tile** — `58 × 58`, `borderRadius: 20`, bg `rgba(255,255,255,0.18)`, center-aligned. **Content**: the Dhamma Wheel GIF (`assets/logo-dhamma.gif`) rendered at `40 × 40`. (The prototype writes "🧘" but its `renderIcon` helper at line 699 swaps that for the dhamma wheel GIF — we render the GIF directly.)
  - **Language toggle pill** — bg `rgba(255,255,255,0.18)`, border `1 px rgba(255,255,255,0.3)`, padding `4 × 11`, `borderRadius: 20`, fontSize `10.5`, weight `700`, color white. Label: `🌐 <alt-language-name>` (so EN-active shows `नेपाली`; NE-active shows `English`).

- **Stats row** (`flex row gap 8 marginTop 18 position-relative`):
  - Three tiles, each `flex: 1`, bg `rgba(255,255,255,0.14)`, `borderRadius: 13`, padding `10 × 8`, `textAlign: center`.
  - Per tile:
    - Value — **fontSize 18**, `fontWeight: 800`, color white.
    - Label — **fontSize 10**, color `rgba(255,255,255,0.72)`, `marginTop: 1`.
  - Stat content (data-driven):
    | # | Value | Label key |
    |---|---|---|
    | 0 | `teacher.totalCourses` (lifetime courses across all countries) | `home.stat_courses` |
    | 1 | `🇳🇵 ${nepalCentersCount}` — distinct Nepal centers from `teacher.teachingHistory` where `country === 'Nepal'`. Falls back to `teacher.centersServed` if history is empty. | `home.stat_nepal` |
    | 2 | `✓ ${appliedCount}` — count of `applications` with `status !== 'rejected'` | `home.stat_applied` |

---

### 3.2 Section header — Upcoming Courses

Uses prototype `.sph` (line 509):
- margin `18 18 9`
- **fontSize 12**, `fontWeight: 700`
- color `var(--tx2)` = `Colors.tx2` (`#7A6A58`)
- `textTransform: uppercase`
- `letterSpacing: 0.07em`

Text: `📅 {t('home.upcoming_title')}` — the 📅 emoji is JSX-inline, not in the i18n string.

---

### 3.3 Upcoming-course cards

One card per **myCourse** (an approved application whose `course.startDate` is in the future). Card is a `.card.c-ptr` (prototype lines 483–485):

- margin `0 18 11`, padding `15`, `borderRadius: 16`, bg `var(--card)` = white (`#FFFFFF`).
- `box-shadow: 0 2px 14px rgba(28,20,8,0.09)` (the prototype `--sh`).
- Layout: `flex row align-center gap 11`.

Inside:
- **Lotus tile** — `46 × 46`, `borderRadius: 13`, bg `Colors.fol` (`#E8F2EA`), centered. Content: the `Icons.Lotus` SVG (8-petal stylized lotus, see component inventory), rendered at `size: 28`, color `Colors.fo` (`#3D6847`). The tile itself does **not** show a fallback emoji — the SVG is the icon.
- **Middle column** (`flex: 1`):
  - `{course.type} Course` — fontSize 14, weight 700.
  - `{course.center} · {course.city}` — fontSize 12, color `Colors.tx2`.
  - `📅 {course.dates} · 🛬 {course.arrivalDate}` — fontSize 11.5, color `Colors.tx3`, `marginTop: 1`.
- **Right column** (`flex column align-end gap 4`):
  - **Confirmed pill** — prototype `.spill.appr` (line 524): bg `Colors.fol`, color `Colors.fo`, fontSize `11.5`, weight `700`, padding `5 × 11`, `borderRadius: 20`. Label: `✓ {t('home.confirmed_pill')}`.
  - **View-brief link** — fontSize **10**, color `Colors.fo`, weight `700`. Label: `t('home.view_brief')`.

Card animation: `cardUp .3s ease-out` (slide-up from below) — implementable via `FadeInView` or a small `useEffect` on mount.

Tap → `router.push(routeTo.teacherApplicationBrief(course.id))`. Stops propagation if needed.

**Empty state** (no upcoming courses):
- Single inline card with same `.card` chrome, padding 15.
- Body text — fontSize 12.5, color `Colors.tx2`: `t('home.no_upcoming')`.
- Inline outline button (`btn.ou.sm`) — saffron text — labelled `t('home.browse_all')`, routes to `Routes.teacherCourses`.

---

### 3.4 Section header — Best Matches for You

A **three-element row** (`flex row align-center padding 4 18 7`, `justifyContent: 'space-between'`):
- Left: `⭐ {t('home.best_matches')}` styled as `.sph` (but `margin: 0` so it sits in the row).
- Middle: `<ViewToggle>` segmented control (▦ Cards / ☰ Table), 30 px tall, compact pill — same component used on the Courses screen. State source: `settingsStore.homeMatchesViewMode` (`'cards' | 'table'`, default `'cards'`).
- Right: `t('home.see_all')` link — fontSize `13`, color `Colors.sf`, weight `600`. Tap → `Routes.teacherCourses`.

Then a single line of hint text (`padding 0 18 9`):
- fontSize 12, color `Colors.tx3`, `fontStyle: italic`.
- Text: `t('home.match_basis')` = "Based on profile & availability".

---

### 3.5 Match cards

One card per **course where `match >= 83`**, top 5 by score (we cap at 5 to avoid runaway scrolling on home — see §12). Card chrome is `.card.c-ptr` plus a **4 px left border** colored by tier:
- `Colors.fo` if `match >= 95`
- `Colors.sf` if `83 <= match < 95`

Inside:
- **Top row** (`flex justify-between align-start marginBottom 7`):
  - **Left** (`flex: 1`):
    - `{course.type}` — fontSize 15, weight 700.
    - `{course.center}` — fontSize 13, color `Colors.tx2`.
    - `{course.city}` — fontSize 12, color `Colors.tx3`.
  - **Right**:
    - `MB` (Match Badge) — see component inventory. Renders `{score}% match` with tier styling.

- **Chip row** (`flex wrap gap 5 marginBottom 7`):
  - Date chip — `.chip.gy` (`Colors.cr2` bg, `Colors.tx2` text). Label: `📅 {course.dates}`.
  - One language chip per `course.languages[i]` — `.chip.bl` (`Colors.bll` bg, `Colors.bl` text). Label: `{language}`.
  - Need chip — `.chip.sf` (`Colors.sfl` bg, `Colors.sfd` text). Label: `{course.needCount} AT`.
  - **Chip CSS (prototype line 486)**: fontSize 11, weight 600, padding `3 × 9`, `borderRadius: 20`, `display: inline-flex`, `align-items: center`, margin `2`. No uppercase.

- **Meter** — see component inventory. 5 px tall horizontal bar showing match %.

Tap → `router.push(routeTo.teacherCourseDetail(course.id))`. Card animation: `cardUp .35s ease-out`.

---

### 3.5b Match table view (mutually exclusive with §3.5)

Rendered when `homeMatchesViewMode === 'table'`. Mirrors `CoursesTable` from spec 05 §3.3b: proper tabular layout with header row, vertical column dividers, scrollable left columns and a sticky right column. Same 5-row cap and sort as the cards (`match desc`, `startDate asc`, threshold 83).

- Outer container: `marginHorizontal: 18`, `marginBottom: 11`, `borderRadius: 14`, `Shadows.card`, white bg, `overflow: hidden`.
- Layout: outer `flexDirection: row` with two siblings — horizontal `ScrollView` left pane + fixed-width sticky right pane separated by a 1 px `Colors.bd` left border.
- Header row: 32 px / `Colors.cr2` / 10.5 px / weight 700 / `tx2` / uppercase / `letterSpacing: 0.66`.
- Body row: `minHeight: 64`, 1 px bottom border `Colors.bd` (dropped on the last row).

Scroll-pane columns: Match (58) · Type (92) · Centre+city (130) · Dates (100, 2 lines max) · Langs (76, 2 lines max) · Need (50, right-aligned `${needCount}` + tiny `AT`).

Sticky right pane: 44 px wide column containing only a `→` chevron (18 / `tx3`) per row. No status column because home is discovery-mode (no applied state yet).

Distance is omitted on home (most Nepal-local rows lack `travel`). Row tap (either pane) → `routeTo.teacherCourseDetail(course.id)`.

---

### 3.6 Rest & Practice Reminder card

Always rendered (one card, bottom of the screen). Card chrome with overrides:
- bg `Colors.gdl` (`#FFF8E3`)
- border `1 px #F5E0A0`
- otherwise same `.card` shape (radius 16, padding 15, margin `0 18 11`).

Inside:
- **Title** — fontSize 13, weight 700, color `Colors.gd` (`#C89000`), `marginBottom: 4`. Label: `🌙 {t('home.rest_title')}`.
- **Body** — fontSize 12, color `#7A6000` (= `Colors.gdd`, "gold dark"). Two templates based on rest-gap state:
  - Complete (lastCourse ≤ today − 60 days): `home.rest_complete_template` with `{{last}}` = "Mar 2026" style, `{{next}}` = a suggested next sit (today + 14 days).
  - Pending (otherwise): `home.rest_pending_template` with `{{last}}`, `{{eligible}}` = lastCourse + 60 days.

Animation: `cardUp .4s ease-out`.

---

### 3.7 Bottom spacer

A `<View style={{ height: 20 + insets.bottom }} />` so the rest card never hugs the home-indicator on iOS.

---

## 4. Component Inventory

| Element | Type | Source | Notes |
|---|---|---|---|
| Hero gradient | `LinearGradient` | `expo-linear-gradient` | Reuse `GradientDirection.hero` for the 160° angle |
| `LotusHero` | SVG | `src/components/ui/HeroDecorations` (existing) | Already in onboarding |
| `MountainSilhouette` | SVG | `src/components/ui/HeroDecorations` (existing) | — |
| Dhamma wheel GIF | image | `assets/logo-dhamma.gif` (existing) | Rendered via `expo-image` at `width/height: 40` inside the avatar tile |
| Language toggle pill | inline | this file | Same look as the onboarding StepHero pill; consider factoring later |
| Stat tile | inline | this file | 3 fixed-shape tiles |
| Section header (`.sph`) | inline | this file | Static styling: 12 px / 700 / tx2 / uppercase / letter 0.07em / margin `18 18 9` |
| Upcoming-course card | inline | this file | Uses `Icons.Lotus` SVG inside the 46 × 46 tile |
| `Icons.Lotus` | SVG | **new** — `src/components/ui/Icons.tsx` | 8-petal stylized lotus (4 outer + 4 inner ellipses + 2 concentric circles). Direct port of prototype `app.html:105–118`. Used here and in many later screens. |
| `MatchBadge` (MB) | inline | **new** small component or inline | Tiered pill: ≥90 high (`fol/fo`), ≥70 mid (`bll/bl`), else low (`cr2/tx2`). 12 px / 700 / padding `3 × 10` / radius 20. Existing `MatchBadge` in `src/components/ui/Badge.tsx` may already match — verify first. |
| `Meter` | inline | **new** small component or inline | 5 px tall, bg `Colors.cr3`, fill width = score %, fill color = `fo` (≥90) / `bl` (≥70) / `tx3` (else). Radius 3. |
| Chips (`gy`, `bl`, `sf`, `appr` spill) | inline | this file | Static styles from prototype line 486–525 |
| Rest card | inline | this file | Static styling with gold accent |

> **New shared components to add in this branch:** `Icons.Lotus` SVG (used by many later screens). `MatchBadge` + `Meter` if existing variants don't match the prototype 1:1.

---

## 5. Design Tokens

All values come from `src/theme/colors.ts` and `src/theme/spacing.ts` — **no new theme module is created for this screen**. The premium-system module (`src/theme/premium.ts`) that was added in an earlier attempt is rolled back as part of this work.

| Element | Token |
|---|---|
| Screen bg | `Colors.cr` |
| Card bg | `Colors.white` (= prototype `--card`) |
| Card shadow | `Shadows.card` (existing, derived from prototype `--sh`) |
| Hero gradient | `['#6B3600', Colors.sf]` |
| Hero overlay tiles | `rgba(255,255,255,0.18)` and `rgba(255,255,255,0.14)` (kept as literals — no token yet) |
| Confirmed pill | bg `Colors.fol`, fg `Colors.fo` |
| Date chip | bg `Colors.cr2`, fg `Colors.tx2` |
| Language chip | bg `Colors.bll`, fg `Colors.bl` |
| Need chip | bg `Colors.sfl`, fg `Colors.sfd` |
| Match tiers | high `fol/fo` · mid `bll/bl` · low `cr2/tx2` |
| Rest card | bg `Colors.gdl`, border `#F5E0A0`, title `Colors.gd`, body `#7A6000` |

Fonts — **inline literal sizes from the prototype** (same rule as login / onboarding). Do not use `FontSize` tokens here.

---

## 6. Strings & i18n

Namespace `home.*`. Strings come from the **prototype** verbatim (EN line 599 / NE line 651). Already in `src/translations/{en,ne}.json` from the previous commit.

| Key | EN | NE |
|---|---|---|
| `home.greeting` | `Namaste` | `नमस्ते` |
| `home.subtitle` | `Assistant Teacher · Nepal 🇳🇵` | `सहायक शिक्षक · नेपाल 🇳🇵` |
| `home.stat_courses` | `Courses` | `शिविर` |
| `home.stat_nepal` | `Nepal` | `नेपाल` |
| `home.stat_applied` | `Applied` | `आवेदन` |
| `home.upcoming_title` | `Upcoming Courses` | `आगामी शिविरहरू` |
| `home.confirmed_pill` | `Confirmed` | `पुष्टि भयो` |
| `home.view_brief` | `View Pre-Course Brief →` | `शिविर-पूर्व विवरण हेर्नुहोस् →` |
| `home.no_upcoming` | `No upcoming courses` | `कुनै आगामी शिविर छैन` |
| `home.browse_all` | `Browse All Courses` | `सबै शिविर हेर्नुहोस्` |
| `home.best_matches` | `Best Matches for You` | `तपाईंका लागि उत्तम मिलान` |
| `home.see_all` | `See all →` | `सबै हेर्नुहोस् →` |
| `home.view_cards` | (a11y) `Cards` | `कार्ड` |
| `home.view_table` | (a11y) `Table` | `तालिका` |
| `home.match_basis` | `Based on profile & availability` | `तपाईंको प्रोफाइल र उपलब्धतामा आधारित` |
| `home.need_at` | `{{count}} AT` | `{{count}} AT` |
| `home.rest_title` | `Rest & Practice Reminder` | `विश्राम र साधना स्मरण` |
| `home.rest_complete_template` | `Last course: {{last}}. Now eligible again. Next suggested sit: {{next}}.` | `अन्तिम शिविर: {{last}}। फेरि योग्य। अर्को सुझाव गरिएको शिविर: {{next}}।` |
| `home.rest_pending_template` | `Last course: {{last}}. Eligible after {{eligible}}.` | `अन्तिम शिविर: {{last}}। {{eligible}} पछि योग्य।` |

---

## 7. Local State

`homeMatchesViewMode` is read from / written to `settingsStore`, not local state. No screen-local state otherwise.

---

## 8. Behavior

| Trigger | Action |
|---|---|
| Tap 🌐 toggle | `settingsStore.setLanguage(altLang)` (i18next switches in place) |
| Tap upcoming card | `router.push(routeTo.teacherApplicationBrief(course.id))` |
| Tap "Browse All Courses" (empty state) | `router.push(Routes.teacherCourses)` |
| Tap "See all →" | `router.push(Routes.teacherCourses)` |
| Tap match card | `router.push(routeTo.teacherCourseDetail(course.id))` |
| Mount | `loadProfile(userId)` + `loadApplications(userId)` (idempotent) |
| Pull-to-refresh (future) | re-fetch profile + applications + courses |

---

## 9. Data Dependencies

| Store | Reads |
|---|---|
| `authStore` | `userId` |
| `teachersStore` | `findTeacher(userId)` → `name`, `totalCourses`, `centersServed`, `teachingHistory` |
| `profileStore` | `profile` (used by `enrichCoursesWithMatch`) |
| `applicationsStore` | `applications` — derives `appliedCount` (non-rejected), and approved future-dated → upcoming |
| `coursesStore` | `courses` — base list for match enrichment. **Source:** synced from `https://www.dhamma.org/en/schedules/{schId}` for each centre in `NEPAL_CENTERS` (`src/utils/scraper.ts`). Sync runs from `coursesStore.syncCourses()`; the screen uses whatever is currently cached. Home does not trigger a sync on its own — it just renders what's there. |
| `settingsStore` | `language` (for the toggle pill); `homeMatchesViewMode` (cards vs table) |

Helpers used (existing):
- `enrichCoursesWithMatch(courses, profile)` → adds `match` and `tier` to courses.
- `getMatchTier(score)` → `'high' | 'mid' | 'low'`.

---

## 10. Navigation

| Direction | Source | Target |
|---|---|---|
| In | Login (teacher with `isOnboarded === true`) | this screen |
| In | Onboarding step-5 "Enter Dhamma AT" | this screen (replace) |
| Out — upcoming card | tap | `/(teacher)/applications/brief/[id]` |
| Out — match card | tap | `/(teacher)/courses/[id]` |
| Out — See all / Browse All | tap | `/(teacher)/courses` |

---

## 11. Acceptance Checklist

- [ ] Hero matches prototype at 390 × 844 (gradient, name + greeting layout, avatar tile shows the Dhamma wheel GIF at 40 × 40, language pill aligned right).
- [ ] Stat row shows 3 tiles with values driven from teacher record + applications count.
- [ ] Upcoming section renders cards for approved future-dated applications; otherwise the empty-state card with "Browse All Courses".
- [ ] Best matches: top 5 by score, ≥83 threshold, border-color tiers correct (fo ≥95, sf otherwise).
- [ ] Match cards render `Icons.Lotus` SVG (not an emoji) inside the 46 × 46 saffron tile.
- [ ] Chips use prototype CSS (font 11, weight 600, padding 3 × 9, radius 20).
- [ ] Rest card displays the right copy based on rest-period state.
- [ ] EN + NE both render without overflow at 390 px width.
- [ ] All hex values reference `Colors` tokens (no inline hex outside the documented hero overlay rgbas).
- [ ] All strings localized (no raw English in NE mode, no untranslated keys visible).
- [ ] No console warnings on mount/unmount.

---

## 12. Intentional Deltas from Prototype

| Delta | Prototype | Our app | Why |
|---|---|---|---|
| Display name | Hardcoded "Ananda Ji 🙏" | Last word of `teacher.name` + " Ji 🙏" | Data-driven |
| Match list size | All courses with match ≥ 83 | Top 5 only on home | Avoid runaway list; the full list lives at `/(teacher)/courses` |
| Avatar emoji | JSX writes "🧘" but `renderIcon` swaps to the dhamma-wheel GIF | We render the GIF directly via `expo-image` | Same visual result, no helper indirection |
| Hardcoded rest copy | "Last course: Mar 2026 …" hardcoded in prototype | Derive `last` / `next` / `eligible` from `teacher.teachingHistory` + 60-day gap | Real data, not stub |
| Card animations | CSS `@keyframes cardUp` | Use existing `FadeInView` (RN Animated) for the same effect | Native equivalent |
| Premium design module | n/a | Earlier attempt added `src/theme/premium.ts` with off-white cards, 28-radius, pastel chips — **rolled back** in this work | User decision (2026-05-14): home is a prototype-faithful port |
| Best Matches view toggle | Prototype shows cards only | Segmented ▦/☰ control in the section header; table mode renders a 7-column dense list | UX request (2026-05-18): scanning many courses at once is faster in tabular form |

---

## 13. Open Questions

- [ ] Rest-gap days hardcoded to 60. Where should this live long-term? `src/data/settings.json` or a tiny constants module — defer until admin can edit it.
- [ ] Card mount animation: nice-to-have, not blocking. Add `FadeInView` if time permits.
- [ ] When `coursesStore` is empty on first load (no sync yet), Best Matches stays empty. Should we auto-trigger a sync from home, or show a "Sync now" hint? Defer to a settings/admin decision; prototype shows pre-populated data.

---

## 14. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-14 | Sujay + Claude | Complete rewrite. Earlier draft with a premium design system was rejected; this draft anchors to the prototype only. |
| 2026-05-18 | Sujay + Claude | Added §3.4 toggle and §3.5b table view (persisted in `settingsStore.homeMatchesViewMode`). |
| 2026-05-18 | Sujay + Claude | Reworked §3.5b from horizontal-scroll columns to dense list rows that fit 390 px without horizontal drag. |
| 2026-05-18 | Sujay + Claude | Replaced dense list with proper tabular layout (header strip + column dividers + scrollable columns + sticky `→` column on the right). |
