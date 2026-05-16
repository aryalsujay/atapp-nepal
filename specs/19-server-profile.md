---
id: 19-server-profile
title: Server Profile
route: /(server)/profile
prototype: VipassanaTeacherApp/app.html:2864–2970
status: draft
related: [13-server-dashboard, 16-server-apply, 17-server-applications]
---

# 19 · Server Profile

The Server's "Profile" tab — identity, eligibility, expertise, yearly
availability, preferred centers, service history. Two outline action
buttons at the bottom: Edit Profile / Sign Out. Read-only screen in
v1 (no edit interactions live — the Edit button is a placeholder).

This is the **read-only** equivalent of spec 09 (teacher profile), with
a different theme (server saffron) and section set.

---

## 1. Identity

| Property        | Value                                                       |
|------------------|-------------------------------------------------------------|
| **Route**        | `/(server)/profile` (tab 5 — `PersonIcon`)                 |
| **Component**    | `app/(server)/profile/index.tsx` default `ServerProfileScreen` |
| **Prototype**    | `ServerProfile` function, app.html 2864–2970                |
| **Status bar**   | `barStyle="light-content"` (dark hero)                      |
| **Safe area**    | Top inset added to hero `paddingTop`                        |

## 2. Layout overview (top → bottom)

```
┌──────────────────────────────────────────────────────────────────┐
│  Hero (server gradient, MeditationFigure + LotusHero)            │
│    [🌿 avatar 66]   Priya Thapa                  [🌐 EN/नेपाली] │
│                     Dhamma Server · Nepal 🇳🇵                    │
│                     Old Student · 2015 · 12 courses              │
│                                                                  │
│    [🍳 12 Courses Served] [🏛 8 Nepal Centers] [✅ Eligible]    │
├──────────────────────────────────────────────────────────────────┤
│  Eligible status banner (fol bg + 1.5px fom)                     │
│    [✅ 42×42 fo tile]   Eligible to Serve  (13.5/800/fo)         │
│                          Completed 10-day course · …             │
│                          Last served: Mar 2026 ✓                 │
├──────────────────────────────────────────────────────────────────┤
│  🌟 AREAS OF EXPERTISE                                            │
│  ┌─ Card ─────────────────────────────────────────────────┐      │
│  │ PREFERRED SERVICE AREAS  (small tx3 uppercase)         │      │
│  │ [🍳 tile] Kitchen   Cooking & cleaning…          [★]   │      │
│  │ [🍽 tile] Dining Hall Serving food…                    │      │
│  │ ... (one row per SERVICE_AREA, ★ on preferred ones)    │      │
│  └────────────────────────────────────────────────────────┘      │
├──────────────────────────────────────────────────────────────────┤
│  📅 AVAILABILITY 2026                                             │
│  ┌─ Card ─────────────────────────────────────────────────┐      │
│  │  Jan  Feb  Mar  Apr  May  Jun   (6 columns × 2 rows)   │      │
│  │   ✗   ✗   ✓    ✓   ✓   ✗                                │      │
│  │  Jul  Aug  Sep  Oct  Nov  Dec                           │      │
│  │   ✓   ✓   ✗    ✓   ✓   ✗                                │      │
│  │  🎑 Festival blocks: Buddha Jayanti (May) · …          │      │
│  └────────────────────────────────────────────────────────┘      │
├──────────────────────────────────────────────────────────────────┤
│  📍 PREFERRED CENTERS                                             │
│  ┌─ Card · 3 rows ranked 1/2/3 ──────────────────────────┐       │
│  │ [1] Dhamma Shringa  Budhanilkantha, Kathmandu 🇳🇵       │       │
│  │ [2] Dhamma Pokhara  Pokhara 🇳🇵                          │       │
│  │ [3] Dhamma Adhara   Swayambhu, Kathmandu 🇳🇵            │       │
│  └────────────────────────────────────────────────────────┘      │
├──────────────────────────────────────────────────────────────────┤
│  📖 SERVICE HISTORY                                               │
│  ┌─ Card · 3 history entries + footer link ──────────────┐       │
│  │ [🍳] Dhamma Shringa     Kitchen · Full (11 days)   Mar 2026 │ │
│  │ [🔔] Dhamma Pokhara     Dhamma Hall · Partial (7)  Nov 2025 │ │
│  │ [🌿] Dhamma Adhara      Compound · Full (11 days)  Jun 2025 │ │
│  │                                                                │ │
│  │              View all courses →   (centered link)             │ │
│  └────────────────────────────────────────────────────────────────┘
├──────────────────────────────────────────────────────────────────┤
│  [    Edit Profile & Availability    ]  (.btn.ou outline)        │
│  [             Sign Out               ]  (.btn.ou red tint)      │
│  (20px footer)                                                   │
└──────────────────────────────────────────────────────────────────┘
                  ┌─ Bottom Tab Bar (visible) ─┐
```

