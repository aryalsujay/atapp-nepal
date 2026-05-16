---
id: 18-server-application-detail
title: Server Application Detail
route: /(server)/applications/[id]
prototype: VipassanaTeacherApp/app.html:3173–3303
status: draft
related: [17-server-applications, 13-server-dashboard]
---

# 18 · Server Application Detail

The detail screen for one application. Reached by tapping a card in
spec 17 (My Service) OR the upcoming-service card on the dashboard
(spec 13). Layout adapts to the application status:

- **approved** → arrival info, what-to-bring checklist, journey info
- **pending** → review-in-progress banner
- **rejected** → reason card

All states show: a hero, service-area + duration card, and a "Message
Center" + (optional) "Withdraw" action stack at the bottom. Withdrawing
swaps the screen to a confirmation state.

---

## 1. Identity

| Property         | Value                                                       |
|------------------|-------------------------------------------------------------|
| **Route**        | `/(server)/applications/[id]` (hidden from tab bar)         |
| **Component**    | `app/(server)/applications/[id].tsx` default `ServerApplicationDetailScreen` |
| **Prototype**    | `ServerAppDetail` function, app.html 3173–3303              |
| **Status bar**   | `barStyle="light-content"` (dark hero)                      |
| **Param**        | `id: string` — looked up in `serverApplications`            |

Fallback to `serverApplications[0]` if id is missing/unknown.

`city` is **not** on the `ServerApplication` type — look it up from the matching `serverCourses` entry via `a.courseId`.

## 2. State

```ts
const [withdrawn, setWithdrawn] = useState(false);
const [confirming, setConfirming] = useState(false);
```

`withdrawn` swaps the entire screen to the success state. `confirming`
toggles the inline "Are you sure?" panel inside the action stack.

## 3. Layout overview

```
─ if withdrawn ────────────────────────────────────────────────────────
  Centred:
    🙏 (60px)
    Application Withdrawn (22 / 800 / sv-accent)
    "The center has been notified. You may apply again at any time."
    [View My Applications]    (gradient saffron CTA)

─ otherwise ──────────────────────────────────────────────────────────
  Hero (server gradient #5A3800 → #9B6B14, LotusHero, NO Mountain)
    ← Back
    [status pill]  Applied {date}
    Dhamma Shringa (22 / 800)
    Budhanilkantha, Kathmandu
    📅 Jul 7–18, 2026

  🌟 SERVICE AREAS
  ┌─ Card ────────────────────────────────────┐
  │ [🍳 Kitchen][🍽 Dining]                   │
  │ Duration: Full course                     │  (Duration value in
  └───────────────────────────────────────────┘   status-accent colour)

  ── status-specific section(s) ──
  approved:
    ✅ CONFIRMED
    ┌─ Card (fol bg, fom border) ─────────────┐
    │ Please arrive by: Jul 6, 7:00 AM        │
    │ Coordinator: Ramesh Adhikari · +977 …   │
    └─────────────────────────────────────────┘
    🎒 WHAT TO BRING
    ┌─ Card · 7 rows with dashed dividers ────┐
    │ 🪪  Government photo ID …                │
    │ ...                                      │
    └─────────────────────────────────────────┘
    🚌 REACHING THE CENTER
    ┌─ Card · journey body copy ──────────────┐
    └─────────────────────────────────────────┘

  pending:
    ┌─ Pending banner card ───────────────────┐ (svl bg, #E8C878 border)
    │ "Your application is under review…"     │
    └─────────────────────────────────────────┘

  rejected:
    ┌─ Reason card (url bg) ──────────────────┐
    │ Reason: <a.reason>                      │
    └─────────────────────────────────────────┘

  ── actions (always at bottom) ──
  [✉️ Message Center]                  (outline button, full width)
  if status !== 'rejected':
    [Withdraw Application]             (red outline button)
    when tapped → inline confirm panel:
      "Withdraw this application? …"
      [Cancel]  [Withdraw]
```

Tab bar is **hidden** on this route via `tabBarStyle: { display: 'none' }` in `(server)/_layout.tsx`.

## 4. Withdrawn success state

When `withdrawn === true`, the whole screen swaps to:

