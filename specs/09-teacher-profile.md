# Spec: Teacher Profile

> **Status:** `code_done`
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-15

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `09-teacher-profile` |
| Route (Expo Router) | `/(teacher)/profile` |
| Source file | `app/(teacher)/profile/index.tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines `1385–1582` |
| Roles | `teacher` |
| Related specs | `04-teacher-home`, `10-teacher-edit-profile` |

---

## 2. Purpose

The teacher's own at-a-glance record. Read-only summary of who they are, what they can teach, when they're available, and where they're willing to serve — with editing offloaded to spec 10 (Edit Profile). The single biggest function is the **tappable availability grid**: the teacher cycles each month through available → festival → unavailable, and can quick-tap Buddha Jayanti / Dashain / Tihar to set the standard Nepali festival blocks in one tap.

---

## 3. Layout zones (top → bottom)

### 3.1 Orange-gradient hero (`linear-gradient(160deg, #6B3600, Colors.sf)`)

- `paddingHorizontal: 18`, `paddingBottom: 22`, `paddingTop: max(56, safeAreaTop + 14)`, `overflow: hidden`, `position: relative`.
- **`MeditationFigure`** decoration (size 130, color `rgba(255,255,255,0.1)`) — new SVG component to port from `app.html:183`. Positioned absolutely top-left inside the hero.
- **`LotusHero`** (color white, opacity 0.07, size 180, right -20, bottom -20).
- **Top pill row** (`marginBottom: 14`, `flexDirection: row, justifyContent: space-between, alignItems: center, position: relative`):
  - `🌐 {altLangLabel}` pill on the left — toggles `settingsStore.language`. `rgba(255,255,255,0.18)` bg, 1 px `rgba(255,255,255,0.3)` border, padding `5 / 12`, radius **20**, **11 px / 700 / white**.
  - `✏️ Edit` pill on the right — navigates to `/(teacher)/profile/edit`. Same dimensions.
- **Avatar + name row** (`flexDirection: row, alignItems: center, gap: 14, position: relative`):
  - Avatar — **72 × 72**, radius **24**, `rgba(255,255,255,0.22)` bg, 2 px `rgba(255,255,255,0.35)` border, centred. Inside: **🧘 emoji at 50 px** (prototype's `renderIcon("🧘", 50)`; the wrapper's `fontSize:34` is irrelevant — the helper overrides).
  - Right column:
    - Name — `profile.name`, **22 px / 800 / white**, `lineHeight: 24.2` (= 22 × 1.1).
    - Sub-line — `Assistant Teacher · Nepal {flag}`, **13 px / `rgba(255,255,255,0.75)`**, marginTop 3. (Prototype hardcodes "Nepal"; we'll use `region ?? "Nepal"` then append `flag`.)
    - Meta — `🔒 Authorized since {authorizedSince} · {Gender} AT`, **12 px / `rgba(255,255,255,0.6)`**, marginTop 1.
- **Stat tiles row** — 4 equal-width tiles, `gap: 8, marginTop: 16, position: relative`:
  - Each tile: `flex: 1`, `rgba(255,255,255,0.14)` bg, radius **12**, padding `9 / 6`, centred text.
  - Prototype adds `backdropFilter: blur(8px)` — RN doesn't support this natively. **Omit on native** (the rgba bg already gives the glass look); web-only opt-in possible via `style: { backdropFilter: 'blur(8px)' as any }`.
  - Number — **18 px / 800 / white**.
  - Label — **9 px / `rgba(255,255,255,0.65)`**, marginTop 1, lineHeight 1.2.
  - 4 values: `[totalCourses, "Total Courses"]`, `[centersServed, "Centers"]`, `[{currentYear - authorizedSince}, "Years"]`, `[coursesThisYear, "This Year"]`.

### 3.2 Eligibility status card (`Colors.fol` bg, `Colors.fom` border)

Wrapper around the card: `padding: 14 / 18 / 0` (top / horizontal / bottom — matches prototype's `padding:"14px 18px 0"`).

Card itself: `padding: 14 / 16`, `borderWidth: 1.5`, `borderColor: Colors.fom`, `borderRadius: 16`, `flexDirection: row, alignItems: center, gap: 12`.

- 44 × 44 forest tile (`Colors.fo` bg, radius 14) with ✅ at 22 px.
- Right column:
  - Title — `Eligible to Serve`, **14 px / 800 / `Colors.fo`**.
  - Sub — `Last course: {lastTaught} · Rest period complete`, **12 px / `Colors.tx2`**, marginTop 2.
  - Next-eligible — `Next eligible from: {date} ✓`, **12 px / 700 / `Colors.fo`**, marginTop 2.

Eligibility logic: `lastTaught + 21 days >= today`. The "Next eligible" date is `lastTaught + 21 days`. If teaching history is empty → show "No prior course on record · eligible".

### 3.3 Availability (tappable month grid + festival chips)

Section header (`.sph`): `📅 Availability` — 12 px / 700 / uppercase / `Colors.tx2`, letterSpacing **0.84** (`.07em × 12`), `margin: 18 / 18 / 9` (top, horizontal, bottom).

Card body (standard `.card`: white bg, radius 16, padding 15, margin `0 / 18 / 11`, `Shadows.card`):

- Top row (`marginBottom: 10, flexDirection: row, justifyContent: space-between, alignItems: center`):
  - Left text — `{N} months available` (12 / `Colors.tx2`), with **{N}** wrapped in `<Text>` of `Colors.fo` 700.
  - Right `4 max/year` chip — `.chip.fo` (`Colors.fol` bg / `Colors.fo` fg), **11 px / 600**, padding `3 / 9`, radius **20**, inline `margin: 0` (chip class default is 2; this overrides).
- **6 × 2 month grid** — RN: `flexDirection: row, flexWrap: wrap, gap: 5`, each tile `flexBasis: '15.5%'` (≈ `repeat(6,1fr)` with 5 px gap). 3 states from teacher data:
  - `available` (month index in `availableMonths` AND not in `festivalMonths`) → `Colors.fo` bg, white text, **✓** glyph.
  - `festival` (in `festivalMonths`) → `Colors.gd` bg, white text, **🎑** glyph.
  - `unavailable` (otherwise) → `Colors.cr3` bg, `Colors.tx3` text, **✗** glyph, **1.5 px `Colors.bd` border** (only on this state).
- Each tile: radius **10**, padding `8 / 4`, `alignItems: center`. Month label **10 / 700**, state glyph **9** with `opacity: 0.85`, marginTop 2.
- **Press feedback**: prototype scales tile to `transform: scale(.94)` on press. RN implementation: `<Pressable>` with `({pressed}) => ({transform: [{scale: pressed ? 0.94 : 1}]})`. `userSelect: none` mapped via `selectable={false}`.
- Tap cycles `available → festival → unavailable → available`. Each cycle writes both arrays back through `profileStore.setProfile` so the change is persisted immediately + reflected in matching scores on other screens.
- Hint text (10.5 / italic / `Colors.tx3`, `textAlign: center`, marginTop 7): `Tap any month to change availability`.
- Legend row (`flexDirection: row, gap: 10, marginTop: 10, flexWrap: wrap`):
  - 3 items, each `flexDirection: row, alignItems: center, gap: 5`:
    - 12 × 12 swatch (radius 3, with the state's bg colour; unavailable swatch adds the 1.5 px `Colors.bd` border).
    - Label (10.5 / `Colors.tx2`): `✓ Available`, `✗ Unavailable`, `🎑 Festival`.
- **Festival quick-chips** (marginTop 11, paddingTop 11, dashed top border via `DashedDivider` — same trick as cards 06/08):
  - Subtitle: `QUICK BLOCK` — **10.5 / 700 / uppercase / `Colors.tx3`**, letterSpacing **0.525** (`.05em × 10.5`), marginBottom 7.
  - Row of chips (`flexDirection: row, gap: 6, flexWrap: wrap`):
    - 🎑 Buddha Jayanti → sets index **4** (May) to festival
    - 🎑 Dashain → sets index **9** (Oct) to festival
    - 🎑 Tihar → sets index **10** (Nov) to festival
    - ⟲ Reset → sets every index to `unavailable` (clears both `availableMonths` and `festivalMonths` to `[]`). **No confirm step** — prototype is one-tap.
  - Festival chip styling: `Colors.gdl` bg, 1 px `#F0DCA0` border, **11 / 600 / `Colors.gd`**, padding `6 / 11`, radius **18**.
  - Reset chip: `Colors.cr2` bg, 1 px `Colors.bd` border, **11 / 600 / `Colors.tx2`**, same padding/radius.

### 3.4 Languages

Section header (`.sph`): `🗣 Languages` — same `12 / 700 / uppercase / Colors.tx2 / letterSpacing 0.84 / margin 18 / 18 / 9`.

Card body (standard `.card`):

- Label: `Can conduct courses in` — **11 px / 600 / uppercase / `Colors.tx3`**, letterSpacing **0.55** (`.05em × 11`), marginBottom 8.
- For each language in `profile.languages` where level is `'primary'` or `'secondary'` (skip `'off'`):
  - Row: `flexDirection: row, alignItems: center, gap: 11`, `padding: 10 / 0`, 1 px `Colors.bd` bottom border (every row including last; OR we drop the last border — prototype has it on every row, so keep).
  - Tile: **36 × 36**, radius **10**, fontSize **18** (for the flag emoji), `flexShrink: 0`. Bg: primary → `Colors.fol`, secondary → `Colors.cr2`.
  - Middle column (flex 1):
    - Name with native label in parens: `Nepali (नेपाली)` / `English` / `Hindi` etc. — **13.5 px / 700 / `Colors.tx`**.
    - Note (11 px / `Colors.tx3`, marginTop 1). Note text per language: from a static `LANGUAGE_NOTES` map in the source file (`Nepali → "Dhamma Shringa, Nepal"`, `English → "International courses"`, `Hindi → "Terai & Madhesh"`, `Gujarati → "Secondary"`, etc.).
  - Right chip — `★ Primary` (`.chip.fo`: `Colors.fol` / `Colors.fo`) or `Secondary` (`.chip.gy`: `Colors.cr2` / `Colors.tx2`). 11 / 600, padding 3 / 9, radius 20, `flexShrink: 0`, `margin: 0`.
- Language → flag emoji + native label resolved by a static `LANGUAGE_META` map keyed on `LanguageLabels` (the canonical English names used in `profile.languages`). Default to `🌐` if unknown.

### 3.5 Course Authorizations (admin-locked)

Section header (`.sph` with inline `flexDirection: row, alignItems: center, gap: 6`):

- Left part: `🎓 Authorizations` — standard sph (12 / 700 / uppercase / `Colors.tx2`, letterSpacing 0.84).
- Right part: `· 🔒 Locked` — **9.5 px / 600 / `Colors.tx3`**, no uppercase, letterSpacing 0. The bullet `·` is rendered as a separate Text node.

Card body (standard `.card`):

- Label: `Authorized to teach` — **11 / 600 / uppercase / `Colors.tx3`**, letterSpacing 0.55, marginBottom 10.
- For each course type in `profile.authorizations` (deviation from prototype, which hardcodes all 5):
  - Row: `flexDirection: row, alignItems: center, gap: 11`, `padding: 9 / 0`, 1 px `Colors.bd` bottom border (on every row; prototype has it on every row in this card).
  - Icon tile — **34 × 34**, radius **9**, `Colors.fol` bg, fontSize **17** (for the course-type emoji), `flexShrink: 0`.
  - Middle (flex 1):
    - Label (13 / 700 / `Colors.tx`).
    - Description (11 / `Colors.tx3`, marginTop 1) — from a static `AUTH_DESCRIPTIONS` map (e.g., `10-Day Course → "Standard Vipassana — core authorization"`, `Satipatthana Sutta → "Advanced — post 10-day retreat"`).
  - Right: **20 × 20** circle (radius 50%, i.e. 10 px), `Colors.fo` bg, centred ✓ icon at **12 px** white. `flexShrink: 0`.

### 3.6 Preferred Centers

Section header (`.sph`): `📍 Preferred Centers`.

Card body (standard `.card`):

- Label: `Will travel to (in order)` — **11 / 600 / uppercase / `Colors.tx3`**, letterSpacing 0.55, marginBottom 10.
- For each region in `profile.preferredRegions[0..2]`:
  - Row: `flexDirection: row, alignItems: flex-start, gap: 11`, `padding: 11 / 0`, 1 px `Colors.bd` bottom border.
  - **28 × 28** rank tile (radius **8**, centred). Rank number **12 / 800 / white**. Colour by rank: 1 → `Colors.fo`, 2 → `Colors.sf`, 3 → `Colors.bl`.
  - Middle (flex 1):
    - Region label (with flag) — **13.5 / 700 / `Colors.tx`**. E.g., `Kathmandu Valley 🇳🇵`.
    - Centres list (12 / `Colors.tx2`, marginTop 1) — derived from `centers.json` by filtering `region === preferredRegion`, names joined with ` · `. E.g., `Dharma Shringa · Dhamma Adhara · Dhamma Nibha`.
    - Note (11 / `Colors.tx3`, marginTop 2, `fontStyle: italic`). From a static `REGION_NOTES` map: rank-1 → "Home region · Nepali speaker", rank-2 → "Second priority region", rank-3 → "Eastern & Southern Nepal", etc. Override if a different region is at that rank.

### 3.7 Recent Teaching

Section header (`.sph`): `📖 Recent Teaching`.

Card body (standard `.card`):

- For each entry in `profile.teachingHistory.slice(0, 3)`:
  - Row: `flexDirection: row, alignItems: center, gap: 11`, `padding: 9 / 0`, 1 px `Colors.bd` bottom border on all but the last entry (`borderBottomWidth: i < arr.length - 1 ? 1 : 0`).
  - Tile — **34 × 34**, radius **9**, `Colors.sfl` bg, fontSize **16** (renders the country flag emoji at this size), `flexShrink: 0`.
  - Middle (flex 1):
    - Centre name (13 / 700 / `Colors.tx`).
    - `{type} · {students} students` (11 / `Colors.tx2`, marginTop 1).
  - Right: date string (11 / `Colors.tx3`, `textAlign: right`, `flexShrink: 0`).
- Footer link (marginTop 10, `textAlign: center`): `View all {totalCourses} courses →` — **13 / 600 / `Colors.sf`**. v1 = inert (no navigation target yet); v2 will link to a full history screen.

### 3.8 Personal Note (orange-tint card)

Section header (`.sph`): `💬 Personal Note`.

Card (standard `.card` + overrides): `Colors.sfl` bg, 1 px `Colors.sfm` border, otherwise inheriting `radius 16, padding 15, margin 0 / 18 / 11, Shadows.card`.

- Italic body — `profile.personalNote` wrapped in quotes (prototype's hardcoded body is quoted). **13 px / `Colors.tx`**, `fontStyle: italic`, `lineHeight: 21` (= 13 × 1.6).
- Last-updated line — `Last updated: {date}` — **11 px / `Colors.tx3`**, marginTop 8.
- Date source: if a `personalNoteUpdated` field exists on profile use it, otherwise fall back to `profile.updatedAt` (formatted as `MMM YYYY`). If neither, hide the line.

### 3.9 Sign Out CTA

Wrapper: `padding: 18 / 18 / 6` (top, horizontal, bottom — matches prototype `padding:"18px 18px 6px"`).

Button (`.btn.ou` style + inline overrides):

- Base `.btn.ou`: `background: transparent, borderWidth: 2, borderColor: Colors.bd2 (default), color: Colors.tx (default), padding: 13 / 22, fontSize: 14, width: 100%`.
- Overrides for this screen: `borderColor: '#F5C0BB'`, `color: Colors.ur`.
- Tap → `useConfirm` "Sign out?" (we keep the confirm even though the prototype doesn't — destructive action, costly to recover from) → `authStore.signOut()` → router pops to `/(auth)/login`.

Bottom of scroll: **24 px spacer** (matches `<div style={{height:24}}/>`) plus `insets.bottom`.

---

## 4. Behaviour

- **Lang toggle**: tapping the `🌐` pill flips `settingsStore.language` between `en` and `ne` and re-mounts the navigator (existing pattern in `_layout`).
- **Edit pill**: navigates to `/(teacher)/profile/edit` (spec 10).
- **Availability tile tap**: cycles state for that month, immediately writes `availableMonths` + `festivalMonths` back to `profileStore.setProfile`. The DB upsert is the same as Edit Profile — no separate "save" step here. Press feedback via `<Pressable>` with `scale 0.94` on `pressed`.
- **Festival quick-chip tap**: replaces the month's state with `festival`. Idempotent if already festival.
- **Reset chip tap**: clears every month to unavailable. **No confirm** (matches prototype's one-tap behaviour). If destructive feel is a concern later, gate this in spec 10 instead.
- **Sign Out**: confirm dialog ("Sign out and return to login?") → `authStore.signOut()` → router pops to `/(auth)/login`.
- **All other zones are read-only.** Editing happens in spec 10.

---

## 5. Data model

No schema additions. All fields already on `TeacherProfile`:

| Zone | Fields used |
|---|---|
| Hero | `name`, `region`, `flag`, `authorizedSince`, `gender`, `totalCourses`, `centersServed`, `coursesThisYear` |
| Eligibility | `teachingHistory[0].date` |
| Availability | `availableMonths`, `festivalMonths` (write-back) |
| Languages | `languages` (record of label → level) |
| Authorizations | `authorizations` (string[]) |
| Preferred Centers | `preferredRegions`, joined with `centers.json` |
| Recent Teaching | `teachingHistory[0..2]`, `totalCourses` |
| Personal Note | `personalNote`, (optional `personalNoteUpdated`) |

`MeditationFigure` SVG component to add to `src/components/ui/HeroDecorations.tsx`, ported from the prototype's React SVG markup.

---

## 6. What's changing vs current implementation

The current `app/(teacher)/profile/index.tsx` is ~428 lines and uses generic `SectionHeader`, abstracted card components, a `LanguageRow`/`CenterRow`/`AuthorizationRow` pattern, and a separate `AvailabilityGrid` component. None of these match the prototype's literal sizes. The rebuild:

- Drops every generic abstraction and inlines the literal `font-size` / `padding` / `border-radius` values from the prototype.
- Replaces the current hero (which uses `HeroSection` with a sand gradient) with the prototype's `linear-gradient(160deg, #6B3600, Colors.sf)` and the meditation-figure + lotus decorations.
- Adds the 4-stat tile row missing from current.
- Adds the festival quick-chip block missing from current (current screen has the cycle tap but not the quick-block chips).
- Adds the "Next eligible from: …" date line on the eligibility card.
- Adds the "Last updated: …" line on the personal note.
- Routes the avatar + meta hierarchy to match the prototype exactly.

---

## 7. Acceptance checklist

- [ ] Hero gradient + meditation figure + lotus watermark + avatar + name + meta + stats tiles all match prototype values
- [ ] Eligibility card lights up green with correct "Next eligible" date computed from `teachingHistory[0]`
- [ ] Month grid renders 6×2 with the right colour per state, ✓/🎑/✗ glyphs
- [ ] Tap-cycling a month persists to DB and the `{N} months available` count updates immediately
- [ ] Buddha / Dashain / Tihar chips set the right months to festival
- [ ] Reset chip wipes via confirm dialog
- [ ] Languages list shows ★ Primary / Secondary chips with correct colours
- [ ] Authorizations list shows ✓ green circle per authorized course type
- [ ] Preferred centres ranks 1/2/3 with regional colour key
- [ ] Recent teaching shows top 3 + "View all {N} courses →" footer
- [ ] Personal note in orange-tint card with last-updated line
- [ ] Sign Out red-outline button at bottom triggers confirm + signOut + login redirect
- [ ] All copy through i18n (en + ne, Acharya-correct Nepali)
- [ ] Typecheck clean, tests pass
