# Spec: Teacher Onboarding

> **Status:** `draft`
> **Owner of approval:** Sujay
> **Last updated:** 2026-05-14

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `03-onboarding-teacher` |
| Route (Expo Router) | `/onboarding/teacher/[step]` |
| Source file | `app/onboarding/teacher/[step].tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines `1713–1932` |
| Roles | `teacher` |
| Related specs | [`01-login`](./01-login.md), `09-teacher-profile` (consumes the same fields) |

---

## 2. Purpose

After a newly-invited teacher signs in for the first time, this flow collects the **scheduling preferences** the admin cannot know in advance: languages spoken, regions preferred, monthly availability, and an optional personal note. Identity fields (name, gender, course authorizations, authorized-since year, home region) are **admin-locked** and shown read-only on the welcome step.

The flow ends by writing those preferences into the teacher's profile and marking `isOnboarded=true`.

---

## 3. Visual Layout (top → bottom)

This screen is a **6-step wizard** (step 0 through step 5), each step a full-screen view. Step 0 and step 5 use bespoke "ceremonial" heroes; steps 1–4 share a compact `StepHero`.

### Common: `StepHero` (steps 1–4)

`linear-gradient(160deg, #6B3600, #D4760E)` — teacher saffron, two stops.

1. **SBar** — light-content status bar, transparent.
2. **Top row** — left-aligned only (no right-side widget):
   - `STEP N OF 4` (uppercase, 11 px, white 70 %, `letterSpacing: .06em`, `fontWeight: 700`). N = current step (1–4).
3. **Title** — 22 px, `fontWeight: 800`, white, `lineHeight: 1.15`.
4. **Subtitle** — 13 px, white 78 %, `lineHeight: 1.5`, ~6 px margin-top.
5. **Progress bar** — 5 segments, 4 px tall, 2 px radius, `gap: 5px`, full-bleed (each `flex: 1`). Segment `i` is `white` if `i <= step - 1`, else `white 25 %`. *(Yes — 5 segments for steps 1–5; step 0 has no progress bar.)*
6. **Decorations** — `LotusHero` (white, 0.08 opacity, 200 px, bottom-right -30 / -30) + `MountainSilhouette` (white 0.07).

### Common: `NavRow` (steps 1–4)

Bottom-padded row, 18 px H padding, 9 px gap.

- **Back** — only rendered when `step > 0`. Outline button (`btn ou sm`), `flex: 1`. Label: `t('common.back')`.
- **Continue** — primary saffron button (`btn pr sm`), `flex: 2`. Label: `t('onboarding.continue')`. Disabled when `nextDisabled` is set by the step.

24 px bottom spacer below the NavRow.

---

### Step 0 — Welcome

Bespoke hero — **no NavRow, no StepHero progress bar**. The hero is taller and centered.

1. **Hero** — `linear-gradient(160deg, #6B3600, #C87010, #E8A058)`, padding `70px 24px 50px`, `textAlign: center`. Decorations: LotusHero 300 px @ 0.12, MountainSilhouette @ 0.08.
   - **🙏 glyph** — 54 px, centered, 14 px margin-bottom.
   - **Title** — `Welcome` / "स्वागत छ" mirror — 26 px, `fontWeight: 800`, white, `lineHeight: 1.15`. (In prototype the EN/NE titles are stacked: 26 px English line + 21 px Devanagari line in white 92 %.)
   - **Subtitle** — 13.5 px, white 82 %, `lineHeight: 1.55`, `maxWidth: 300`, centered, 14 px margin-top. Copy from `t('onboarding.welcome_sub')`.
2. **Admin-locked card** (`margin: 22px 18px 0`) — `Colors.fol` background, 1 px `Colors.fom` border, `Radius.card` (=14).
   - **Section label** — `YOUR ADMINISTRATOR HAS SET` / "व्यवस्थापकले सेट गरिसकेका छन्" — 12 px, `fontWeight: 800`, `Colors.fo`, uppercase, `letterSpacing: .05em`, 10 px margin-bottom.
   - **Four locked rows**, each `flex: row`, 11 px gap, 7 px vertical padding, dashed `Colors.fom` bottom border (no border on last). Per row:
     - Icon (18 px, 24 px square, centered): 👤 / 🎓 / 📅 / 🏠
     - Label (11 px, `Colors.tx3`, `fontWeight: 600`, uppercase, `letterSpacing: .04em`)
     - Value (13 px, `fontWeight: 700`, `Colors.tx`, 1 px margin-top)
   - Rows: **Name & Gender** · `Bhikkhu Ananda · Male AT` / **Course Authorizations** · `10-Day, Satipatthana, Children's, Teen, Executive` / **Authorized Since** · `2014` / **Home Region** · `Kathmandu Valley · Nepal 🇳🇵`. *(Values come from `findTeacher(authStore.userId)`; this card is informational only.)*
   - **Tail caption** — 11 px italic, `Colors.tx3`, `lineHeight: 1.5`, centered, 10 px margin-top: "Now let's set up your scheduling preferences" / "अब केही प्राथमिकताहरू सेट गरौं".
3. **Primary CTA** (`padding: 6px 18px`) — full-width `Colors.sf → Colors.sfd` gradient button, label `t('onboarding.continue')`. Routes to step 1.
4. 24 px bottom spacer.

---

### Step 1 — Languages

1. **StepHero** with `title = t('onboarding.q_langs')`, `subtitle = t('onboarding.q_langs_sub')`.
2. **Card** (`margin: 18px 18px 0`) — five rows, one per language. Each row `flex: row`, 11 px gap, 10 px vertical padding, 1 px `Colors.bd` bottom border (no border on last). Per row:
   - **State badge** — 34 × 34, `borderRadius: 10`, centered icon. Background + icon color follow state:
     - `primary` → bg `Colors.fol`, icon `★`, color `Colors.fo`
     - `secondary` → bg `Colors.gdl`, icon `·`, color `Colors.gd`
     - `off` → bg `Colors.cr2`, icon `✗`, color `Colors.tx3`
     - Icon: 16 px, `fontWeight: 800`.
   - **Language name** — 13.5 px, `fontWeight: 600`. `Colors.tx` when active, `Colors.tx3` when `off`.
   - **Chip** — right-aligned. `chip fo` (Primary) / `chip gd` (Secondary) / `chip gy` (Off). Label from i18n.
   - **Tap target** — entire row. Cycles: `primary → secondary → off → primary`.
3. **NavRow** — Back enabled, Continue always enabled.
4. 24 px bottom spacer.

**Languages list:** `Nepali`, `English`, `Hindi`, `Gujarati`, `German`. Defaults: `Nepali=primary`, `English=primary`, `Hindi=secondary`, `Gujarati=off`, `German=off`.

---

### Step 2 — Regions

1. **StepHero** with `title = t('onboarding.q_regions')`, `subtitle = t('onboarding.q_regions_sub')`.
2. **Filter chip row** (`padding: 18px 18px 0`) — wraps. Each chip is `fchip` with `+ <name>` if not selected, `✓ <name>` if selected. Selected state: `Colors.sfl` background, `Colors.sfd` text, `Colors.sf` border. Tap toggles.
3. **Selected card** (`margin: 14px 18px 0`) — only renders when `regions.length > 0`. Lists selected regions in order:
   - Label `SELECTED` / "छानिएका क्षेत्रहरू" — 11 px, `Colors.tx3`, `fontWeight: 600`, uppercase.
   - Each row: 24 × 24 saffron numbered badge (1, 2, 3…) + region name (13 px, `fontWeight: 600`), 7 px vertical padding, 1 px `Colors.bd` separator (no separator on last).
4. **NavRow** — Continue disabled when `regions.length === 0`.
5. 24 px bottom spacer.

**Regions list:** `Kathmandu Valley`, `Pokhara`, `Lumbini & Terai`, `Koshi`, `Gandaki`, `Madhesh`, `International`. Default: `["Kathmandu Valley"]`.

---

### Step 3 — Availability

1. **StepHero** with `title = t('onboarding.q_avail')`, `subtitle = t('onboarding.q_avail_sub')`.
2. **Summary** (inside the calendar card): `<N> months available` — N is bolded in `Colors.fo`, the rest in `Colors.tx2`. 12 px.
3. **12-month grid** — `display: grid; gridTemplateColumns: repeat(6, 1fr); gap: 5px`. Each cell:
   - `borderRadius: 10`, padding `8px 4px`, `textAlign: center`, `userSelect: none`.
   - Background by state:
     - `1` (available) → `Colors.fo`, text white
     - `'f'` (festival block) → `Colors.gd`, text white
     - `0` (unavailable) → `Colors.cr3`, text `Colors.tx3`, 1.5 px `Colors.bd` border
   - Month label — 10 px, `fontWeight: 700`. EN abbrev (`Jan`…`Dec`) when lang=en, NE abbrev (जन, फेब, …) when lang=ne.
   - Status glyph — 9 px, 2 px margin-top, 85 % opacity. `1 → ✓`, `'f' → 🎑`, `0 → ✗`.
   - Tap cycles: `1 → 'f' → 0 → 1`.
4. **Hint** — 10.5 px italic, `Colors.tx3`, centered, 7 px margin-top: "Tap a month to cycle: Available → Festival → Unavailable" (i18n: `onboarding.av_tap_hint`).
5. **NavRow** — Continue always enabled.
6. 24 px bottom spacer.

**Default availability:** `[1, 1, 1, 1, 'f', 0, 1, 1, 1, 'f', 'f', 0]` (Jan–Dec).

---

### Step 4 — Personal Note

1. **StepHero** with `title = t('onboarding.q_note')`, `subtitle = t('onboarding.q_note_sub')`.
2. **Card** (`margin: 18px 18px 0`) — single `TextInput multiline`, 6 rows (`numberOfLines={6}`, `textAlignVertical='top'`), styled like other inputs (white bg, `Colors.bd` border, 12 px radius, 16 px text, 1.5 line-height). Placeholder = `t('onboarding.note_placeholder')`.
3. **NavRow** — Continue always enabled (note is optional).
4. 24 px bottom spacer.

---

### Step 5 — Done

Bespoke confirmation hero — **no NavRow, no progress bar**. Different gradient (forest green).

1. **Hero** — `linear-gradient(160deg, #1C4228, #3D6847)` (`Gradients.autoSchedule` already covers this), padding `80px 24px 50px`, `textAlign: center`. Decorations: LotusHero 320 px @ 0.12 right-bottom, MountainSilhouette @ 0.09.
   - **🙏 glyph** — 64 px, 14 px margin-bottom.
   - **Title** — 26 px, `fontWeight: 800`, white, `lineHeight: 1.15`. EN `Onboarding complete` / NE "अनबोर्डिङ् पूर्ण". (Mirrored EN+NE lines, like step 0.)
   - **Subtitle** — 13.5 px, white 85 %, `lineHeight: 1.55`, `maxWidth: 300`, centered, 14 px margin-top. Copy from `t('onboarding.done_sub')`.
2. **Summary card** (`margin: 22px 18px 0`) — `Colors.fol` bg, 1 px `Colors.fom` border. Four rows, same layout as the step-0 admin card (icon + label + value, dashed `Colors.fom` separator):
   - 🗣 **LANGUAGES** — comma-joined active langs with `★` after primaries, e.g. `Nepali ★, English ★, Hindi`.
   - 📍 **REGIONS** — `›`-separated in selection order, e.g. `Kathmandu Valley › Pokhara`.
   - 📅 **AVAILABILITY** — `<X> months · <Y> festival blocks` (counts derived from the 12-cell array).
   - 💬 **PERSONAL NOTE** — first 50 chars of note + `…`, or `(none)` / "(छैन)".
3. **Primary CTA** (`padding: 6px 18px`) — `t('onboarding.enter_app')` → routes to `Routes.teacherHome` AND fires `markOnboarded(authStore.userId)` on the profile store so subsequent app loads skip this flow.
4. 24 px bottom spacer.

---

## 4. Component Inventory

| # | Element | Type | Component (existing or new) | Prototype style ref |
|---|---|---|---|---|
| 1 | StepHero | layout | **new** local in screen | `app.html:1730–1746` |
| 2 | NavRow | row of buttons | **new** local in screen | `app.html:1748–1753` |
| 3 | LotusHero + MountainSilhouette | SVG decoration | `@/components/ui/HeroDecorations` (exists) | reused |
| 4 | Welcome 🙏 + EN/NE title block | text | inline | `app.html:1762–1765` |
| 5 | Admin-locked field row | row | **new** `AdminLockedField` (small reusable; could inline) | `app.html:1777–1785` |
| 6 | Language cycle row | tappable row | **new** `LanguageCycleRow` (inline) | `app.html:1810–1815` |
| 7 | FilterChip (region) | chip | `@/components/ui/FilterChip` (exists) — verify variant matches | `app.html:1830–1834` |
| 8 | Selected-regions row | numbered row | inline | `app.html:1842–1847` |
| 9 | Availability month cell | tappable cell | **new** `MonthCycleCell` (inline) | `app.html:1864–1875` |
| 10 | Note textarea | input | `TextInput` (RN built-in) | `app.html:1890` |
| 11 | Summary row (step 5) | row | reuses **#5** | `app.html:1915–1922` |
| 12 | Primary CTA (welcome/done) | button | `Button` (`@/components/ui/Button`) or local gradient button | reused |

> The existing `app/onboarding/teacher/[step].tsx` defines **7 steps** including a "Course Types" step we will **remove** (course types come from the admin per spec §2). Re-implementation is a near-rewrite.

---

## 5. Design Tokens

| Element | Token(s) | Notes |
|---|---|---|
| StepHero gradient (steps 1–4) | `Gradients.teacher` first-two stops or new `Gradients.teacherCompact = ['#6B3600','#D4760E']` | prototype uses 2-stop variant; add to colors.ts if not present |
| Welcome hero gradient | `Gradients.teacher` (3-stop) | already exists |
| Done hero gradient | `Gradients.autoSchedule` (`['#1C4228','#3D6847']`) | already exists |
| Card background (admin & summary) | `Colors.fol` | |
| Card border (admin & summary) | `Colors.fom` | |
| Section labels (uppercase) | `Colors.fo` (admin) / `Colors.tx3` (others) | |
| Step counter / lang toggle | `rgba(255,255,255,0.7)` / `rgba(255,255,255,0.18)` | semi-transparent on hero — propose token `OverlayLight` |
| Progress segment on | `Colors.white` | |
| Progress segment off | `rgba(255,255,255,0.25)` | propose token |
| Lang state — Primary | `Colors.fol` bg, `Colors.fo` icon | |
| Lang state — Secondary | `Colors.gdl` bg, `Colors.gd` icon | |
| Lang state — Off | `Colors.cr2` bg, `Colors.tx3` icon | |
| Avail state — Available | `Colors.fo` bg, white text | |
| Avail state — Festival | `Colors.gd` bg, white text | |
| Avail state — Unavailable | `Colors.cr3` bg, `Colors.tx3` text, `Colors.bd` border | |
| Region numbered badge | `Colors.sf` bg, white text | |

### Local Constants

| Name | Value | Used by | Promote to token? |
|---|---|---|---|
| `WHITE_70` | `rgba(255,255,255,0.7)` | step counter text | yes — `Colors.overlayTextStrong` |
| `WHITE_18` | `rgba(255,255,255,0.18)` | lang toggle bg | yes — `Colors.overlayChipBg` |
| `WHITE_25` | `rgba(255,255,255,0.25)` | progress bar off | yes — `Colors.overlayDim` |

---

## 6. Strings & i18n

**Namespace:** `onboarding.*`. All keys are new (none exist yet in `en.json` / `ne.json`).

| Key | Used in | English | Nepali | Source |
|---|---|---|---|---|
| `onboarding.step_label` | hero counter | `STEP {{n}} OF {{total}}` | `चरण {{n}} / {{total}}` | prototype `to_step + to_of` (compose into single key with vars) |
| `onboarding.lang_toggle` | hero pill | `EN \| NE` | `EN \| NE` | static — same both langs |
| `onboarding.continue` | NavRow primary | `Continue` | `जारी राख्नुहोस्` | `common.continue` exists — reuse, no new key |
| `onboarding.back` | NavRow back | reuse `common.back` | — | — |
| `onboarding.welcome` | step 0 title (EN) | `Welcome` | `Welcome` (mirrored line) | prototype |
| `onboarding.welcome_ne` | step 0 title (NE) | `स्वागत छ` | `स्वागत छ` | prototype |
| `onboarding.welcome_sub` | step 0 subtitle | `Just a few quick questions to help us match you to the right courses.` | `तपाईंलाई सही पाठ्यक्रमहरूमा मिलाउन केही द्रुत प्रश्नहरू।` | prototype `to_welcome_sub` |
| `onboarding.admin_section_label` | step 0 card header | `YOUR ADMINISTRATOR HAS SET` | `व्यवस्थापकले सेट गरिसकेका छन्` | prototype |
| `onboarding.field_name_gender` | step 0 row label | `NAME & GENDER` | `नाम र लिङ्ग` | prototype |
| `onboarding.field_authorizations` | step 0 row label | `COURSE AUTHORIZATIONS` | `शिविर प्राधिकरण` | prototype |
| `onboarding.field_since` | step 0 row label | `AUTHORIZED SINCE` | `प्राधिकरणको वर्ष` | prototype |
| `onboarding.field_home_region` | step 0 row label | `HOME REGION` | `गृह क्षेत्र` | prototype |
| `onboarding.welcome_card_tail` | step 0 card tail | `Now let's set up your scheduling preferences` | `अब केही प्राथमिकताहरू सेट गरौं` | prototype |
| `onboarding.q_langs` | step 1 title | `Which languages can you teach in?` | `तपाईं कुन भाषामा पढाउन सक्नुहुन्छ?` | prototype `to_q_langs` |
| `onboarding.q_langs_sub` | step 1 subtitle | `Tap a language to cycle through Primary, Secondary, and Off.` | `प्राथमिक, माध्यमिक र बन्द बीच फेरबदल गर्न ट्याप गर्नुहोस्।` | prototype `to_q_langs_sub` |
| `onboarding.lang_primary` | chip | `Primary` | `प्राथमिक` | prototype `ep_lang_primary` |
| `onboarding.lang_secondary` | chip | `Secondary` | `माध्यमिक` | prototype `ep_lang_secondary` |
| `onboarding.lang_off` | chip | `Off` | `बन्द` | prototype `ep_lang_off` |
| `onboarding.q_regions` | step 2 title | `Where would you like to serve?` | `तपाईं कहाँ सेवा गर्न चाहनुहुन्छ?` | prototype `to_q_regions` |
| `onboarding.q_regions_sub` | step 2 subtitle | `Tap to add a region. Tap again to remove.` | `क्षेत्र थप्न ट्याप गर्नुहोस्। हटाउन फेरि ट्याप गर्नुहोस्।` | prototype `to_q_regions_sub` |
| `onboarding.regions_selected_label` | selected card header | `SELECTED` | `छानिएका क्षेत्रहरू` | prototype |
| `onboarding.region_*` | each region | `Kathmandu Valley`, … | `काठमाडौं उपत्यका`, … | reuse if already in profile namespace; add if missing |
| `onboarding.q_avail` | step 3 title | `When are you usually available?` | `तपाईं कहिले उपलब्ध हुनुहुन्छ?` | prototype `to_q_avail` |
| `onboarding.q_avail_sub` | step 3 subtitle | `Mark each month: Available, Festival, or Unavailable.` | `प्रत्येक महिना चिन्ह लगाउनुहोस्: उपलब्ध, पर्व, अनुपलब्ध।` | prototype `to_q_avail_sub` |
| `onboarding.av_count_template` | summary | `{{count}} months` | `{{count}} महिना` | prototype |
| `onboarding.av_tap_hint` | hint | `Tap a month to cycle through states` | `अवस्था फेरबदल गर्न महिना ट्याप गर्नुहोस्` | prototype `av_tap_hint` |
| `onboarding.q_note` | step 4 title | `Anything else?` | `अरू केही?` | prototype `to_q_note` |
| `onboarding.q_note_sub` | step 4 subtitle | `Share preferences or context that may help with scheduling.` | `अनुसूचनामा सहयोग गर्ने प्राथमिकता वा सन्दर्भ साझा गर्नुहोस्।` | prototype `to_q_note_sub` |
| `onboarding.note_placeholder` | textarea | `e.g. I cannot serve in the monsoon months due to family commitments…` | `उदाहरण: पारिवारिक कारणले मनसुनमा सेवा गर्न सक्दिनँ…` | prototype `ep_note_ph` |
| `onboarding.done` | step 5 title | `Onboarding complete` | `अनबोर्डिङ् पूर्ण` | prototype `to_done` |
| `onboarding.done_sub` | step 5 subtitle | `Your scheduling preferences are saved. Welcome to the Dhamma AT path. 🙏` | `तपाईंका प्राथमिकता सुरक्षित गरिए। धम्म AT यात्रामा स्वागत छ। 🙏` | prototype `to_done_sub` |
| `onboarding.summary_langs_label` | step 5 row | `LANGUAGES` | `भाषाहरू` | reuse `profile.languages` if shape allows |
| `onboarding.summary_regions_label` | step 5 row | `REGIONS` | `क्षेत्रहरू` | — |
| `onboarding.summary_avail_label` | step 5 row | `AVAILABILITY` | `उपलब्धता` | — |
| `onboarding.summary_note_label` | step 5 row | `PERSONAL NOTE` | `व्यक्तिगत नोट` | — |
| `onboarding.summary_festival_blocks` | step 5 row | `{{count}} festival blocks` | `{{count}} पर्व रोक` | prototype |
| `onboarding.summary_note_empty` | step 5 row | `(none)` | `(छैन)` | prototype |
| `onboarding.enter_app` | step 5 CTA | `Enter the app →` | `अनुप्रयोगमा प्रवेश गर्नुहोस् →` | prototype `to_enter` |

> Months use existing localized abbreviations; if `_i18n.md` already lists them, reuse. Otherwise add `onboarding.months_short` (array of 12 strings) for each language.

---

## 7. Local State

Held in the screen component; persisted to `profileStore` only on step-5 CTA.

| Name | Type | Initial | Purpose |
|---|---|---|---|
| `step` | `0–5` | from URL param `[step]`; default `0` | current wizard step |
| `langs` | `Record<string, 'primary'\|'secondary'\|'off'>` | `{ Nepali:'primary', English:'primary', Hindi:'secondary', Gujarati:'off', German:'off' }` | language proficiency map |
| `regions` | `string[]` | `['Kathmandu Valley']` | selected regions, ordered by selection time |
| `av` | `(0\|1\|'f')[]` | `[1,1,1,1,'f',0,1,1,1,'f','f',0]` | 12-cell monthly availability |
| `note` | `string` | `''` | optional personal note |

State is **lifted into the screen** (not split per step file), so navigating Back doesn't reset it. Route param drives which step view renders.

---

## 8. Behavior

| Trigger | Action | Result |
|---|---|---|
| Step 0 → tap Continue | `router.push('/onboarding/teacher/1')` | render step 1 |
| Step N (N≥1) → tap Back | `router.back()` (or `router.replace` if state restoration is unreliable) | render step N-1, state preserved |
| Step N (N≥1) → tap Continue | `router.push('/onboarding/teacher/{N+1}')` | render next step |
| Step 1 → tap language row | `cycleLang(key)` | local state advances `primary → secondary → off → primary`; UI badge + chip update |
| Step 2 → tap region chip | `toggleRegion(name)` | add/remove from `regions` array (preserve order on add) |
| Step 2 → Continue when `regions.length === 0` | button disabled | no nav |
| Step 3 → tap month cell | `cycleMonth(i)` | local state advances `1 → 'f' → 0 → 1`; cell bg + glyph update |
| Step 4 → type in note | `setNote` | textarea updates; no validation |
| ~~Hero → tap 🌐 lang toggle~~ | **removed** — not in prototype | — |
| Step 5 → tap "Enter the app" | `await profileStore.savePreferences({ langs, regions, av, note }); await profileStore.markOnboarded(); router.replace(Routes.teacherHome)` | profile persisted, `authStore.isOnboarded=true`, route to home |
| Hardware back (Android) | matches in-hero Back button when `step>0`; on step 0 ⇒ confirm dialog `"Discard onboarding?"` (Yes → `router.replace(Routes.login)`) | |

**Validation summary:** the only blocking condition is `regions.length === 0` on step 2.

---

## 9. Data Dependencies

| Store | Reads | Writes |
|---|---|---|
| `authStore` | `userId`, `role` (must be `'teacher'`) | `isOnboarded=true` (on step-5 CTA, via `setAuth`) |
| `teachersStore` | `findTeacher(userId)` → for admin-locked card values (name, gender, authorizations, since, home region) | — |
| `profileStore` | — | persists `{ languages, preferredRegions, availableMonths, festivalMonths, personalNote }` for the current user |
| `settingsStore` | `language` | `setLanguage('en' \| 'ne')` on hero toggle |

The 12-cell `av` array is converted via `fromAvailabilityArray()` (already in `@/utils/availability`) before write: `1 → availableMonths`, `'f' → festivalMonths`, `0 → omitted`.

---

## 10. Navigation

| Direction | Source | Target |
|---|---|---|
| In (first login) | `/(auth)/login` after successful teacher sign-in when `isOnboarded === false` | `/onboarding/teacher/0` |
| In (resumed) | `/(auth)/login` when `isOnboarded === false` (any role mid-flow) | last-seen step or `/0` if no record |
| Within | step N | step N±1 via wizard nav |
| Out (complete) | step 5 → "Enter the app" | `/(teacher)/home` (replace, not push) |
| Out (abort) | step 0 ← hardware back | confirm dialog → `/(auth)/login` (replace) |

---

## 11. Acceptance Checklist

- [ ] Visual matches prototype at 390 × 844 across all 6 steps (screenshot diff)
- [ ] All hex values reference `Colors` / `Gradients` tokens (no inline hex)
- [ ] All strings reference i18n keys (no hardcoded EN strings)
- [ ] Behavior in §8 implemented end-to-end including hardware-back confirm
- [ ] Navigation in §10 wired; URL changes per step
- [ ] State preserved across Back navigation
- [ ] EN and NE both render without text overflow at 390 px width
- [ ] Language toggle in the hero swaps month + region labels live
- [ ] Step-5 CTA writes to `profileStore` and `authStore.isOnboarded=true` (verify via reopening login → routes to `/(teacher)/home`)
- [ ] No console warnings on mount/unmount of each step

---

## 12. Intentional Deltas from Prototype

| Delta | Prototype | Our app | Why |
|---|---|---|---|
| Course types step | Prototype has no such step | Existing v1 had 7 steps including a course-types selector — **removed** | Course authorizations are admin-set per §2; the teacher cannot self-declare them |
| Font sizes | Prototype 11–14 px body | **Use prototype literals as-is** on this screen, ignoring the +2 px `FontSize` bump | Decided 2026-05-14 — user wants this flow visually identical to prototype |
| Language toggle (🌐 EN \| NE in hero) | Present on every step | **Removed** | Not in prototype — was incorrectly added in earlier draft |
| 🙏 emoji vs SVG | Prototype uses 🙏 emoji glyph | Keep emoji on welcome/done heroes | Decorative — emoji renders fine here at large sizes and a custom SVG isn't worth the cost |
| Festival glyph 🎑 | Prototype uses `🎑` emoji in month cells | Keep emoji | Same rationale |
| Hardware back on step 0 | Prototype is a web SPA; no system back | Show confirm dialog before discarding | Native app convention |

---

## 13. Open Questions

- [ ] Should the admin-locked values on step 0 fall back gracefully when `findTeacher(userId)` returns `undefined` (e.g., demo without seed data)? Propose: show "—" with a `console.warn`.
- [ ] Should the language toggle persist across logout, or scope per-user? (Existing behavior in `settingsStore` likely covers this — verify.)
- [ ] Month abbreviations — confirm Nepali list with translator (`जन, फेब, मार्च, अप्रिल, मे, जुन, जुलाई, अग, सेप, अक्ट, नोभ, डिस`).

---

## 14. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-14 | Sujay + Claude | Initial draft from prototype `app.html:1713–1932` |
