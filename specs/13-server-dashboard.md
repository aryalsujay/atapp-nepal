---
id: 13-server-dashboard
title: Server Dashboard (Home)
route: /(server)/home
prototype: VipassanaTeacherApp/app.html:2529–2616
status: draft
related: [12-server-onboarding, 14-server-opportunities, 17-server-applications, 18-server-application-detail, 20-server-notifications]
---

# 13 · Server Dashboard

The first screen a Dhamma Server lands on after the onboarding wizard. It is
the equivalent of the Teacher Home (spec 04) and follows the same
visual rhythm — hero with role gradient + identity + quick-stats, then
stacked content cards. Server theme is **earthy tan / saffron-brown** (the
prototype's `#5A3800 → #9B6B14 → #C8900A` gradient), so this screen sits
between the teacher saffron (`sf`) and the admin blue (`bl`).

---

## 1. Identity

| Property         | Value                                                                |
|------------------|----------------------------------------------------------------------|
| **Route**        | `/(server)/home` (default Tabs initial route in `(server)/_layout`)  |
| **Component**    | `app/(server)/home.tsx` default export `ServerHome`                  |
| **Prototype**    | `ServerDash` function, app.html lines 2529–2616                      |
| **Tab icon**     | `HomeIcon` (`Colors.sv` accent, `Colors.svl` active-bg)              |
| **Status bar**   | `barStyle="light-content"` (hero is dark gradient)                   |
| **Safe area**    | Top inset added to hero `paddingTop`; bottom inset handled by tab bar|

## 2. Purpose

After eligibility is confirmed in spec 12, the Server is dropped here to:

1. See **who they are in the system** (name, role, "Old Student" badge, serving-since year, lifetime stats)
2. See their **next confirmed service commitment** (one card → tap → application detail spec 18)
3. Discover **open opportunities** (three sample course cards → tap → course detail spec 15; "See all" → spec 14)
4. Reassure that they are **still eligible** to serve (green status block at the bottom)

The screen is read-only — no forms, no filtering. All interaction is navigation.

## 3. Layout overview (top → bottom)

```
┌─────────────────────────────────────────────────────────┐
│  Hero (server gradient #5A3800→#9B6B14→#C8900A)         │
│   ┌──────────────────────────────────┬────────────────┐ │
│   │ "Dhamma Server"                  │  🌿  badge     │ │
│   │ Priya Thapa 🙏                   │  (54×54 r18)   │ │
│   │ Old Student · Serving since 2018 │  🌐 EN/नेपाली  │ │
│   └──────────────────────────────────┴────────────────┘ │
│   ┌──── Stats row (3 chips, dark glass) ────────────┐   │
│   │  🍳 12    🏛 8        📅 1                       │   │
│   │  Served   Centers     Upcoming                   │   │
│   └──────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│  🙏 My Upcoming Service                  (section ph)   │
│  ┌─ Card · 4px left-border #9B6B14 ───────────────────┐ │
│  │ 🍳  Dhamma Shringa            ✓ Confirmed (pill)   │ │
│  │     Kitchen · Full course (Jul 7–18)                │ │
│  │     Budhanilkantha, Kathmandu 🇳🇵                  │ │
│  └────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  🌟 Open Opportunities          See All →               │
│  N open slots across M courses (italic muted)           │
│  ┌─ Card x3 · 4px left-border #9B6B14 ────────────────┐ │
│  │ Centre name              N slots left (orange/red)│ │
│  │ city                     M·M+F·F                  │ │
│  │ 📅 dates · type                                    │ │
│  │ [progress bar, filled/total] [area chips x≤4 +N]   │ │
│  └────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│  ┌─ Eligible status (forest bg) ──────────────────────┐ │
│  │ ✅ Eligible to Serve                                │ │
│  │ 10-day completed · Sitting regularly · Last: Mar  │ │
│  └────────────────────────────────────────────────────┘ │
│  (20px spacer)                                          │
└─────────────────────────────────────────────────────────┘
                ┌─ Bottom Tab Bar (5 icons) ─┐
```

## 4. Hero

Single `<LinearGradient>` block with `LotusHero` + `MountainSilhouette`
SVG decoration overlays (same components used on every server-themed
screen).

### 4.1 Gradient
```ts
colors = ['#5A3800', '#9B6B14', '#C8900A']
start  = { x: 0, y: 0 }
end    = { x: 0.671, y: 0.97 }   // 160° equivalent
```
Note: this gradient is **lighter** than the onboarding result hero
(`#5A3800 → #9B6B14` — 2 stops); dashboard adds the third lighter stop
`#C8900A`.

### 4.2 Hero padding
- `paddingHorizontal: 18` (prototype) — narrower than 22px onboarding hero
- `paddingTop: Math.max(56, insets.top + 12)` — prototype literal `56px` baked in for the iOS notch; we floor with safe-area
- `paddingBottom: 24`
- `overflow: 'hidden'` (for SVG decoration)
- `position: 'relative'`

### 4.3 Identity row
A `flexDirection: 'row'`, `justifyContent: 'space-between'`,
`alignItems: 'center'`, `position: 'relative'` wrapper.

Left column (`flex: 1`-ish, just lets text wrap):
| Element            | Style                                                                                      | Text                          |
|--------------------|--------------------------------------------------------------------------------------------|-------------------------------|
| Kicker             | fontSize 13, color `rgba(255,255,255,.72)`, fontFamily Noto-Devanagari when `lang==='ne'`  | `t('server.home.dhamma_server')` |
| Name               | fontSize 22, fontWeight 800, color white                                                   | `"Priya Thapa 🙏"`            |
| Sub                | fontSize 12.5, color `rgba(255,255,255,.7)`                                                | `t('server.home.old_student') + ' · Serving since 2018'` |

Right column (`flexDirection: 'column'`, `alignItems: 'flex-end'`, `gap: 8`):

- **Badge** — `width 54`, `height 54`, `borderRadius 18`, `background rgba(255,255,255,.18)`, centered glyph `🌿` fontSize 26. If `unread > 0`, absolute red circle (top: -4, right: -4, minWidth 18, height 18, padding 0 4px, background `Colors.ur`, borderRadius 9, fontSize 10, fontWeight 800, color white, `2px solid #9B6B14` border).
- **Language toggle** — pill: background `rgba(255,255,255,.18)`, color white, padding `4px 11px`, borderRadius 20, fontSize 10.5, fontWeight 700, border `1px solid rgba(255,255,255,.3)`. Text: `🌐 ${t('lang_toggle')}` (existing key — EN shows "नेपाली", NE shows "English"). Prototype has `backdropFilter: blur(10px)` which RN cannot do — omit.

### 4.4 Stats row
`marginTop: 18`, `flexDirection: 'row'`, `gap: 8`, `position: 'relative'`.

Three identical chips (`flex: 1`), each:
- background `rgba(0,0,0,.22)` (slightly darker than badge — translucent black, not white)
- borderRadius 13
- padding `10px 8px`
- textAlign center
- border `1px solid rgba(255,255,255,.15)`
- prototype `backdropFilter blur(10px)` — omit (RN)

Chip contents (3 stacked Text lines):
1. icon — fontSize 16, marginBottom 2, lineHeight 1
2. number — fontSize 18, fontWeight 800, color white, lineHeight 1
3. label — fontSize 9.5, color `rgba(255,255,255,.78)`, marginTop 3, **uppercase off** (prototype renders title-case key value)

Hard-coded values (matches prototype):
| icon | n  | i18n key                     | EN label         | NE label         |
|------|----|------------------------------|------------------|------------------|
| 🍳   | 12 | `server.home.stat_served`    | Courses Served   | सेवा गरेको       |
| 🏛   | 8  | `server.home.stat_centers`   | Nepal Centers    | नेपाल केन्द्रहरू |
| 📅   | 1  | `server.home.stat_upcoming`  | Upcoming         | आगामी            |

> These are demo values for the prototype — same approach we used on
> teacher home spec 04. We do **not** wire them to live counts yet.

## 5. Section header utility (`sph`)

Prototype CSS class (`app.html:509`):
```css
.sph {
  font-size: 12px;
  font-weight: 700;
  color: var(--tx2);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin: 18px 18px 9px;
}
```

In RN: `letterSpacing: 0.84` (12px × 0.07), uppercase via `textTransform: 'uppercase'`, color `Colors.tx2`. **Note: the emoji prefix (`🙏`, `🌟`) survives uppercase transform unchanged — only the latin/Devanagari text gets uppercased; Devanagari has no case so it renders normally.**

Reused for "My Upcoming Service" and "Open Opportunities". We will inline
the style rather than introducing a token — already done in teacher specs.

When the second `sph` lives inside the Open-Opps header row (line 2577 in
prototype), it gets a `margin: 0` override so the row's own padding takes
over.

## 6. Upcoming Service section

Section header: `🙏 My Upcoming Service` (left-aligned `sph`, uppercased — final visible text: `🙏 MY UPCOMING SERVICE`).

### 6.1 Card
Standard `.card` (prototype `app.html:483`):
```css
.card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 15px;
  box-shadow: 0 2px 14px rgba(28,20,8,0.09);
  margin: 0 18px 11px;
}
```

In RN: `backgroundColor: Colors.white`, `borderRadius: 16`, `padding: 15`,
`marginHorizontal: 18`, `marginBottom: 11`, shadow via:
```ts
shadowColor: Colors.shadowBase,
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.09,
shadowRadius: 14,
elevation: 3,
```

Adds **`borderLeftWidth: 4`, `borderLeftColor: '#9B6B14'`** for server accent.

Pressable (`.card.c-ptr`) → `TouchableOpacity activeOpacity={0.85}`. Prototype's `:active { transform: scale(.975) }` we skip — RN's opacity fade is the convention. **Do not** add `Pressable` scale animation unless spec'd.

Tap → navigate to spec 18 (application detail) for `serverApplications[0]`. In our app we use Routes constants → `Routes.serverApplicationDetail(id)`.

### 6.2 Card contents
`flexDirection: 'row'`, `gap: 11`, `alignItems: 'center'`.

Icon tile (`width: 46`, `height: 46`, `borderRadius: 13`, `background: '#FBF0E0'` (= `Colors.svl`), centered glyph fontSize 22, `flexShrink: 0`): emoji from the first area of the application (e.g. `🍳` for kitchen). **For v1 we hard-code `🍳`** to match the prototype, since serverApplications[0] has `areas: ['kitchen','dining']`.

Centre column (`flex: 1`):
- Line 1 — fontSize 14, fontWeight 700: centre name `"Dhamma Shringa"`
- Line 2 — fontSize 12, color `Colors.tx2`: `"Kitchen · Full course (Jul 7–18)"` — `Full course` = `t('server.home.full_course_lbl')`, dates from data
- Line 3 — fontSize 11, color `Colors.tx3`, marginTop 1: `"Budhanilkantha, Kathmandu 🇳🇵"`

Right pill — reuses prototype `.spill.appr` (`app.html:522,524`):
```css
.spill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;     /* overridden to 10 at usage site */
  font-weight: 700;
  padding: 5px 11px;
  border-radius: 20px;
}
.spill.appr { background: var(--fol); color: var(--fo) }
```

In RN: `backgroundColor: Colors.fol`, `color: Colors.fo`, `paddingHorizontal: 11`, `paddingVertical: 5`, `borderRadius: 20`, **`fontSize: 10`** (inline override at usage), `fontWeight: 700`. Text = `t('server.home.confirmed')` (literal `"✓ Confirmed"` / `"✓ पुष्टि"` — checkmark is in the string, **not a separate icon**, so the base class `gap: 5` has no effect here).

## 7. Open Opportunities section

### 7.1 Header row
`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, `padding: '4px 18px 7px'`.

Left: `sph` text `🌟 Open Opportunities` (margin 0 to nullify the `sph` padding inside the row).

Right: tappable "See all →" — fontSize 13, color `#9B6B14`, fontWeight 600. Tap → `Routes.serverOpportunities`. Reuses existing `home.see_all` i18n key (no new key needed). Hit-slop 8 on all sides for tap area.

### 7.2 Sub-line
fontSize 12, color `Colors.tx3`, fontStyle italic, padding `0 18 9`. Format:
```
{openSlots} {t('server.home.open_slots')} {totalCourses} {t('server.home.courses')}
```
Where `openSlots = sum(c.total - c.filled)` over `serverCourses` and `totalCourses = serverCourses.length`. EN renders as: `"31 open slots across 5 courses"`. NE renders as: `"३१ खुला सिटहरू ५ शिविरहरू"` (Devanagari digits — reuse `digit(n, lang)` from spec 12).

### 7.3 Course cards (slice 0–3)
Take `serverCourses.slice(0, 3)`. Each card is the standard `.card`
with `borderLeft: 4px solid #9B6B14`, marginHorizontal 18.

Tap → `Routes.serverOpportunityDetail(c.id)`.

#### 7.3.1 Top row
`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`, marginBottom 7.

Left (`flex: 1`, paddingRight 8):
- Line 1 — fontSize 14, fontWeight 700: `c.center`
- Line 2 — fontSize 12, color `Colors.tx2`: `c.city`
- Line 3 — fontSize 11, color `Colors.tx3`, marginTop 1: `📅 {c.dates} · {c.type}` (e.g. `📅 Jul 7–18, 2026 · 10-Day`)

Right (`textAlign: 'right'`):
- Line 1 — fontSize 13, fontWeight 800, color `open <= 3 ? Colors.ur : '#9B6B14'`: `"{open} slots left"` — the literal word `slots left` is i18n: `t('server.home.slots_left', { n: open })`
- Line 2 — fontSize 10, color `Colors.tx3`, marginTop 1: `"{c.mServers}M + {c.fServers}F"`

#### 7.3.2 Progress row
`flexDirection: 'row'`, `alignItems: 'center'`, `gap: 8`, `marginBottom: 7`.

- Track — `flex: 1`, height 5, background `Colors.cr3` (`#E5DDD0`), borderRadius 3, `overflow: 'hidden'`.
- Fill — `width: pct + '%'`, height 100%, borderRadius 3, color:
  - `pct > 80` → `Colors.ur`
  - `pct > 50` → `#9B6B14`
  - else      → `Colors.fo`

Where `pct = Math.round((c.filled / c.total) * 100)`.

- Right caption — fontSize 10, color `Colors.tx3`, `flexShrink: 0`: `"{filled}/{total} filled"` — `filled` i18n: `t('server.home.filled', { f, t: total })`.

#### 7.3.3 Area chips row
`flexDirection: 'row'`, `gap: 4`, `flexWrap: 'wrap'`.

For each of `c.areas.slice(0, 4)`, look up in `SERVICE_AREAS`:
- fontSize 10, padding `2 7`, borderRadius 20, background `#FBF0E0`, color `#9B6B14`, fontWeight 600
- Content: `${sa.icon} ${lang === 'ne' ? sa.nepali : sa.label}`

If `c.areas.length > 4`, append a `+N more` chip — fontSize 10, color `Colors.tx3` (no background pill, just text).

## 8. Eligible status card

Bottom card, no left-border. Standard card (padding 15, borderRadius 16, marginHorizontal 18, marginBottom 11) **with shadow kept** — the prototype only overrides `background` and `border`, not the base shadow. Overrides:
- backgroundColor `Colors.fol` (`#E8F2EA`)
- border `1px solid Colors.fom` (`#C8DFCB`)

Contents:
- Line 1 — fontSize 13, fontWeight 700, color `Colors.fo`, marginBottom 4: `"✅ {t('server.home.eligible')}"`
- Line 2 — fontSize 12, color `Colors.tx2`: `"{t('server.home.eligible_sub')} · Last served: Mar 2026"` — the `Last served` half is hard-coded (prototype demo)

## 9. Footer spacer
`<View style={{ height: 20 }} />` — matches prototype's trailing `<div style={{height:20}}/>`.

### 9.1 Scroll container

The whole page is one vertical `ScrollView`:

- `contentContainerStyle.paddingBottom` = `insets.bottom + 8` so the last card / spacer clears the tab bar's safe-area inset.
- `showsVerticalScrollIndicator: false`.
- Background of the screen = `Colors.cr` (prototype `.screen { background: var(--cr) }`, i.e. `#F8F3EB`) — set via `style={{ flex: 1, backgroundColor: Colors.cr }}` on the outer View.
- The hero is **inside** the ScrollView so it scrolls away — matches prototype where the hero is just a stacked block.

## 10. Data sources

| Section          | Source                                                                |
|------------------|-----------------------------------------------------------------------|
| Hero name        | `useProfileStore.profile.name` (fallback `'Priya Thapa'` if unset)    |
| Hero "🙏"        | Hard-coded literal — matches prototype                                |
| Hero kicker      | i18n `server.home.dhamma_server`                                      |
| Hero serving-since | Hard-coded `"Serving since 2018"` — server profile (spec 19) will own this later |
| Stats row        | Hard-coded `[12, 8, 1]` literals — demo data                          |
| Upcoming card    | `serverApplications[0]` from `src/data/server-applications.json`      |
| Open Opportunities | `serverCourses` from `src/data/server-courses.json` (slice 0-3)     |
| openSlots        | reduce `serverCourses` summing `(c.total - c.filled)`                 |
| SERVICE_AREAS    | `src/data/service-areas.ts` (existing constant)                       |
| unread badge     | `useNotificationsStore.notifications.filter(unread).length` (or 0)    |
| Eligible card    | Pure i18n + literal `"Last served: Mar 2026"` (demo)                  |

**New data files required:**
- `src/data/server-courses.json` — 5 course records mirroring the prototype
- `src/data/server-applications.json` — 3 application records mirroring the prototype

Both load through plain JSON imports (same pattern as existing teacher data).

## 11. Behaviour

| Trigger                          | Action                                                                 |
|----------------------------------|------------------------------------------------------------------------|
| Tap upcoming-service card        | `router.push(Routes.serverApplicationDetail(serverApplications[0].id))`|
| Tap language pill                | `useSettingsStore.setLanguage(lang === 'en' ? 'ne' : 'en')`            |
| Tap "See All" in opps header     | `router.push(Routes.serverOpportunities)`                              |
| Tap opportunity card             | `router.push(Routes.serverOpportunityDetail(c.id))`                         |
| Tap bell badge / 🌿              | **none** in this spec — notifications open via the bottom tab. The badge is decorative on the hero. |

Pull-to-refresh: **not in prototype**, skip.

## 12. i18n

All keys live under `server.home.*`. Add to `en.json` + `ne.json`:

| Key                       | EN                                       | NE (Acharya-correct)                  |
|---------------------------|------------------------------------------|---------------------------------------|
| `dhamma_server`           | Dhamma Server                            | धम्म सेवक                             |
| `old_student`             | Old Student                              | पुरानो विद्यार्थी                     |
| `stat_served`             | Courses Served                           | सेवा गरेको                            |
| `stat_centers`            | Nepal Centers                            | नेपाल केन्द्रहरू                      |
| `stat_upcoming`           | Upcoming                                 | आगामी                                 |
| `upcoming_service`        | My Upcoming Service                      | मेरो आगामी सेवा                       |
| `open_opps`               | Open Opportunities                       | खुला अवसरहरू                          |
| _(reuse `home.see_all`)_  | See all →                                | सबै हेर्नुहोस् →                      |
| `open_slots`              | open slots across                        | खुला सिटहरू                           |
| `courses`                 | courses                                  | शिविरहरू                              |
| `confirmed`               | ✓ Confirmed                              | ✓ पुष्टि                              |
| `slots_left`              | `{{n}} slots left`                       | `{{n}} सिटहरू बाँकी`                  |
| `filled`                  | `{{f}}/{{t}} filled`                     | `{{f}}/{{t}} भरिएको`                  |
| `full_course_lbl`         | Full course                              | पूरा शिविर                            |
| `partial_lbl`             | Partial                                  | आंशिक                                 |
| `eligible`                | Eligible to Serve                        | सेवा गर्न योग्य                       |
| `eligible_sub`            | Completed 10-day course · Sitting regularly | १०-दिने शिविर पूरा · नियमित साधना  |
| `last_served`             | Last served                              | अन्तिम सेवा                           |

Existing reusable key: `lang_toggle` (already shipped — toggles between "नेपाली" / "English").

## 13. Things being omitted vs prototype

| Prototype style                       | RN limitation / decision                                |
|---------------------------------------|---------------------------------------------------------|
| `backdropFilter: blur(10px)`          | Not supported by RN — use the existing `rgba(0,0,0,.22)` opacity for visibility |
| `cursor: 'pointer'`                   | RN uses `TouchableOpacity activeOpacity={0.85}`         |
| Hover styles on language pill         | none — no hover in RN                                   |
| `.card.c-ptr:active { transform: scale(.975) }` | Skip — RN convention is opacity fade only      |
| Devanagari font on the kicker (always set in prototype) | We only apply Devanagari fontFamily when `lang === 'ne'` — fonts are registered globally |
| `text-transform: uppercase` on `sph`  | Honoured via `textTransform: 'uppercase'`; safe — Devanagari has no case and renders unchanged |

### 13.1 Other small details to preserve

- The middle-dot separator in `"Old Student · Serving since 2018"` is a regular `·` (U+00B7), **not** a bullet `•`. Same in `"… · Last served: Mar 2026"` and `"📅 Jul 7–18, 2026 · 10-Day"`.
- Date ranges use the **en-dash** `–` (U+2013), not a hyphen-minus.
- `🇳🇵` is an emoji flag sequence; needs no special handling.
- The card's right pill in the upcoming-service row uses `flexShrink: 0` implicitly because it's `display: inline-flex` in CSS — in RN add `flexShrink: 0` so it never wraps mid-text under a long centre name.
- Stats-chip label fontSize `9.5` is intentional (sub-10). RN handles non-integer sizes fine but PixelRatio may round on Android; do not promote to 10.
- The hero badge's unread dot has a `2px solid #9B6B14` border that bleeds onto the badge — keep that border colour exactly to match the gradient mid-stop.

## 14. Acceptance checklist

### Hero
- [ ] Gradient stops `#5A3800 → #9B6B14 → #C8900A`, 160° angle
- [ ] Top inset respected (`max(56, insets.top + 12)`)
- [ ] LotusHero `color="white" opacity={0.08} size={210} right={-30} bottom={-30}`
- [ ] MountainSilhouette decoration above hero content
- [ ] Kicker uses Devanagari font when `lang === 'ne'`
- [ ] Name `Priya Thapa 🙏` size 22 / weight 800
- [ ] Sub uses `Serving since 2018` literal
- [ ] Badge 54×54, rounded 18, glyph 🌿, unread red dot when notifications exist
- [ ] Language pill — text from `lang_toggle`, prefixed with `🌐 `
- [ ] Stats row — 3 chips, `flex: 1`, gap 8, `rgba(0,0,0,.22)` bg, 1px white-15 border, content sizes 16/18/9.5

### Upcoming Service
- [ ] `🙏 My Upcoming Service` header (sph)
- [ ] Card with 4px `#9B6B14` left border
- [ ] Icon tile 46×46 r13 bg `#FBF0E0` glyph 🍳 fontSize 22
- [ ] Title 14/700, sub-1 12/`tx2`, sub-2 11/`tx3` mt 1
- [ ] Approved pill `✓ Confirmed` literal — `fol` bg, `fo` text, fontSize 10
- [ ] Tap navigates to spec 18 application detail

### Open Opportunities
- [ ] Header row with `🌟 Open Opportunities` left + `See All →` right (color `#9B6B14`)
- [ ] Sub-line: `{n} open slots across {m} courses` italic `tx3`, Devanagari digits when NE
- [ ] Exactly 3 course cards (slice 0–3)
- [ ] Each card 4px `#9B6B14` left border, tap → spec 15 detail
- [ ] Slots-left text turns urgent-red when `open <= 3`
- [ ] Progress bar 5px track, fill thresholds 80% → ur, 50% → `#9B6B14`, else `fo`
- [ ] Area chips: max 4, then `+N more` text (no pill)
- [ ] Chip label uses Nepali when language is NE

### Eligible status
- [ ] Forest-tinted card (`fol` bg, `fom` border, **shadow kept** — base `.card` shadow is not overridden in prototype)
- [ ] `✅ Eligible to Serve` title + `… · Last served: Mar 2026` body
- [ ] padding 15, borderRadius 16, marginHorizontal 18, marginBottom 11 (base `.card` values)

### Cross-cutting
- [ ] All literal numbers + colors match the prototype tables above
- [ ] No console warnings about font / image
- [ ] Tab bar visible on this screen (no `tabBarStyle: display: 'none'`)
- [ ] Spec 12 still routes here on completion (`Routes.serverHome`)

---

## Implementation notes (post-build corrections)

The prototype is **mixed bilingual by design**: many small UI labels stay in English even in Nepali mode. Aligning with the prototype, the following keys were **removed** from `server.home.*` and rendered as English literals in both languages:

- `slots_left` → hardcoded `"{n} slots left"`
- `filled` → hardcoded `"{filled}/{total} filled"`
- `serving_since` → hardcoded `"Serving since 2018"`
- `last_served` → hardcoded `"Last served: Mar 2026"`

Other prototype-faithful decisions:
- Area chips on opportunity cards always render `sa.label` (English), never `sa.nepali`.
- Upcoming-service card area name ("Kitchen") stays English even in NE.
- All numeric digits stay Latin in NE mode (no Devanagari substitution). Prototype renders raw `Number(n)`.