| Property        | Value                                                         |
|-----------------|---------------------------------------------------------------|
| Container       | `flex: 1`, `alignItems: 'center'`, `justifyContent: 'center'`, `padding: 28`, `backgroundColor: Colors.cr`, `textAlign: 'center'` |
| 🙏 emoji        | fontSize 60, marginBottom 16                                  |
| Title           | fontSize 22, fontWeight 800, color **`#9B6B14`** (server accent), marginBottom 8: `t('server.applicationDetail.withdrawn_title')` → `"Application Withdrawn"` / `"आवेदन फिर्ता गरियो"` |
| Body            | fontSize 13, color `Colors.tx2`, lineHeight 20.15, marginBottom 24, `maxWidth: 280`, textAlign center: `t('server.applicationDetail.withdrawn_body')` |
| CTA             | Full-width gradient button: `['#9B6B14', '#6B4610']` 135°, paddingVertical 15, radius 13, white text 15/700: `t('server.applicationDetail.view_apps')` ("View My Applications" / "मेरा आवेदनहरू हेर्नुहोस्") |
| CTA onPress     | `router.replace(Routes.serverApplications)` (no back-history into withdrawn state) |

Body copy:
- EN: `"The center has been notified. You may apply again at any time."`
- NE: `"केन्द्रलाई सूचित गरियो। तपाईंले फेरि कुनै पनि बेला आवेदन दिन सक्नुहुन्छ।"`

## 5. Hero

### 5.1 Gradient
- 2 stops `['#5A3800', '#9B6B14']`, 160° (same as course detail / apply screens)
- LotusHero `color="white" opacity={0.08} size={180}` — **no MountainSilhouette** (matches prototype)
- `paddingHorizontal: 18`, `paddingTop: Math.max(56, insets.top + 12)`, `paddingBottom: 22`

### 5.2 Back row
- Identical to course detail (spec 15): SVG arrow 18×18 strokeWidth 2.2 / stroke `rgba(255,255,255,0.85)` (note **0.85**, NOT 0.75 like the apply screen)
- marginBottom 12, gap 4
- onPress → `router.back()`

### 5.3 Status pill + applied row
`flexDirection: 'row'`, `alignItems: 'center'`, `gap: 10`, `marginBottom: 6`.

| Element        | Style                                                                                  |
|----------------|----------------------------------------------------------------------------------------|
| Status pill    | bg `rgba(255,255,255,0.22)`, color white, padding `4 11`, borderRadius 20, fontSize **11.5**, fontWeight 700 |
| Applied label  | fontSize 11, color `rgba(255,255,255,0.7)`: `"Applied {a.applied}"` / `"आवेदन {a.applied}"` |

Pill text reuses keys from spec 17: `t('server.applicationDetail.status.${a.status}')` — `"✓ Confirmed"` / `"⏳ Pending"` / `"Not Selected"`.

### 5.4 Title + sub
- Title — fontSize **22**, fontWeight 800, color white: `a.center`
- City line — fontSize 13, color `rgba(255,255,255,0.78)`: looked up from `serverCourses.find(c => c.id === a.courseId)?.city`. Render only if non-empty.
- Dates line — fontSize 13, color `rgba(255,255,255,0.78)`, marginTop 1: `📅 {a.dates}`

## 6. Service areas + duration card

### 6.1 Section header
- `.sph` with default margins (mt 18, mb 9)
- Text: `🌟 SERVICE AREAS` (i18n key `server.applicationDetail.service_areas`)
- Translates to: `"Service areas"` / `"सेवा क्षेत्र"`

### 6.2 Card
Standard `.card` with `margin: 0 18px` shorthand (no marginBottom). Same as spec 15's section-spacing convention.

### 6.3 Area chips
`flexDirection: 'row'`, `gap: 5`, `flexWrap: 'wrap'`, `marginBottom: 8`.