Tab bar is **visible** on this screen (default).

## 3. Hero

### 3.1 Container
```ts
backgroundColor: <LinearGradient ['#5A3800', '#9B6B14'], 160°>
paddingHorizontal: 18
paddingTop: Math.max(56, insets.top + 12)
paddingBottom: 24
position: relative
overflow: hidden
```

### 3.2 Decorations (rendered before identity row, behind it via z-order)
- `<MeditationFigure size={130} color="rgba(255,255,255,0.1)" />` — **unique to profile**, also on teacher profile spec 09. Pin to a sensible inset (component defaults are fine; do not override unless visual diff shows otherwise).
- `<LotusHero color="white" opacity={0.07} size={180} />` — note **opacity 0.07** (not 0.08 like other screens) and `size 180` with default positioning (no `right`/`bottom` props).

Order in JSX: MeditationFigure first, then LotusHero (so Lotus paints over it).

### 3.3 Identity row
`flexDirection: 'row'`, `alignItems: 'flex-start'`, `gap: 13`, `position: 'relative'`.

#### 3.3.1 Avatar tile
- `width: 66`, `height: 66`, `borderRadius: 22` (note: **22**, not 18 like dashboard's badge)
- `backgroundColor: rgba(255,255,255,0.22)` (more opaque than dashboard's 0.18)
- centered glyph `🌿` fontSize **30**
- `flexShrink: 0`

#### 3.3.2 Identity text column (`flex: 1`)
- Name — fontSize **20** (not 22 like apply / not 23 like detail), fontWeight 800, color white: `"Priya Thapa"` (hard-coded for v1; replaceable later)
- Sub 1 — fontSize **12.5**, color `rgba(255,255,255,0.75)`: `"{t('server.profile.dhamma_server')} · Nepal 🇳🇵"`
- Sub 2 — fontSize **11.5**, color `rgba(255,255,255,0.6)`: `"{t('server.profile.old_student')} · 2015 · 12 {courses_lbl}"`
  - `courses_lbl`: `"courses"` / `"शिविर"`

> Reuse the `server.home.dhamma_server` / `server.home.old_student` keys? They have identical EN/NE values. **Yes — reuse**. Add only the new `courses_lbl` key.

#### 3.3.3 Language pill (right)
Same as dashboard's lang pill:
- bg `rgba(255,255,255,0.18)`, color white, padding `4 11`, borderRadius 20
- fontSize **10.5**, fontWeight 700, border 1px `rgba(255,255,255,0.3)`
- `flexShrink: 0` (so it never wraps under the name)
- backdropFilter omitted (RN limitation)
- Text: `🌐 ${langToggleText}` where `langToggleText` reuses `server.home.lang_toggle_en` / `lang_toggle_ne`
- onPress → `setLanguage(lang === 'ne' ? 'en' : 'ne')`

### 3.4 Stats row
`flexDirection: 'row'`, `gap: 8`, `marginTop: **15**` (note: **15**, not 18 like dashboard), `position: 'relative'`.

Three chips (`flex: 1`):
| Property            | Value                                                            |
|---------------------|------------------------------------------------------------------|
| backgroundColor     | `rgba(0,0,0,0.22)`                                              |
| borderRadius        | **12** (not 13 like dashboard)                                    |
| paddingHorizontal   | **7** (not 8 like dashboard)                                      |
| paddingVertical     | **9** (not 10 like dashboard)                                     |
| borderWidth         | 1                                                                |
| borderColor         | `rgba(255,255,255,0.15)`                                         |

Inner stack (3 lines):
1. Icon — fontSize **15** (not 16 like dashboard), marginBottom 1, lineHeight 15
2. Number — fontSize **17** (not 18 like dashboard), fontWeight 800, color white, lineHeight 17. **Only render when `n` exists** (the Eligible chip has empty number)
3. Label — fontSize **9** (not 9.5 like dashboard), color `rgba(255,255,255,0.7)` (not 0.78), marginTop **`n ? 3 : 5`** (extra space when no number)

Stats data (hard-coded, matches prototype):
| Icon | Number | Label key                       | EN              | NE                |
|------|--------|---------------------------------|------------------|--------------------|
| 🍳   | 12     | `server.profile.stat_served`    | Courses Served   | सेवा गरेको         |
| 🏛   | 8      | `server.profile.stat_centers`   | Nepal Centers    | नेपाल केन्द्रहरू   |
| ✅   | —      | `server.profile.stat_eligible`  | Eligible         | योग्य              |

> The `stat_served` / `stat_centers` strings match `server.home.*` exactly. **Reuse those keys**. Only `stat_eligible` is new.

## 4. Eligibility banner (no `sph` above it)

### 4.1 Container
- `paddingHorizontal: 18`, `paddingTop: 14`, `paddingBottom: 0`

### 4.2 Banner card
- `backgroundColor: Colors.fol`
- `borderWidth: 1.5`, `borderColor: Colors.fom`
- `borderRadius: 16`
- `paddingHorizontal: 15`, `paddingVertical: 13` (asymmetric — vertical < horizontal)
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 11`
- **No shadow** (prototype inline style overrides `.card` base only with these, but doesn't add shadow. Prototype `<div>` style spec on line 2897 is a custom inline block — not a `.card` class).

### 4.3 Icon tile (`flexShrink: 0`)
- `width: 42`, `height: 42`, `borderRadius: 13`
- `backgroundColor: Colors.fo` (solid forest, not tinted)
- centered glyph `✅` fontSize 20

### 4.4 Body (`flex: 1`)
- Title — fontSize **13.5**, fontWeight 800, color `Colors.fo`: `t('server.profile.eligible')` ("Eligible to Serve" / "सेवा गर्न योग्य")
- Sub — fontSize 11.5, color `Colors.tx2`, marginTop 2: `t('server.profile.eligible_sub')` ("Completed 10-day course · Sitting regularly" / "१०-दिने शिविर पूरा · नियमित साधना")
- Last-served line — fontSize 11.5, fontWeight 700, color `Colors.fo`, marginTop 2:
  - EN: `"Last served: Mar 2026 ✓"`
  - NE: `"अघिल्लो सेवा: Mar 2026 ✓"`
  - Key: `server.profile.last_served` resolves to `"Last served"` / `"अघिल्लो सेवा"`, then `: Mar 2026 ✓` appended as literal (prototype line 2902 hard-codes the date string)

> `eligible` / `eligible_sub` already exist under `server.home.*`. **Reuse**. Only the `last_served` label is new.

## 5. Areas of Expertise

### 5.1 Section header
`.sph` → `🌟 Areas of Expertise` / `🌟 विशेषज्ञताका क्षेत्रहरू` (i18n key `server.profile.areas_expertise`).

### 5.2 Card
- Standard `.card` with `margin: 0 18px` (no marginBottom) — uses the "section card" convention from spec 15 §5.3.
- Inside, padding stays at the base 15.

### 5.3 Small uppercase label (first child)
- fontSize 11, color `Colors.tx3`, marginBottom 9, fontWeight 600, `textTransform: 'uppercase'`, letterSpacing **0.55** (`11 × 0.05`)
- Text: `t('server.profile.pref_areas')` → `"Preferred service areas"` / `"मनपर्ने सेवा क्षेत्रहरू"`

### 5.4 Per-area row

Render one row per entry in `SERVICE_AREAS` (8 rows total).

```ts
const EXPERTISE: ServiceAreaId[] = ['kitchen', 'dhamma', 'compound', 'residence'];
const isPreferred = (id) => EXPERTISE.includes(id);
```

Row:
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 11`, paddingVertical 9
- **borderBottom: 1px solid `Colors.bd`** on EVERY row (including last — prototype applies it uniformly on line 2913). To match: render `<View style={{ height: 1, backgroundColor: Colors.bd }} />` between rows AND after the last row.

Icon tile (`flexShrink: 0`):
- `width: 36`, `height: 36`, `borderRadius: 10`
- Background:
  - **preferred**: `${a.color}22` — area's brand colour at ~13% alpha (RGBA via hex8: e.g. kitchen `#E8744A22`)
  - **not preferred**: `Colors.cr2`
- Centered emoji `a.emoji` fontSize 18

Body (`flex: 1`):
- Label — fontSize 13, fontWeight 700, color `Colors.tx`: `a.label` (English always)
- Description — fontSize 11, color `Colors.tx3`, marginTop 1: `a.desc` (English from SERVICE_AREAS)

Star badge (only if preferred):
- `width: 20`, `height: 20`, `borderRadius: 10` (perfect circle), `flexShrink: 0`
- `backgroundColor: a.color` (full alpha)
- Centered glyph `★` fontSize 11, fontWeight 700, color white

### 5.5 Hex-8 alpha for `${a.color}22`

RN accepts 8-digit hex `#RRGGBBAA`. `22` hex = 34 decimal ≈ 13% alpha. We construct via string concat: `${a.color}22`. Works in RN colour parser.

## 6. Availability 2026

### 6.1 Section header
`.sph` → `📅 Availability 2026` / `📅 उपलब्धता २०२६` (i18n key `server.profile.avail_2026`).

### 6.2 Card
Standard section card (`margin: 0 18px`, `marginBottom: 0`).

### 6.3 Month grid

**Data**:
```ts
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const AV: (0 | 1 | 'f')[] = [0,0,1,1,1,0,1,1,0,1,1,0];
// (av array doesn't actually use 'f' in prototype data, but the code branches for it)
```

**Grid**: 6 columns × 2 rows. RN uses flex (no CSS grid). Implement as a wrapping row:
```tsx
<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
  {months.map((m, i) => (
    <View key={m} style={{ width: 'calc-or-equivalent' }}>…</View>
  ))}
</View>
```
For a 6-col grid with `gap: 5`, each cell width is `(100% - 5*5) / 6`. Easiest in RN: compute via flex basis or width %. **Use** `width: '15.83%'` (`(100 - 5*0.83) / 6` ≈ 15.83 — approximate). Or simpler: skip percentage and use `flexBasis: 0, flexGrow: 1` per cell which auto-distributes with gap.

Pick: **`flexBasis: 0, flexGrow: 1, minWidth: 0`** on each cell. Confirmed renders 6 columns evenly with gap respected in RN ≥ 0.71.

Each cell:
- `borderRadius: 9`, paddingHorizontal 3, paddingVertical 7
- `textAlign: 'center'`
- Background:
  - state `1` → `Colors.fo`
  - state `'f'` → `Colors.gd` (gold)
  - state `0` → `Colors.cr3`
- Border:
  - state `0` → `borderWidth: 1.5, borderColor: Colors.bd`
  - else → no border
- Inner texts (stacked):
  - Month label — fontSize 9.5, fontWeight 700
    - state `1` → color white
    - state `'f'` → color `Colors.gd`
    - state `0` → color `Colors.tx3`
  - Mark — fontSize 7.5, marginTop 1, opacity 0.8, same colour as label
    - state `1` → `"✓"`
    - state `'f'` → `"🎑"`
    - state `0` → `"✗"`

### 6.4 Footer text
Below the grid:
- fontSize 10, color `Colors.gd`
- Content: `🎑 Festival blocks: Buddha Jayanti (May) · Dashain (Oct) · Tihar (Nov)`
- i18n key `server.profile.festival_blocks`
- NE: `🎑 चाडपर्व: बुद्ध जयन्ती (मे) · दशैं (अक्टोबर) · तिहार (नोभेम्बर)`

## 7. Preferred Centers

### 7.1 Section header
`.sph` → `📍 Preferred Centers` / `📍 मनपर्ने केन्द्रहरू` (i18n `server.profile.pref_centers`).

### 7.2 Card
Section card (`margin: 0 18px`, `marginBottom: 0`).

### 7.3 Rows

Hard-coded data (matches prototype line 2944):
| Rank | Name             | City                          | Colour      |
|------|------------------|--------------------------------|-------------|
| 1    | Dhamma Shringa   | Budhanilkantha, Kathmandu     | `Colors.fo` |
| 2    | Dhamma Pokhara   | Pokhara                       | `#9B6B14`   |
| 3    | Dhamma Adhara    | Swayambhu, Kathmandu          | `Colors.bl` |

Per-row:
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 11`, paddingVertical 10
- `borderBottom: 1px solid Colors.bd` on EVERY row (uniform — same caveat as expertise rows)

Rank tile (`flexShrink: 0`):
- `width: 26`, `height: 26`, `borderRadius: 8`
- `backgroundColor: row.colour`
- Centered text — fontSize 12, fontWeight 800, color white: `row.rank`

Body (no `flex: 1` in prototype — column wraps naturally):
- Name — fontSize 13, fontWeight 700, color `Colors.tx`
- City — fontSize 11.5, color `Colors.tx2`: `"${city} 🇳🇵"`

> All three centre names + cities are hard-coded English. Same in NE.

## 8. Service History

### 8.1 Section header
`.sph` → `📖 Service History` / `📖 सेवा इतिहास` (i18n `server.profile.service_history`).

### 8.2 Card
Section card.

### 8.3 History rows

Hard-coded 3 entries:
| Date     | Centre          | Area         | Duration             |
|----------|-----------------|--------------|----------------------|
| Mar 2026 | Dhamma Shringa  | Kitchen      | Full (11 days)       |
| Nov 2025 | Dhamma Pokhara  | Dhamma Hall  | Partial (7 days)     |
| Jun 2025 | Dhamma Adhara   | Compound     | Full (11 days)       |

Per-row:
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 10`, paddingVertical 9
- `borderBottom: 1px solid Colors.bd` **only for first 2 rows**, none for the last (per prototype line 2955 `i<2`). This is the only place that excludes the last row — keep the exception.

Icon tile (`flexShrink: 0`):
- `width: 34`, `height: 34`, `borderRadius: 9`
- `backgroundColor: Colors.svl` (`#FBF0E0`)
- Centered emoji fontSize 16
- Emoji mapping by area name:
  - `Kitchen` → `🍳`
  - `Dhamma Hall` → `🔔`
  - else → `🌿`

Body (`flex: 1`):
- Centre — fontSize 13, fontWeight 700, color `Colors.tx`
- Area-and-duration — fontSize 11, color `Colors.tx2`: `"{area} · {duration}"` (English literals in both languages)

Date (right):
- fontSize 11, color `Colors.tx3`

### 8.4 "View all courses →" link

Below the rows:
- marginTop 10, `textAlign: 'center'`
- fontSize 13, color `#9B6B14`, fontWeight 600
- Text: `t('server.profile.view_all_courses')` → `"View all courses →"` / `"सबै शिविरहरू हेर्नुहोस् →"`
- Currently a no-op (link affordance only). Wrap in `TouchableOpacity` for future tappability.

## 9. Action buttons (bottom)

### 9.1 Edit Profile & Availability
- Container: `paddingHorizontal: 18`, `paddingTop: 18`, `paddingBottom: 6`
- `.btn.ou` outline:
  - Background transparent
  - borderWidth 2, borderColor `Colors.bd2`
  - paddingVertical 13, paddingHorizontal 22
  - borderRadius 13
  - fontSize 14, fontWeight 700, color `Colors.tx`
  - Width 100%
- Text: `t('server.profile.edit_avail')` → `"Edit Profile & Availability"` / `"प्रोफाइल र उपलब्धता सम्पादन"`
- onPress → `router.replace(Routes.login)` (matches prototype which `nav("login")` — effectively logs out via the placeholder). For v1, **wire it to a no-op** OR to login. Decision: **no-op** (prototype only does this because there's no real edit screen yet). Add inline `Alert.alert(t('common.coming_soon'))` style placeholder.

  **Decision pivot**: Match prototype exactly → route to login. The user can change this later when an edit screen exists. **Final**: `Alert.alert` "coming soon" to avoid accidental logout. Flag for user.

### 9.2 Sign Out
- Container: `paddingHorizontal: 18`, `paddingTop: 0`, `paddingBottom: 6`
- Same `.btn.ou` outline but with overrides:
  - `color: #B85040`
  - `borderColor: #E8B0A0`
- Text: `t('common.sign_out')` → `"Sign Out"` / `"बाहिर निस्कनुहोस्"`
- onPress → `useAuthStore.signOut()` then `router.replace(Routes.login)`

## 10. Footer spacer

`<View style={{ height: 20 }} />` plus `paddingBottom: insets.bottom + 8` on ScrollView content.

## 11. i18n

New block under `server.profile.*`:

| Key                       | EN                                       | NE                                          |
|---------------------------|------------------------------------------|----------------------------------------------|
| `courses_lbl`             | courses                                  | शिविर                                        |
| `last_served`             | Last served                              | अघिल्लो सेवा                                  |
| `stat_eligible`           | Eligible                                 | योग्य                                        |
| `areas_expertise`         | Areas of Expertise                       | विशेषज्ञताका क्षेत्रहरू                       |
| `pref_areas`              | Preferred service areas                  | मनपर्ने सेवा क्षेत्रहरू                       |
| `avail_2026`              | Availability 2026                        | उपलब्धता २०२६                                 |
| `festival_blocks`         | 🎑 Festival blocks: Buddha Jayanti (May) · Dashain (Oct) · Tihar (Nov) | 🎑 चाडपर्व: बुद्ध जयन्ती (मे) · दशैं (अक्टोबर) · तिहार (नोभेम्बर) |
| `pref_centers`            | Preferred Centers                        | मनपर्ने केन्द्रहरू                            |
| `service_history`         | Service History                          | सेवा इतिहास                                   |
| `view_all_courses`        | View all courses →                       | सबै शिविरहरू हेर्नुहोस् →                     |
| `edit_avail`              | Edit Profile & Availability              | प्रोफाइल र उपलब्धता सम्पादन                   |

Reuse from existing blocks:
- `server.home.dhamma_server`, `server.home.old_student`
- `server.home.eligible`, `server.home.eligible_sub`
- `server.home.stat_served`, `server.home.stat_centers`
- `server.home.lang_toggle_en`, `server.home.lang_toggle_ne`
- Existing `common.sign_out` if present (check before adding)
- Existing `common.coming_soon` if present (or this spec adds it via `server.profile.coming_soon`)

## 12. Behaviour

| Trigger                       | Action                                                  |
|-------------------------------|----------------------------------------------------------|
| Tap language pill             | `setLanguage(lang === 'ne' ? 'en' : 'ne')`              |
| Tap "View all courses →"      | no-op for v1 (visual link only)                         |
| Tap "Edit Profile…"           | `Alert.alert(t('server.profile.coming_soon'))`           |
| Tap "Sign Out"                | `useAuthStore.signOut()` + `router.replace(Routes.login)`|

No write operations. Profile data is hard-coded in v1.

## 13. Things being omitted vs prototype

| Prototype style                     | RN decision                                                |
|-------------------------------------|------------------------------------------------------------|
| `backdropFilter: blur(10px)`        | Skip (RN limitation) — opacity covers visibility           |
| `cursor: 'pointer'`                 | `TouchableOpacity activeOpacity={0.85}` where tappable      |
| CSS Grid for month layout           | Flex row with `flexBasis: 0, flexGrow: 1` per cell        |
| `:active` transforms                | Opacity feedback only                                      |
| Edit Profile → `nav("login")`       | Replaced with "coming soon" alert to prevent accidental logout |

### 13.1 Other small details to preserve

- Avatar tile radius is **22** (not 18 like dashboard's 54×54 badge or 13 like the upcoming-card icon tile). It's the largest rounded tile on any server screen.
- Avatar tile background opacity `0.22` is **more opaque** than the dashboard badge's `0.18`. Subtle difference but the prototype is explicit.
- Hero LotusHero opacity is `0.07` here — slightly **less** than other screens' `0.08`. With the MeditationFigure layered behind, the lower opacity prevents visual noise.
- MeditationFigure goes **first** in JSX (rendered behind LotusHero).
- Name fontSize **20** — smaller than other server screen titles (22 / 23). Profile is more compact.
- Sub 2 (`Old Student · 2015 · 12 courses`) uses the lightest text opacity (0.6) — three opacity tiers in the hero text: 1.0 (name) / 0.75 (role+nation) / 0.6 (lifetime stats).
- Stats chip is **smaller** than dashboard: radius 12 vs 13, padding 9/7 vs 10/8, icon 15 vs 16, number 17 vs 18, label 9 vs 9.5. All values one step down from dashboard.
- The Eligible chip has **empty number** — the label's marginTop shifts to 5 (instead of 3) to centre-balance the chip vertically.
- Eligible banner has its own `paddingTop: 14, paddingBottom: 0` container — no `sph` above. Sits **right below** the hero with 14px breathing room.
- Banner uses `.fol` bg with `.fom` border at **1.5px** (not 1px). Other forest-tinted callouts (spec 13 eligible card) use no border at all.
- Banner inner padding is asymmetric `15` horizontal / `13` vertical — saves a row of vertical space vs the standard `.card`'s 15/15.
- Banner icon tile bg is **solid** `Colors.fo` (forest) — not the tinted `Colors.fol` style used elsewhere.
- Expertise rows: tile bg uses `${a.color}22` for preferred (RGBA hex-8 = ~13% alpha). Non-preferred uses `Colors.cr2`. Don't conflate the two.
- Star badge is a **perfect circle** (`borderRadius: 10` on a 20×20 view = 50% radius). Don't use `borderRadius: 'full'` patterns.
- Last expertise row has `borderBottom: 1px solid var(--bd)` per prototype (no `:last-child` exclusion). The vertical breathing room before the next `sph` is provided by `.sph` `marginTop: 18`.
- Month-grid cell padding is asymmetric (`7` vertical / `3` horizontal) — narrow horizontally so 6 columns fit comfortably.
- Month cell border only renders for unavailable (state `0`) cells. Available cells (1) have a solid-colour bg with **no border**, so the colour reads clean.
- Month cell mark `✗` is intentionally a checkmark/cross. Some Devanagari fonts render `✗` differently — keep but accept rendering quirks.
- Festival footer is a plain string with a single icon prefix `🎑`. fontSize is `10` — smallest text on the screen.
- Preferred-centers ranks 1/2/3 use **three different theme colours** (forest / saffron / blue). This is the only place where the admin blue (`Colors.bl`) appears in the server cycle — intentional cross-theme accent.
- Service-history exception: borderBottom only on first 2 rows, none on last. Differs from expertise/center rows which apply it uniformly. This is the only place that suppresses the last border.
- "View all courses →" is centred (textAlign center) and `marginTop: 10` — NOT right-aligned like the "View Details →" affordance on the My Service list.
- Edit / Sign Out buttons use **2px** border (matches `.btn.ou` base) — heavier than the `1.5px` borders on Withdraw / Confirm panels.
- Sign Out's text colour `#B85040` is the same softer red used for rejected-application accent in spec 18 (durationAccent rejected branch). Consistent palette across cycles.

## 14. Acceptance checklist

### Hero
- [ ] 2-stop gradient `#5A3800 → #9B6B14` 160°
- [ ] MeditationFigure (size 130, white 0.1) **and** LotusHero (size 180, opacity 0.07) — both decorations
- [ ] Avatar 66×66 radius 22, bg `rgba(255,255,255,0.22)` (more opaque than dashboard), `🌿` 30px
- [ ] Name 20/800 (smaller than other screens' titles)
- [ ] Sub 1 opacity 0.75 · Sub 2 opacity 0.6 (three opacity tiers)
- [ ] Language pill on the right, flexShrink: 0
- [ ] Stats row marginTop **15**
- [ ] Stats chip: radius 12, padding 9/7, icon 15, number 17 (only if n), label 9, label marginTop n ? 3 : 5
- [ ] Eligible stat chip renders with empty number and adjusted spacing

### Eligibility banner
- [ ] No `sph` above it
- [ ] Container padding `14 18 0`
- [ ] Card: fol bg, fom 1.5px border, radius 16, padding `15 13` asymmetric, gap 11
- [ ] Icon tile: 42×42 radius 13, solid `Colors.fo` bg, `✅` 20px
- [ ] Title 13.5/800/fo
- [ ] Sub 11.5/tx2 mt 2
- [ ] Last-served line 11.5/700/fo mt 2: "Last served: Mar 2026 ✓"

### Areas of Expertise
- [ ] sph `🌟 Areas of Expertise` uppercase
- [ ] Card margin `0 18`, no marginBottom
- [ ] Small uppercase label "Preferred service areas" 11/tx3/600 letterSpacing 0.55 mb 9
- [ ] 8 rows (one per SERVICE_AREA), gap 11, paddingVertical 9, every row has borderBottom 1px bd
- [ ] Icon tile 36×36 radius 10; bg = `${a.color}22` if preferred else `Colors.cr2`; emoji 18
- [ ] Body: label 13/700/tx, desc 11/tx3 mt 1
- [ ] Star badge only on preferred (20×20 circle, a.color bg, ★ 11/700 white)
- [ ] Hard-coded preferred list: ['kitchen', 'dhamma', 'compound', 'residence']

### Availability 2026
- [ ] sph `📅 Availability 2026`
- [ ] 6-column flex grid (flexBasis 0, flexGrow 1), gap 5, marginBottom 8
- [ ] Cell border: 1.5px bd only when state===0; none when 1 or 'f'
- [ ] Cell bg: state 1→fo, 'f'→gd, 0→cr3
- [ ] Month text 9.5/700; mark 7.5 opacity 0.8 mt 1
- [ ] Footer line 10/gd with festival list

### Preferred Centers
- [ ] sph `📍 Preferred Centers`
- [ ] 3 rows (Shringa fo / Pokhara `#9B6B14` / Adhara bl), gap 11, paddingVertical 10
- [ ] Rank tile 26×26 radius 8, fontSize 12/800/white
- [ ] Name 13/700, city 11.5/tx2 with `🇳🇵`
- [ ] borderBottom 1px bd on EVERY row (including last)

### Service History
- [ ] sph `📖 Service History`
- [ ] 3 hard-coded entries
- [ ] Icon tile 34×34 radius 9, svl bg, emoji 16, mapping by area
- [ ] Body: centre 13/700, area · duration 11/tx2
- [ ] Date right 11/tx3
- [ ] borderBottom on first 2 rows only — last row has NO border (the only exception)
- [ ] "View all courses →" centered 13/600/`#9B6B14`, marginTop 10

### Actions
- [ ] Edit Profile button: .btn.ou (2px bd2 border) with `coming_soon` alert
- [ ] Sign Out button: same outline, color `#B85040`, borderColor `#E8B0A0`, calls signOut + router.replace(login)

### Cross-cutting
- [ ] Tab bar visible
- [ ] No TS errors
- [ ] Reused i18n keys from `server.home.*` not duplicated

---

## Implementation notes (post-build corrections)

- **Availability grid**: rendered as 2 explicit rows of 6 cells (`[0, 6].map(rowStart => MONTHS.slice(rowStart, rowStart + 6))`) instead of `flexWrap`'d 12-cell grid. Visually identical (gap 5, second row marginTop 5), but RN's flex behavior made the wrap unreliable.
- **"View all courses →"** is wired to a `coming_soon` Alert. Real per-server history routing lands when the SQLite history sync is built.
- Added shared `common.coming_soon` i18n key (EN: "Coming soon", NE: "छिट्टै आउँदैछ") for this and other deferred actions.
