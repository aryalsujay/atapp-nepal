---
id: 21-admin-dashboard
title: Admin Dashboard
route: /(admin)/dashboard
prototype: VipassanaTeacherApp/app.html:1935–2010
status: draft
related: [22-admin-inbox, 24-admin-directory, 25-admin-auto-schedule, 27-admin-notifications]
---

# 21 · Admin Dashboard

The Centre Manager's home screen — a single-glance overview with the
admin's identity, hero stats, quick-action shortcuts to inbox /
teachers / auto-schedule, urgent courses missing teachers, recent
applications, a link to Notification Center, a feature-visibility
toggle, and a sign-out.

First admin screen — establishes the **admin blue theme** (`Colors.bl`
= `#1A5C96`) and the deep navy gradient.

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/dashboard` (admin home, tab if present)          |
| **Component**    | `app/(admin)/dashboard.tsx` default `AdminDashboardScreen` |
| **Prototype**    | `AdminDash` function, app.html 1935–2010                    |
| **Status bar**   | `barStyle="light-content"` (dark hero)                     |
| **Safe area**    | Top inset added to hero `paddingTop`                        |

## 2. Layout overview (top → bottom)

```
┌──────────────────────────────────────────────────────────────────┐
│ Hero (admin navy gradient #0F2A40 → #1A4A72 → #2A6096)            │
│   Admin                                                          │
│   Dashboard                                  (22 / 800)          │
│   Dhamma Shringa · Kathmandu Valley 🇳🇵                          │
│   [ 4 Applications ] [ 6 Unscheduled ] [ 138 Active ATs ]        │
├──────────────────────────────────────────────────────────────────┤
│ [📨 Applications] [👥 Teachers] [⚡ Auto-Schedule]  (3 sm btns)   │
├──────────────────────────────────────────────────────────────────┤
│ 🔴 URGENT — NEEDS TEACHER                                         │
│ ┌─ Card (red 4px left border) ────────────────────────────────┐  │
│ │ 10-Day                          11d left  (right, ur 13/800)│  │
│ │ Dhamma Pokhara, Pokhara 🇳🇵                                 │  │
│ │ 📅 Jul 15–26                                                │  │
│ │ [chip ur: Needs: Nepali-speaking AT]   [Assign AT btn pr sm]│  │
│ └────────────────────────────────────────────────────────────┘  │
│ ... (3 urgent cards total)                                       │
├──────────────────────────────────────────────────────────────────┤
│ 📨 RECENT APPLICATIONS                            See all →      │
│ ┌─ Card · row · 36 avatar / name / course / [94% match] ─────┐  │
│ │ A   Asha Mehta                                              │  │
│ │     Dhamma Shringa — Sep Satipatthana            94% match  │  │
│ └────────────────────────────────────────────────────────────┘  │
│ ┌─ Card · same ───────────────────────────────────────────────┐  │
│ │ R   Ram Prasad Sharma     Dhamma Janani — Aug 10-day  87%   │  │
│ └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│ ┌─ Notification Center card (bll bg, BDD4EE border) ──────────┐  │
│ │ 📧   Notification Center  (13/700/bl)                       │  │
│ │      View & resend teacher emails · Bilingual          ›    │  │
│ └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│ ⚙️ FEATURE VISIBILITY                                             │
│ ┌─ Card ──────────────────────────────────────────────────────┐  │
│ │ Co-Teacher Section                              [== toggle] │  │
│ │ Show co-teacher info…                                       │  │
│ └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│ [               Sign Out               ]  (red outline)          │
│ (20 footer)                                                      │
└──────────────────────────────────────────────────────────────────┘
```

No bottom tab bar on `(admin)` yet — admin uses a different navigation
layout (TBD when spec 22+ land). For v1, the dashboard renders standalone.

## 3. Hero

### 3.1 Gradient (3 stops)
```ts
colors = ['#0F2A40', '#1A4A72', '#2A6096']
start  = { x: 0, y: 0 }
end    = { x: 0.671, y: 0.97 } // 160°
```
This is the admin navy gradient — already in `src/theme/colors.ts` as `Gradients.admin`. Reuse it.

### 3.2 Padding
- `paddingHorizontal: 18`, `paddingTop: Math.max(56, insets.top + 12)`, `paddingBottom: 22`
- `position: relative`, `overflow: hidden`

### 3.3 Decorations (paint behind text)
- `<LotusHero color="white" opacity={0.07} size={220} />` (larger than other hero LotusHeros — 220 vs 180–210)
- `<MountainSilhouette color="rgba(255,255,255,0.06)" />` — **custom dim colour** (other screens use default). The prop accepts `color` string.

If `MountainSilhouette` doesn't currently accept a `color` prop, **extend it** to: `<MountainSilhouette color?: string />` defaulting to its current internal colour. Backward compatible.

### 3.4 Header text (`position: relative` so they sit above decorations)
- Kicker — fontSize **12.5**, color `rgba(255,255,255,0.65)`, fontFamily `FontFamily.devanagari` when `lang === 'ne'` (prototype forces Devanagari unconditionally; we keep our pattern of conditional): `t('admin.dashboard.kicker')` ("Admin" / "व्यवस्थापक")
- Title — fontSize **22**, fontWeight 800, color white: hard-coded literal `"Dashboard"` (prototype line 1950 has no `lang==="np"?...` ternary — English in both languages).
- Sub-line — fontSize 13, color `rgba(255,255,255,0.68)`: `"Dhamma Shringa · Kathmandu Valley 🇳🇵"` — hard-coded English literal (prototype line 1951; both centre name and region stay English).

### 3.5 Stats row
`flexDirection: 'row'`, `gap: 8`, `marginTop: 16`, `position: 'relative'`.

Three chips (`flex: 1`):
| Property            | Value                                                            |
|---------------------|------------------------------------------------------------------|
| backgroundColor     | `rgba(255,255,255,0.13)`                                        |
| borderRadius        | 13                                                              |
| paddingHorizontal   | 7                                                               |
| paddingVertical     | 10                                                              |
| (no border)         |                                                                  |
| backdropFilter      | omitted (RN limitation)                                          |

Inner (centred):
- Number — fontSize **18**, fontWeight 800, **colour varies per chip**:
  - Chip 1: `Colors.gd` (gold)
  - Chip 2: `#FFB3AE` (a soft coral — **not** in token palette; inline literal)
  - Chip 3: `Colors.white`
- Label — fontSize 9.5, color `rgba(255,255,255,0.65)`, marginTop 1

Stats data (matches prototype exactly):
| # | n   | Label text                                            |
|---|-----|--------------------------------------------------------|
| 1 | 4   | `t('applications')` ("Applications" / "आवेदनहरू")     |
| 2 | 6   | hard-coded English literal `"Unscheduled"`             |
| 3 | 138 | hard-coded English literal `"Active ATs"`             |

> Only the first label translates (per prototype line 1953). "Unscheduled" and "Active ATs" stay English in NE mode. Match prototype exactly.

## 4. Quick-action button row

Container: `paddingTop: 13`, `paddingHorizontal: 18`, `paddingBottom: 0`. `flexDirection: 'row'`, `gap: 9`.

Three buttons, each `flex: 1`, `paddingHorizontal: 8`, `paddingVertical: 11`, **fontSize 12**, fontWeight 700, borderRadius 13, alignItems centre.

| Button                | Background                                             | Text color  | Route               |
|-----------------------|--------------------------------------------------------|-------------|---------------------|
| 📨 Applications        | gradient `Gradients.forestCta` (fo → #2D5236, 135°)    | white       | `/(admin)/inbox`    |
| 👥 Teachers            | gradient `Gradients.primaryCta` (sf → sfd, 135°)       | white       | `/(admin)/directory`|
| ⚡ Auto-Schedule       | outline: transparent bg + 2px `Colors.bd2` border       | `Colors.tx` | `/(admin)/schedule` |

Text for each:
- `📨 ${t('common.applications')}` (or scoped key) → "Applications" / "आवेदनहरू"
- `👥 ${t('admin.dashboard.teachers')}` → "Teachers" / "शिक्षकहरू" (Acharya note: keep "शिक्षकहरू" only if matching prototype `t("teachers")`. Prototype's NE has शिक्षकहरू. We can override to आचार्यहरू for consistency with our Acharya-correct rule.)

> **Acharya decision**: prototype uses शिक्षकहरू for the teacher tab label. Per CLAUDE.md we use **आचार्यहरू** everywhere. Spec defaults to आचार्यहरू. Flag for user.

- `⚡ ${t('admin.dashboard.schedule')}` → "Auto-Schedule" / "स्वत:-तालिका"

Reuse existing keys where present:
- `home.applied` / generic `applications` key from existing en.json
- `common.teachers` if present, otherwise add `admin.dashboard.teachers`

## 5. Urgent section

### 5.1 Section header
`.sph` → `🔴 URGENT — NEEDS TEACHER` (uppercase via `textTransform`). i18n key `admin.dashboard.urgent`.

NE: `🔴 अत्यावश्यक — शिक्षक चाहिन्छ` (or आचार्य चाहिन्छ per Acharya rule).

### 5.2 Urgent data
Hard-coded array (matches prototype line 1938–1942):
```ts
const URGENT = [
  { name: '10-Day', center: 'Dhamma Pokhara, Pokhara 🇳🇵',    dates: 'Jul 15–26', days: 11, need: 'Nepali-speaking AT' },
  { name: '10-Day', center: 'Dhamma Janani, Lumbini 🇳🇵',     dates: 'Aug 20–31', days: 18, need: 'Female AT (Nepali/Hindi)' },
  { name: '20-Day', center: 'Dhamma Shringa, Kathmandu 🇳🇵',  dates: 'Nov 1–21',  days: 34, need: 'Senior Male AT' },
];
```

`need` text is English literal in both languages (prototype hard-codes).

### 5.3 Urgent card
Standard `.card` (white, padding 15, radius 16, mh 18, mb 11, shadow). Adds **`borderLeftWidth: 4`, `borderLeftColor: Colors.ur`**.

#### 5.3.1 Top row
`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`, marginBottom 7.

Left (`flex: 1`, paddingRight 8):
- Name — fontSize 14, fontWeight 700, color `Colors.tx`
- Centre — fontSize 12.5, color `Colors.tx2`
- Dates — fontSize 11, color `Colors.tx3`, marginTop 1: `📅 {c.dates}`

Right (`textAlign: 'right'`, `flexShrink: 0`):
- "{days}d left" — fontSize 13, fontWeight 800, color `Colors.ur`. **English literal in both languages** (prototype hard-codes `d left`).

#### 5.3.2 Bottom row
`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`.

Left — `.chip.ur` (prototype base `.chip`: fontSize 11, weight 600, padding 3/9, radius 20, margin 2):
- Background `Colors.url`, color `Colors.ur`
- fontSize **11** (not 11.5), paddingHorizontal **9**, paddingVertical **3**, borderRadius 20
- Text: `"Needs: {c.need}"` — `"Needs:"` is **English literal in both languages** (prototype hard-codes the string; no `lang==="np"?...`). `{need}` is also English literal.

Right — `.btn.pr.sm`:
- Gradient `Gradients.primaryCta` (sf → sfd, 135°)
- paddingHorizontal 15, paddingVertical 7, borderRadius 10
- fontSize 12.5, fontWeight 700, color white
- Text: `"Assign AT"` — English literal (prototype hard-codes; matches AT pair pattern)
- onPress → (v1 placeholder) `Alert.alert(t('common.coming_soon'))`. Eventually navigates to assignment flow.

## 6. Recent Applications section

### 6.1 Header row
`flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'center'`, padding `4 18 7`.

Left — `.sph` with `margin: 0` override: `📨 Recent Applications` / `📨 हालका आवेदनहरू`. i18n key `admin.dashboard.recent_apps`.

Right — "See all →" tap link:
- fontSize 13, color `Colors.sf` (saffron — note: NOT admin blue here. Prototype uses `var(--sf)` line 1978.)
- fontWeight 600
- Tap → `router.push(Routes.adminInbox)` (i.e. `/(admin)/inbox`)
- Reuse existing `home.see_all` key.

### 6.2 Application card
Standard `.card`, `flexDirection: 'row'`, `gap: 10`, `alignItems: 'center'`. Slice first 2 from admApps.

Tap → `router.push(routeTo.adminApplicationReview(a.id))`.

#### 6.2.1 Avatar (`.avatar` class, prototype line 521)
- `width: 36`, `height: 36`, `borderRadius: 18` (perfect circle)
- Background `Colors.sfm` (saffron muted = `#FAE0C0`)
- Centred text — fontSize 14, fontWeight 700, color `Colors.sfd` (saffron dark = `#A85C08`): `a.name[0]` (first character)
- `flexShrink: 0`

#### 6.2.2 Body (`flex: 1`)
- Name — fontSize 13.5, fontWeight 700, color `Colors.tx`
- Course — fontSize 11.5, color `Colors.tx2`

#### 6.2.3 Match badge (right)
Reuse `.mbadge` (prototype line 493) — three tiers:
- `hi` (≥90): bg `Colors.fol`, color `Colors.fo`
- `md` (70-89): bg `Colors.bll`, color `Colors.bl`
- `lo` (<70): bg `Colors.cr2`, color `Colors.tx3`

Base style: fontSize **12** (not 10.5), fontWeight 700, paddingHorizontal **10**, paddingVertical **3**, borderRadius 20.

Text: `"{a.match}% match"` — English literal in both languages.

## 7. Notification Center card

Container: `paddingHorizontal: 18`, `paddingTop: 6`, `paddingBottom: 10`.

Card (deviates from standard `.card`):
- Background `Colors.bll` (admin-blue light = `#E6F0FA`)
- Border 1px `#BDD4EE` (admin-blue muted — Colors.bld)
- borderRadius 16, padding 15
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 12`
- Tappable → `router.push(Routes.adminNotifications)`

Contents:
- Emoji — fontSize 22: `📧`
- Body (`flex: 1`):
  - Title — fontSize 13, fontWeight 700, color `Colors.bl`: `t('admin.dashboard.notif_center')` ("Notification Center" / "सूचना केन्द्र")
  - Sub — fontSize 11, color `Colors.tx2`: `t('admin.dashboard.notif_center_sub')` ("View & resend teacher emails · Bilingual" / "शिक्षकका इमेल हेर्नुहोस् र पुनः पठाउनुहोस् · दुई भाषामा")
- Chevron — fontSize 18, color `Colors.bl`: `›`

## 8. Feature Visibility

### 8.1 Section header
`.sph` → `⚙️ FEATURE VISIBILITY`. i18n key `admin.dashboard.feature_visibility`.

NE: `⚙️ सुविधा दृश्यता`.

### 8.2 Card
Standard section card (`margin: 0 18`, `marginBottom: 0`).

Inside:
- `flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`

Left column:
- Title — fontSize 13, fontWeight 700, color `Colors.tx`: `t('admin.dashboard.coteacher_title')` ("Co-Teacher Section" / "सह-शिक्षक खण्ड" → or "सह-आचार्य खण्ड" with Acharya rule)
- Sub — fontSize 11, color `Colors.tx3`, marginTop 2: `t('admin.dashboard.coteacher_sub')` ("Show co-teacher info to teachers on course detail" / "शिक्षकहरूलाई शिविर विवरणमा सह-शिक्षक जानकारी देखाउनुहोस्")

### 8.3 Toggle switch
Custom RN toggle (no Switch component — match prototype exactly):

Container (tappable):
- `width: 44`, `height: 26`, `borderRadius: 13`
- backgroundColor: `showCoTeacher ? Colors.fo : Colors.bd2`
- `flexDirection: 'row'`, `alignItems: 'center'`
- `paddingHorizontal: 3`
- `flexShrink: 0`

Thumb:
- `width: 20`, `height: 20`, `borderRadius: 10`
- `backgroundColor: Colors.white`
- `marginLeft: showCoTeacher ? 18 : 0` (animated would be nice but RN's basic `Animated` value or `marginLeft` change suffices)
- Shadow: `shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3`

State source: Zustand admin-settings store (new) — `useAdminSettingsStore.showCoTeacher`. For v1 a local `useState(true)` is acceptable since no other screen reads it yet. **Decision**: introduce a small `useAdminSettingsStore` with `{ showCoTeacher: boolean, setShowCoTeacher: (v: boolean) => void }`. Persistence later.

## 9. Sign Out button

Container: `paddingHorizontal: 18`, `paddingTop: 10`, `paddingBottom: 6`.

Button — `.btn.ou` outline:
- Background transparent
- borderWidth 2, **borderColor `#F5C0BB`** (urgent-light variant — `Colors.urd`)
- color `Colors.ur` (urgent red)
- paddingVertical 13, paddingHorizontal 22, borderRadius 13
- fontSize 14, fontWeight 700
- Width 100%
- Text: `t('common.signOut')` → "Sign Out" / "बाहिर निस्कनुहोस्"
- onPress → `useAuthStore.signOut()` + `router.replace(Routes.login)`

## 10. Footer spacer
`<View style={{ height: 20 }} />`.

## 11. i18n

New block under `admin.dashboard.*`:

| Key                          | EN                                              | NE                                                  |
|------------------------------|-------------------------------------------------|------------------------------------------------------|
| `kicker`                     | Admin                                           | व्यवस्थापक                                            |
| `recent_apps`                | Recent Applications                             | हालका आवेदनहरू                                       |
| `notif_center`               | Notification Center                             | सूचना केन्द्र                                         |
| `notif_center_sub`           | View & resend teacher emails · Bilingual       | शिक्षकका इमेल हेर्नुहोस् र पुनः पठाउनुहोस् · द्वैभाषिक |
| `feature_visibility`         | Feature Visibility                              | सुविधा दृश्यता                                       |
| `coteacher_title`            | Co-Teacher Section                              | सह-आचार्य खण्ड                                       |
| `coteacher_sub`              | Show co-teacher info to teachers on course detail | शिविर विवरणमा सह-आचार्य जानकारी देखाउनुहोस्         |

Hard-coded English literals (no i18n keys — match prototype):
- `"Dashboard"` (hero title)
- `"Dhamma Shringa · Kathmandu Valley 🇳🇵"` (hero sub)
- `"Unscheduled"`, `"Active ATs"` (stat labels)
- `"{n}d left"` (urgent card right-text)
- `"Needs: {need}"` (urgent chip)
- `"Assign AT"` (urgent button)
- `"{score}% match"` (mbadge)

Reuse existing keys:
- `applications` (top-level) — for stat #1 label and quick-action button
- `teachers` — render as Acharya-correct `आचार्यहरू` in NE (override our existing teacher.tabs key if needed, or add a new key)
- `schedule` — exists as "Auto-Schedule" / "स्वत:-तालिका"
- `urgent` — exists; check Acharya correctness (may need to override NE to `अत्यावश्यक — आचार्य चाहिन्छ`)
- `home.see_all`
- `common.signOut`, `common.coming_soon`

> Acharya-correct usage applied (शिक्षक → आचार्य where the role is AT-related).

Reuse:
- `applications` (top-level)
- `home.see_all`
- `common.signOut`
- `common.coming_soon`

## 12. Routes needed in `src/routes.ts`

Add (if missing):
- `Routes.adminInbox = '/(admin)/inbox'`
- `Routes.adminDirectory = '/(admin)/directory'`
- `Routes.adminSchedule = '/(admin)/schedule'`
- `Routes.adminNotifications = '/(admin)/notifications'`
- `routeTo.adminApplicationReview(id)` already exists

## 13. Behaviour

| Trigger                       | Action                                                  |
|-------------------------------|---------------------------------------------------------|
| Tap 📨 Applications quick-btn | `router.push(Routes.adminInbox)`                        |
| Tap 👥 Teachers quick-btn     | `router.push(Routes.adminDirectory)`                    |
| Tap ⚡ Auto-Schedule quick-btn| `router.push(Routes.adminSchedule)`                     |
| Tap urgent "Assign AT"        | `Alert.alert(t('common.coming_soon'))` (placeholder)   |
| Tap recent-app card           | `router.push(routeTo.adminApplicationReview(a.id))`     |
| Tap "See all →"               | `router.push(Routes.adminInbox)`                        |
| Tap Notification Center card  | `router.push(Routes.adminNotifications)`               |
| Tap Co-Teacher toggle         | flip `showCoTeacher`                                    |
| Tap Sign Out                  | `useAuthStore.signOut(); router.replace(Routes.login)` |

## 14. Things being omitted vs prototype

| Prototype style              | RN decision                                            |
|------------------------------|--------------------------------------------------------|
| `backdropFilter: blur(10px)` | Skip; opacity covers visibility                         |
| `transition: 'background .2s'` on toggle | Skip animation in v1; instant state change |
| `cursor: 'pointer'`          | TouchableOpacity activeOpacity                          |

### 14.1 Other small details to preserve

- Hero LotusHero is **larger (220)** than other screens (180–210) — admin gets the most decoration.
- MountainSilhouette uses **`rgba(255,255,255,0.06)`** instead of its default — very faint, just enough to peek through the navy gradient.
- Kicker uses Devanagari font even in EN context per prototype — we conditionally apply Devanagari only when `lang === 'ne'` (our pattern).
- Stats numbers are **three different colours** intentionally: gold (positive count), coral (warning count), white (informational count). Don't normalize them.
- Coral `#FFB3AE` is **not** in our token palette — inline literal. Don't promote unless reused elsewhere.
- Quick-action buttons mix **3 different button styles** (`fo-btn`, `pr`, `ou`) in a single row — visual variety to signal different action types.
- Quick-action button fontSize is **12** (smaller than the standard `.btn.sm` 12.5) — fits within the constrained padding.
- Urgent card uses `Colors.ur` (urgent red `#C0392B`) for the 4px left-border AND the "Xd left" text — but the chip uses `.chip.ur` (`url` bg + `ur` text). Three uses of the urgent palette in one card.
- "Assign AT" button is **saffron-gradient** (teacher cycle) — admin is sourcing teachers, so the action button uses the destination role's colour.
- Recent-app "See all →" link uses **saffron** (`Colors.sf`), not admin blue — consistent with the "Apply to Serve" / teacher-related semantics. The list of recent applications is teacher-facing data.
- Avatar background colour decision: prototype uses `.avatar` class which is `Colors.sf` (saffron). Match it. First-letter only.
- Notification Center card uses `bll` bg + `BDD4EE` border + `bl` title text — three-tone blue palette in a single card.
- Notification Center sub-line uses `Colors.tx2` (not `Colors.bl`) — text returns to neutral for readability.
- Feature Visibility toggle has a 3px horizontal padding inside the 44×26 track so the 20×20 thumb has a 1-pixel breath at start/end (`44 - 20 - 3*2 = 18` = thumb travel distance, which matches our `marginLeft: 18` when on).
- Toggle ON colour is `Colors.fo` (forest) — not the admin blue. The same green is reused as a universal "good/active" indicator.
- Sign Out red `Colors.ur` is the **hard** urgent colour (not the softer `#B85040` used on server screens). Admin gets a sterner sign-out treatment.

## 15. Acceptance checklist

### Hero
- [ ] 3-stop admin gradient `#0F2A40 → #1A4A72 → #2A6096` at 160°
- [ ] LotusHero size **220** (largest so far) opacity 0.07
- [ ] MountainSilhouette with custom colour `rgba(255,255,255,0.06)`
- [ ] Kicker uses Devanagari font when lang===ne; otherwise sansRegular
- [ ] Title "Dashboard" 22/800
- [ ] Sub-line "Dhamma Shringa · Kathmandu Valley 🇳🇵" at 13/.68
- [ ] Three stat chips: numbers in gold / `#FFB3AE` / white; labels 9.5/.65 mt 1; chip radius 13, padding 10/7

### Quick actions
- [ ] 3 buttons row, gap 9, paddingTop 13
- [ ] Each `flex: 1`, padding `11 8`, fontSize 12, weight 700, radius 13
- [ ] Backgrounds: fo-gradient / sf-gradient / outline
- [ ] Routes wired correctly

### Urgent section
- [ ] `🔴 Urgent — Needs Teacher` sph
- [ ] 3 cards from URGENT data, 4px ur left-border
- [ ] Top row: name 14/700, centre 12.5/tx2, dates 11/tx3 mt 1, "Xd left" right 13/800/ur
- [ ] Bottom row: `.chip.ur` "Needs: X" + saffron-gradient "Assign AT" sm btn

### Recent Applications
- [ ] Section row: sph m0 "Recent Applications" + sf "See all →"
- [ ] 2 cards from admApps slice(0,2)
- [ ] Avatar 36/r18 saffron bg + white initial 14/700
- [ ] Name 13.5/700, course 11.5/tx2
- [ ] MatchBadge 3-tier (hi/md/lo)

### Notification Center
- [ ] bll bg, 1px BDD4EE border, gap 12, radius 16, padding 15
- [ ] 📧 22, title 13/700/bl, sub 11/tx2, › 18/bl

### Feature Visibility
- [ ] Card with toggle
- [ ] Toggle 44×26 r13 with fo / bd2 bg, 20×20 white thumb, marginLeft 0 or 18
- [ ] State persisted via `useAdminSettingsStore`

### Sign Out
- [ ] Outline 2px `#F5C0BB` border, color `ur`, fontSize 14/700
- [ ] Calls signOut + router.replace(login)

### Cross-cutting
- [ ] Status bar light-content
- [ ] No TS errors
- [ ] All new routes exist (or stubs created)
- [ ] Acharya-correct NE strings (आचार्य not शिक्षक)

---

## Implementation notes (post-build corrections)

- **Urgent course dates include year** (e.g. `Jul 15–26, 2026`) — extends prototype's `Jul 15–26` for clarity.
- **Notification bell tile added** to the hero top-right: 42×42 r13 white-glass tile with red unread dot (8×8 r4, 1.5px white border). Tap → `Routes.adminNotifications`. Bell SVG strokeWidth 1.8 in white. The dashboard's existing "Notification Center" card stays as a secondary path.
- Hero identity block now wrapped in `heroTopRow` (flex row, `align-items: flex-start`, gap 12) to support the bell column on the right.