Each chip from `a.areas`:
- fontSize **11**, padding **3/9** (note: different from spec 17's 10/2-7 — this is bigger), borderRadius 20, bg `Colors.svl`, color `#9B6B14`, fontWeight 700
- Content: `${sa.emoji} ${sa.label}` (English labels)

### 6.4 Duration line
- fontSize 12, color `Colors.tx2`
- Format: `"Duration: <bold>{duration}</bold>"` where bold text uses `status-accent` colour:
  - approved → `Colors.fo`
  - pending → `#9B6B14`
  - rejected → `#B85040` (note: **not** `Colors.ur` — prototype uses a softer red here)
- Duration content: `a.partial ? "Partial · {a.days}" : "Full course"`
  - EN: `"Duration: Full course"` or `"Duration: Partial · Day 3-8"`
  - NE: `"अवधि: पूरा शिविर"` or `"अवधि: आंशिक · Day 3-8"`

In RN, achieve bold-coloured value with two `<Text>` nested: `<Text style={muted}>Duration: <Text style={[bold,{color:accent}]}>{duration}</Text></Text>`.

## 7. Status-specific section

### 7.1 Approved

#### 7.1.1 Confirmed banner
Section header: `✅ CONFIRMED` — `t('server.applicationDetail.confirmed')` ("Confirmed" / "पुष्टि भयो")

Card with `margin: 0 18px`:
- backgroundColor `Colors.fol` (forest light)
- borderWidth **1.5**, borderColor `Colors.fom` (forest medium)
- padding 15, radius 16 (base `.card` minus shadow override — prototype keeps shadow)

Contents:
- Line 1 — fontSize 12, color `Colors.tx2`, lineHeight 18.6 (×1.55): `"Please arrive by: <bold {color:Colors.fo}>{a.arriveBy}</bold>"`
- Line 2 — fontSize 11.5, color `Colors.tx2`, marginTop 4: `"Coordinator: <bold>{a.coordinator}</bold> · {a.coordPhone}"`

The bold inner text in the arrival line uses `Colors.fo` (forest). Coordinator's bold is default `Colors.tx`.

#### 7.1.2 What to bring (arrival checklist)
Section header: `🎒 WHAT TO BRING` — reuses `s_what_bring`.

Card with `margin: 0 18px`. Inside, 7 rows from the checklist:

| Icon | EN                                                        | NE                                                |
|------|-----------------------------------------------------------|----------------------------------------------------|
| 🪪   | Government photo ID (citizenship / passport)             | फोटो परिचयपत्र (नागरिकता / राहदानी)               |
| 👕   | 2 sets comfortable, modest clothing (white preferred)    | २ जोर सजिलो, मर्यादित लुगा (सेतो उत्तम)            |
| 🧣   | Warm shawl / light jacket for early mornings             | बिहानका लागि न्यानो शाल / पातलो ज्याकेट            |
| 🩴   | Closed shoes for outdoor / kitchen                       | बाहिरी / भान्साका लागि बन्द जुत्ता                |
| 🔦   | Flashlight or phone torch                                | टर्च वा मोबाइल टर्च                                |
| 💊   | Personal medications (full course supply)                | व्यक्तिगत औषधि (पूरा अवधिको)                       |
| 🚫   | NO phone use during course (will be deposited)           | शिविरमा फोन प्रयोग नहुने (जम्मा गरिनेछ)             |

Each row:
- `flexDirection: 'row'`, `gap: 10`, paddingVertical 7
- **Dashed bottom border on EVERY row** (prototype line 3244 — same as schedule rows in spec 15). Use shared `DashedDivider`.
- Icon cell — fontSize 18, width 24, textAlign center, flexShrink 0
- Body — fontSize 12.5, color `Colors.tx2`, lineHeight 17.5 (×1.4), flex 1

i18n: store as `server.applicationDetail.checklist.row_0` .. `row_6` (only the body string — icons stay as a constant in the component).

#### 7.1.3 Reaching the center
Section header: `🚌 REACHING THE CENTER` — reuses `s_journey`.

Card with `margin: 0 18px`:
- Body — fontSize 12.5, color `Colors.tx2`, lineHeight 19.4 (×1.55)
- EN: `"Detailed directions and pickup arrangements will be emailed by the center. Contact the coordinator one week before arrival to confirm transport."`
- NE: `"केन्द्रबाट विस्तृत निर्देशन र पिक-अप व्यवस्था इमेलमा पठाइनेछ। आइपुग्ने एक हप्ता अघि समन्वयकलाई सम्पर्क गर्नुहोस्।"`

### 7.2 Pending banner

Standalone card (no section header), with `margin: 14px 18px` (mt 14 — accounts for the absent sph above):
- backgroundColor `#FBF0E0` (Colors.svl)
- borderWidth 1, borderColor `#E8C878` (a soft gold — **not** in our token palette; inline literal)
- padding 15, radius 16
- Body — fontSize 12.5, color `#7A5008` (a dark amber — **not** in token palette; inline literal), lineHeight 18.75 (×1.5)
- EN: `"Your application is under review by the center coordinator. You'll be notified by email when a decision is made."`
- NE: `"तपाईंको आवेदन व्यवस्थापकद्वारा समीक्षाधीन छ। निर्णय भएपछि सूचित गरिनेछ।"`

### 7.3 Rejected reason card

Standalone card (no section header), with `margin: 14px 18px`:
- backgroundColor `Colors.url`
- padding 15, radius 16 (no custom border)
- Header — fontSize 11.5, fontWeight 700, color `Colors.ur`, marginBottom 3: `t('server.applicationDetail.reason')` → `"Reason:"` / `"कारण:"`
- Body — fontSize 12.5, color `Colors.ur`, lineHeight 18.1 (×1.45): `a.reason`

Spec 17 already has a `reason_lbl` key — reuse: `t('server.applications.reason_lbl')`. No new key needed.

## 8. Action stack (bottom)

Container: `paddingHorizontal: 18`, `paddingTop: 14`, `paddingBottom: 6`.

### 8.1 Message Center button
Outline button (reuse `.btn.ou` style):
- Background transparent
- borderWidth 2, borderColor `Colors.bd2`
- padding `13 22`, borderRadius 13
- Text fontSize 14, fontWeight 700, color `Colors.tx`
- Width 100%
- Text: `t('server.applicationDetail.message_admin')` → `"✉️ Message Center"` / `"✉️ केन्द्रलाई सन्देश"`
- onPress → `Alert.alert(t('common.coming_soon'))` (use existing key if present; otherwise inline)
- marginBottom 10

### 8.2 Withdraw button (status !== 'rejected' && !confirming)
Red outline:
- Background transparent
- borderWidth 1.5, borderColor `#E8B0A0` (soft red, **not** in token palette — inline)
- padding `13` (no horizontal — width 100%), borderRadius 13
- Text fontSize **13.5**, fontWeight 700, color `#B85040` (matches `accent` for rejected from §6.4)
- Width 100%
- Text: `t('server.applicationDetail.withdraw')` → `"Withdraw Application"` / `"आवेदन फिर्ता"`
- onPress → `setConfirming(true)`

### 8.3 Confirm panel (when `confirming === true`)
Replaces the Withdraw button. Container:
- backgroundColor `#FBE8E0` (soft red bg — inline)
- borderWidth 1.5, borderColor `#E8B0A0`
- padding 12, borderRadius 13

Inside:
- Confirmation copy — fontSize 12.5, color `#7A2A20`, marginBottom 10, lineHeight 17.5 (×1.4):
  - EN: `"Withdraw this application? The center will be notified."`
  - NE: `"यो आवेदन फिर्ता लिने? केन्द्रलाई सूचित गरिनेछ।"`
  - Key: `t('server.applicationDetail.withdraw_confirm')`
- Button row — `flexDirection: 'row'`, `gap: 8`
  - **Cancel** — `flex: 1`, padding 10, borderRadius 10, bg white, border `1px Colors.bd`, text fontSize 12.5, fontWeight 700, color `Colors.tx2`. onPress → `setConfirming(false)`.
  - **Withdraw** — `flex: 1`, padding 10, borderRadius 10, bg `#B85040`, color white, no border, same text size. onPress → `setWithdrawn(true); setConfirming(false)`.

Labels:
- Cancel — EN: `"Cancel"`, NE: `"रद्द"`
- Withdraw — EN: `"Withdraw"`, NE: `"फिर्ता गर्नुहोस्"`

## 9. Footer spacer

`<View style={{ height: 20 }} />` + `paddingBottom: insets.bottom + 8` on the ScrollView.

## 10. Hide bottom tab bar

Update `app/(server)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="applications/[id]"
  options={{ href: null, tabBarStyle: { display: 'none' } }}
/>
```
(Currently `href: null` only — add the style.)

## 11. i18n

New block under `server.applicationDetail.*`:

| Key                              | EN                                                                | NE                                                              |
|----------------------------------|-------------------------------------------------------------------|------------------------------------------------------------------|
| `applied_lbl`                    | Applied                                                           | आवेदन                                                            |
| `service_areas`                  | Service areas                                                     | सेवा क्षेत्र                                                     |
| `duration_lbl`                   | Duration:                                                         | अवधि:                                                            |
| `full_course`                    | Full course                                                       | पूरा शिविर                                                       |
| `partial_lbl`                    | Partial                                                           | आंशिक                                                            |
| `confirmed`                      | Confirmed                                                         | पुष्टि भयो                                                       |
| `arrive_by_lbl`                  | Please arrive by:                                                 | कृपया आइपुग्नुहोस्:                                              |
| `coordinator_lbl`                | Coordinator:                                                      | समन्वयक:                                                         |
| `what_bring`                     | What to bring                                                     | के ल्याउने                                                       |
| `journey`                        | Reaching the Center                                               | केन्द्र पुग्ने बाटो                                              |
| `journey_body`                   | Detailed directions and pickup arrangements will be emailed by the center. Contact the coordinator one week before arrival to confirm transport. | केन्द्रबाट विस्तृत निर्देशन र पिक-अप व्यवस्था इमेलमा पठाइनेछ। आइपुग्ने एक हप्ता अघि समन्वयकलाई सम्पर्क गर्नुहोस्। |
| `pending_body`                   | Your application is under review by the center coordinator. You'll be notified by email when a decision is made. | तपाईंको आवेदन व्यवस्थापकद्वारा समीक्षाधीन छ। निर्णय भएपछि सूचित गरिनेछ। |
| `reason`                         | Reason:                                                           | कारण:                                                            |
| `message_admin`                  | ✉️ Message Center                                                 | ✉️ केन्द्रलाई सन्देश                                            |
| `withdraw`                       | Withdraw Application                                              | आवेदन फिर्ता                                                     |
| `withdraw_confirm`               | Withdraw this application? The center will be notified.          | यो आवेदन फिर्ता लिने? केन्द्रलाई सूचित गरिनेछ।                  |
| `cancel`                         | Cancel                                                            | रद्द                                                             |
| `withdraw_short`                 | Withdraw                                                          | फिर्ता गर्नुहोस्                                                 |
| `withdrawn_title`                | Application Withdrawn                                             | आवेदन फिर्ता गरियो                                                |
| `withdrawn_body`                 | The center has been notified. You may apply again at any time.   | केन्द्रलाई सूचित गरियो। तपाईंले फेरि कुनै पनि बेला आवेदन दिन सक्नुहुन्छ। |
| `view_apps`                      | View My Applications                                              | मेरा आवेदनहरू हेर्नुहोस्                                          |
| `coming_soon`                    | Messaging coming soon                                             | सन्देश सुविधा छिट्टै आउँदैछ                                      |
| `status.approved`                | ✓ Confirmed                                                       | ✓ पुष्टि                                                         |
| `status.pending`                 | ⏳ Pending                                                        | ⏳ विचाराधीन                                                     |
| `status.rejected`                | Not Selected                                                      | छनोट भएन                                                         |
| `checklist.row_0`                | Government photo ID (citizenship / passport)                     | फोटो परिचयपत्र (नागरिकता / राहदानी)                              |
| `checklist.row_1`                | 2 sets comfortable, modest clothing (white preferred)            | २ जोर सजिलो, मर्यादित लुगा (सेतो उत्तम)                          |
| `checklist.row_2`                | Warm shawl / light jacket for early mornings                     | बिहानका लागि न्यानो शाल / पातलो ज्याकेट                          |
| `checklist.row_3`                | Closed shoes for outdoor / kitchen                                | बाहिरी / भान्साका लागि बन्द जुत्ता                              |
| `checklist.row_4`                | Flashlight or phone torch                                         | टर्च वा मोबाइल टर्च                                              |
| `checklist.row_5`                | Personal medications (full course supply)                        | व्यक्तिगत औषधि (पूरा अवधिको)                                     |
| `checklist.row_6`                | NO phone use during course (will be deposited)                   | शिविरमा फोन प्रयोग नहुने (जम्मा गरिनेछ)                          |

Existing reusable keys to leverage:
- `common.back` (back row label)

## 12. Behaviour

| Trigger                       | Action                                                         |
|-------------------------------|----------------------------------------------------------------|
| Tap Back                      | `router.back()`                                                |
| Tap Message Center            | `Alert.alert(t('server.applicationDetail.coming_soon'))`       |
| Tap Withdraw Application      | `setConfirming(true)`                                          |
| Tap Cancel (in confirm)       | `setConfirming(false)`                                         |
| Tap Withdraw (in confirm)     | `setWithdrawn(true); setConfirming(false)`                     |
| Tap View My Applications (success) | `router.replace(Routes.serverApplications)`               |

Withdrawing does **not** mutate `serverApplications` data — for v1 it's a local-state-only flow. Backend wiring is out of scope.

## 13. Things being omitted vs prototype

| Prototype style                                | RN decision                                            |
|------------------------------------------------|--------------------------------------------------------|
| `cursor: 'pointer'`                            | TouchableOpacity activeOpacity                          |
| `<button>` HTML semantics                      | TouchableOpacity + Text                                |
| `border-bottom: 1px dashed var(--bd)`          | Shared `DashedDivider`                                  |
| `:active { transform: scale(.96) }`            | Opacity feedback only                                   |
| Native `alert()` for "coming soon"             | `Alert.alert()` from react-native                       |

### 13.1 Other small details to preserve

- Back-arrow stroke is `rgba(255,255,255,0.85)` (matches course detail) — **not** the apply screen's 0.75.
- Status pill in this hero uses bg `rgba(255,255,255,0.22)` (slightly more opaque than course detail's `0.2`).
- Title is fontSize **22** (matches apply screen; course detail uses 23). Subtle but worth keeping.
- Area chip on this screen is **larger**: 11px text, **3/9** padding, fontWeight 700 (compare to spec 17's 10/2-7/600).
- Duration line's bold value picks its colour from the status accent — including `#B85040` (softer red) for rejected, NOT `Colors.ur`.
- Approved-banner card uses `borderWidth: 1.5` (not 1 like the pending banner). Both keep shadow.
- Pending banner colours (`#FBF0E0` bg / `#E8C878` border / `#7A5008` text) are inline literals — not promoted to the global colour token set yet because they only appear here.
- "Withdraw" button bottom-left has padding `13` (vertical-only) since width is 100%. Border 1.5px is `#E8B0A0`.
- Confirm panel's confirm button is solid `#B85040` (matches rejected accent) — not gradient. Cancel button is plain white with 1px `Colors.bd` border (lighter than the surrounding panel's 1.5px).
- Withdrawn success title uses `#9B6B14` (server saffron), not forest green — unlike the apply submit success which uses forest. Confirmed via prototype line 3192.
- `paddingBottom: 6` on the action container is intentionally tight — the 20px footer spacer below adds the breathing room.

## 14. Acceptance checklist

### Withdrawn success state
- [ ] 🙏 60px, title 22/800 colour `#9B6B14`
- [ ] Body maxWidth 280 with center-of-notice copy
- [ ] CTA gradient `#9B6B14 → #6B4610` 135°, `router.replace` to applications list

### Hero
- [ ] 2-stop server gradient, LotusHero only
- [ ] Back arrow stroke `rgba(255,255,255,0.85)` strokeWidth 2.2
- [ ] Status pill bg `rgba(255,255,255,0.22)` fontSize 11.5 weight 700 + applied label `Applied {date}` 11/.7
- [ ] Title fontSize 22, city + dates lines colour `rgba(255,255,255,0.78)`
- [ ] `📅` prefixes the dates line

### Service-areas card
- [ ] section header `🌟 SERVICE AREAS`
- [ ] Card margin `0 18px` (no marginBottom)
- [ ] Chips: 11px text, padding 3/9, weight 700
- [ ] Duration line: 12/tx2 with bold value in status-accent colour (`fo`/`#9B6B14`/`#B85040`)

### Approved sections
- [ ] Confirmed banner: `fol` bg + 1.5px `fom` border + arrive-by line with `fo` bold value + coordinator line with default-tx bold name + phone
- [ ] What-to-bring card: 7 rows with `DashedDivider` between each (including after last)
- [ ] Reaching-the-center card: single body paragraph

### Pending banner
- [ ] Inline literal colours `#FBF0E0`/`#E8C878`/`#7A5008`
- [ ] Margin `14px 18px` (no sph header above)

### Rejected reason card
- [ ] `url` bg, no border, header `Reason:` 11.5/700/ur + body 12.5/ur
- [ ] Margin `14px 18px`

### Actions
- [ ] Message Center: outline 2px `bd2`, paddingVertical 13, fontSize 14
- [ ] Withdraw button: 1.5px `#E8B0A0` border, transparent bg, text `#B85040` 13.5/700
- [ ] Confirm panel replaces Withdraw button; `#FBE8E0` bg, copy 12.5/`#7A2A20`, Cancel (white/border) + Withdraw (solid `#B85040`)
- [ ] Tap Withdraw confirm → swap to withdrawn success state

### Cross-cutting
- [ ] Tab bar hidden on this route
- [ ] No TS errors
- [ ] Reuses `common.back` i18n key
