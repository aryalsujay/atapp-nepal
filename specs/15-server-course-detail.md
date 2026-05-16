---
id: 15-server-course-detail
title: Server Course Detail
route: /(server)/opportunities/[id]
prototype: VipassanaTeacherApp/app.html:3082–3170
status: draft
related: [14-server-opportunities, 16-server-apply]
---

# 15 · Server Course Detail

The full detail page for a single course, reached by tapping a course
card in spec 14 (or "View Details →"). Shows everything a Server needs
to decide before applying: dates / type, occupancy, about-the-course
copy, daily schedule, available service areas, expectations, and the
single big "Apply to Serve →" CTA at the bottom.

---

## 1. Identity

| Property         | Value                                                       |
|------------------|-------------------------------------------------------------|
| **Route**        | `/(server)/opportunities/[id]` (hidden from tab bar)       |
| **Component**    | `app/(server)/opportunities/[id].tsx` default export `ServerCourseDetailScreen` |
| **Prototype**    | `ServerCourseDetail` function, app.html 3082–3170           |
| **Status bar**   | `barStyle="light-content"` (hero is dark gradient)          |
| **Safe area**    | Top inset added to hero `paddingTop`                        |
| **Param**        | `id: string` — looked up in `serverCourses` by numeric id   |

If the id is unknown, fall back to `serverCourses[0]` (matches prototype's `course || serverCourses[0]`).

## 2. Layout (top → bottom)

```
┌───────────────────────────────────────────────────────────────────────┐
│  Hero (server gradient, 2 stops — #5A3800 → #9B6B14)                  │
│   ← Back                                                              │
│   10-Day · 11 days                                                    │
│   Dhamma Shringa                                       (23 / 800)     │
│   Budhanilkantha, Kathmandu 🇳🇵                                       │
│   [ 📅 Jul 7–18, 2026 ] [ 8 open ]   (white-glass pills)              │
├───────────────────────────────────────────────────────────────────────┤
│  ┌─ Server intake card ────────────────────────────────────────────┐  │
│  │ Server intake             14/22 · 12M + 10F                     │  │
│  │ ─────── progress ──────                                         │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  📖 ABOUT THIS COURSE                                                 │
│  ┌─ Card · about copy ────────────────────────────────────────────┐  │
│  │ "Serve this 11-day course at Dhamma Shringa. Servers practice…" │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ⏰ TYPICAL DAILY SCHEDULE                                            │
│  ┌─ Card · 7 rows, dashed dividers between ────────────────────────┐  │
│  │ 4:00 AM   Wake-up bell                                          │  │
│  │ 4:30 AM   Meditation / service prep                             │  │
│  │ … (7 rows total)                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  🌟 SERVICE AREAS OPEN                                                │
│  [🍳 Kitchen][🍽 Dining][🔔 Dhamma]… (all chips, no card wrapper)    │
│  💡 WHAT TO EXPECT                                                    │
│  ┌─ Card · 3 bullets ─────────────────────────────────────────────┐  │
│  │ • Server accommodation provided · separate from students       │  │
│  │ • 3 meals + tea · same as students (vegetarian)                │  │
│  │ • Servers maintain Noble Silence except in service areas       │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  [          Apply to Serve →          ] (gradient CTA, full width)    │
│  (20px footer)                                                        │
└───────────────────────────────────────────────────────────────────────┘
```

This screen is rendered **without the bottom tab bar** (hidden via per-screen `tabBarStyle: { display: 'none' }` in `(server)/_layout.tsx`).

## 3. Data

```ts
const { id } = useLocalSearchParams<{ id: string }>();
const numericId = Number(id);
const c = serverCourses.find((x) => x.id === numericId) ?? serverCourses[0];
const open = c.total - c.filled;
const pct = c.total > 0 ? Math.round((c.filled / c.total) * 100) : 0;
```

## 4. Hero

### 4.1 Gradient
```ts
colors = ['#5A3800', '#9B6B14']         // 2 stops (not 3 like dashboard)
start  = { x: 0, y: 0 }
end    = { x: 0.671, y: 0.97 }          // 160°
```

Layered decorations (under hero text):
- `<LotusHero color="white" opacity={0.08} size={180} />` (smaller than dashboard's 210, no right/bottom offsets)
- `<MountainSilhouette />`

### 4.2 Hero padding
- `paddingHorizontal: 18`
- `paddingTop: Math.max(56, insets.top + 12)`
- `paddingBottom: 22`
- `overflow: 'hidden'`, `position: 'relative'`

### 4.3 Back row
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 4`, `marginBottom: 12`
- Tappable (entire row, `hitSlop: 8`)
- Back arrow SVG: 18×18, stroke `rgba(255,255,255,0.85)`, strokeWidth 2.2 — `Icons.Back` path `M15 18L9 12L15 6`
- Label: `"Back"` / `"पछाडि"` — fontSize 13, color `rgba(255,255,255,0.85)`
- onPress → `router.back()`

The back text is a hard-coded literal (prototype): `lang==="np"?"पछाडि":"Back"`. Add an i18n key `common.back` (or reuse existing if present).

### 4.4 Title block
- Kicker — fontSize 13, color `rgba(255,255,255,0.7)`: `"{c.type} · {c.days} days"` — `days` is **English literal in both languages** in prototype.
  - Wait — actually the prototype uses `lang==="np"?"दिन":"days"` here (line 3097). So `days` DOES translate. Differs from spec 14's `· {days} days` which was English-only. Worth keeping in i18n.
- Title — fontSize 23, fontWeight 800, color white, marginTop 2: `c.center`
- City — fontSize 13, color `rgba(255,255,255,0.78)`: `c.city`

### 4.5 Hero pills
Row, `gap: 8`, `marginTop: 14`. Two glass pills:

| Pill                | Text                              | Style                                                                  |
|---------------------|-----------------------------------|------------------------------------------------------------------------|
| Date pill           | `📅 {c.dates}`                    | `rgba(255,255,255,0.2)` bg, white text, padding `4 11`, radius 20, fontSize 12, fontWeight 600 |
| Open-count pill     | `{open} {open_short}`             | Same as above. `open_short` = "open" / "खुला"                          |

## 5. Server intake card

Standard `.card` with `marginTop: 14` (overrides default `marginTop: 0`). Other dimensions unchanged (`padding: 15`, `borderRadius: 16`, `marginHorizontal: 18`, `marginBottom: 11`, shadow).

### 5.1 Top row
`flexDirection: 'row'`, `alignItems: 'center'`, `justifyContent: 'space-between'`, `marginBottom: 8`.

- Left — fontSize 13, fontWeight 700, color `Colors.tx`: `t('server.detail.intake')` ("Server intake" / "सेवक भर्ती")
- Right — fontSize 11, color `Colors.tx3`: `"{c.filled}/{c.total} · {c.mServers}M + {c.fServers}F"` (English literals for `M`/`F`)

### 5.2 Progress bar
- height 7 (note: **larger than 5** on dashboard/opportunities), background `Colors.cr3`, borderRadius 4, overflow hidden
- Fill: `width: {pct}%`, full height, no separate borderRadius (full overflow already clipped). Colour thresholds match prototype: `pct > 80 ? ur : pct > 50 ? #9B6B14 : fo`.

## 5.3 Section-spacing convention

The About / Daily-schedule / What-to-Expect cards use prototype CSS shorthand `style={{ margin: "0 18px" }}` which **overrides the base `.card`'s `margin: 0 18px 11px`** — collapsing `marginBottom` to **0**. The Server-intake card does NOT use this override (it keeps `marginBottom: 11`).

Effect: between section header (`sph`) and the next card, the spacing math is:

```
card (marginBottom 0)  ↓
sph (marginTop 18, marginBottom 9)
next card (top edge)
```

So **24px** of breathing room between any two sections (no card-to-sph gap, just sph's vertical margins). Match this in RN:

| Card                          | `marginHorizontal` | `marginBottom` |
|-------------------------------|---------------------|----------------|
| Server intake                 | 18                  | 11             |
| About                         | 18                  | **0**          |
| Daily schedule                | 18                  | **0**          |
| What to expect                | 18                  | **0**          |

## 6. About section

Section header (`sph`): `📖 ABOUT THIS COURSE` (uppercase via `textTransform`).

Card with `marginHorizontal: 18`, `marginBottom: 0` (see §5.3). All other `.card` props unchanged.

Body — fontSize 13, color `Colors.tx2`, `lineHeight: 13 * 1.55 ≈ 20.15`:
- EN: `Serve this ${c.days}-day course at ${c.center}. Servers practice meditation alongside students while attending to their needs in selected areas.`
- NE: `यो ${c.days}-दिने शिविरमा सेवा गर्ने अवसर। साधकहरूको सेवामा तपाईंको योगदानले धम्मलाई फैलाउँछ।`

Use `t('server.detail.about_body', { days: c.days, center: c.center })`. The Nepali template doesn't interpolate `center`, only `days` — that's fine, i18next supports missing variables.

## 7. Daily schedule section

Section header: `⏰ TYPICAL DAILY SCHEDULE`.

Card with `marginHorizontal: 18`. Inside, 7 schedule rows:

| Hour     | Activity (EN)                  | Activity (NE)               |
|----------|--------------------------------|------------------------------|
| 4:00 AM  | Wake-up bell                   | उठ्ने घण्टी                  |
| 4:30 AM  | Meditation / service prep      | साधना / सेवा तयारी           |
| 6:30 AM  | Breakfast service              | बिहानको खाजा                 |
| 11:00 AM | Main meal service              | मुख्य भोजन                   |
| 5:00 PM  | Tea & fruit (servers eat)      | चिया र फलफूल                 |
| 7:00 PM  | Evening discourse              | साँझको प्रवचन                |
| 9:30 PM  | Rest                           | विश्राम                      |

Each row:
- `flexDirection: 'row'`, `gap: 12`, paddingVertical 7
- **Dashed bottom border on EVERY row (including the last)** — prototype applies `border-bottom: 1px dashed var(--bd)` uniformly with no last-child exception. Render with shared `DashedDivider` below each row.
- Hour cell: fontSize 12, fontWeight 700, color `#9B6B14`, width 72, `flexShrink: 0`
- Activity cell: fontSize 12, color `Colors.tx2`, `flex: 1` (so long Nepali activity text can wrap inside the row)

> Times are **literal English** in both languages (prototype hard-codes `"4:00 AM"` etc.). We store them as plain strings, not i18n.

## 8. Service areas open

Section header: `🌟 SERVICE AREAS OPEN`.

**No card wrapper** — just a chip row directly in the page background:
- `paddingHorizontal: 18`, `flexDirection: 'row'`, `gap: 6`, `flexWrap: 'wrap'`, `marginBottom: 6`
- Each chip from `c.areas` (looked up in `SERVICE_AREAS`):
  - fontSize 11 (note: **larger than 10** on dashboard/opportunities cards), padding `5 10`, borderRadius 20, background `#FBF0E0` (Colors.svl), color `#9B6B14`, fontWeight 700
  - Content: `${sa.emoji} ${sa.label}` (English label always)

The chip-section's `marginBottom: 6` plus the next `sph`'s `marginTop: 18` gives 24px before the "What to Expect" header — same rhythm as card-to-section transitions.

## 9. What to Expect section

Section header: `💡 WHAT TO EXPECT`.

Card with `marginHorizontal: 18`. Three bulleted rows:

| Bullet text key            | EN                                                            | NE                                                  |
|----------------------------|---------------------------------------------------------------|------------------------------------------------------|
| `expect_dorm`              | Server accommodation provided · separate from students       | सेवकहरूका लागि छुट्टै आवास उपलब्ध                   |
| `expect_food`              | 3 meals + tea · same as students (vegetarian)                | ३ खाना + चिया · विद्यार्थीहरूकै जस्तै (शाकाहारी)    |
| `expect_rules`             | Servers maintain Noble Silence except in service areas       | सेवा क्षेत्र बाहेक आर्य मौनको पालना                 |

Each row:
- `flexDirection: 'row'`, `gap: 10`, paddingVertical 7
- **No dividers between bullets** (unlike daily schedule rows). Visual separation comes from paddingVertical alone.
- Bullet glyph `<Text>•</Text>` — fontSize 14, color `#9B6B14`. Wrap in a fixed-width or auto column; baseline-align with `alignItems: 'flex-start'` so the bullet doesn't shift when the text wraps.
- Text — fontSize 12.5, color `Colors.tx2`, `lineHeight: 12.5 * 1.45 ≈ 18.1`, `flex: 1`

## 10. Apply CTA

Bottom button, **outside any card**, full width:

| Property         | Value                                                            |
|------------------|------------------------------------------------------------------|
| Container        | `paddingHorizontal: 18`, `paddingTop: 18`, `paddingBottom: 8`    |
| Background       | Gradient `['#9B6B14', '#6B4610']` at 135° (server CTA gradient)  |
| Width            | 100% of padded area                                              |
| Height           | `paddingVertical: 15`                                            |
| Border           | none                                                             |
| Border radius    | 13                                                               |
| Text             | fontSize 15, fontWeight 700, color white                          |
| Text             | `t('server.opportunities.apply_serve')` (reuse — `"Apply to Serve →"` / `"सेवाका लागि आवेदन →"`) |
| onPress          | `router.push(routeTo.serverApply(c.id))`                         |

Reuse the i18n key from spec 14 — no new key needed.

## 11. Footer spacer

`<View style={{ height: 20 }} />` plus `paddingBottom: insets.bottom + 8` on ScrollView content. The CTA is **inside** the ScrollView (matches prototype's flat layout — not a sticky bottom bar).

## 12. Behaviour

| Trigger              | Action                                              |
|----------------------|-----------------------------------------------------|
| Tap Back             | `router.back()`                                     |
| Tap Apply to Serve → | `router.push(routeTo.serverApply(c.id))`            |

## 13. Hide bottom tab bar

Add to `app/(server)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="opportunities/[id]"
  options={{ href: null, tabBarStyle: { display: 'none' } }}
/>
```
The existing layout already hides it via `href: null` — we add `tabBarStyle: { display: 'none' }` so the tab bar doesn't bleed under the CTA. (Same trick used on onboarding screen, spec 12.)

## 14. i18n

New keys under `server.detail.*`:

| Key                | EN                                       | NE                                          |
|--------------------|------------------------------------------|---------------------------------------------|
| `back`             | Back                                     | पछाडि                                       |
| `days_suffix`      | days                                     | दिन                                         |
| `open_short`       | open                                     | खुला                                        |
| `intake`           | Server intake                            | सेवक भर्ती                                  |
| `about`            | About this course                        | यस शिविरको बारेमा                           |
| `about_body`       | Serve this {{days}}-day course at {{center}}. Servers practice meditation alongside students while attending to their needs in selected areas. | यो {{days}}-दिने शिविरमा सेवा गर्ने अवसर। साधकहरूको सेवामा तपाईंको योगदानले धम्मलाई फैलाउँछ। |
| `daily_schedule`   | Typical daily schedule                   | दैनिक तालिका                                |
| `areas_open`       | Service areas open                       | उपलब्ध सेवा क्षेत्रहरू                      |
| `what_expect`      | What to expect                           | के अपेक्षा गर्ने                            |
| `expect_dorm`      | Server accommodation provided · separate from students | सेवकहरूका लागि छुट्टै आवास उपलब्ध    |
| `expect_food`      | 3 meals + tea · same as students (vegetarian) | ३ खाना + चिया · विद्यार्थीहरूकै जस्तै (शाकाहारी) |
| `expect_rules`     | Servers maintain Noble Silence except in service areas | सेवा क्षेत्र बाहेक आर्य मौनको पालना |

Schedule rows are stored as a const array in the component (not i18n) — they're small, structural data; localizing keeps them paired with their hour labels.

Actually — schedule activities **do** vary by language in the prototype. Put them under `server.detail.schedule.row_0`..`row_6` (or use a single key with the row list as `returnObjects: true`). Decision: **separate keys per row** for simplicity:

| Key                  | EN                          | NE                          |
|----------------------|-----------------------------|-----------------------------|
| `schedule.row_0`     | Wake-up bell                | उठ्ने घण्टी                  |
| `schedule.row_1`     | Meditation / service prep   | साधना / सेवा तयारी           |
| `schedule.row_2`     | Breakfast service           | बिहानको खाजा                 |
| `schedule.row_3`     | Main meal service           | मुख्य भोजन                   |
| `schedule.row_4`     | Tea & fruit (servers eat)   | चिया र फलफूल                 |
| `schedule.row_5`     | Evening discourse           | साँझको प्रवचन                |
| `schedule.row_6`     | Rest                        | विश्राम                      |

Hours stay as a fixed const in the component (not localized).

### 14.1 Other small details to preserve

- The middle-dot `·` in the hero kicker (`{type} · {days} days`) and intake card meta (`{filled}/{total} · {M}M + {F}F`) is U+00B7, not `•`.
- Hero pill text content has a space between number and word: `8 open` (not `8open`); same for `📅 Jul 7–18, 2026` (space after the emoji).
- Hero LotusHero `size={180}` rendered with **no `right` / `bottom` offsets** (default origin = top-left of hero), which positions it differently from the dashboard's offset-bottom version.
- Server-intake progress bar height is **7** (vs 5 on dashboard/list cards). It does **not** add a `borderRadius` on the fill since the parent's `overflow: 'hidden'` + outer borderRadius 4 already clip.
- Service-area chips on this screen use fontSize **11**, padding **5×10**, fontWeight **700** — visually heavier than the 10/2×7/600 chips in opportunity cards.
- "What to Expect" bullet glyph is fontSize 14 while text is 12.5 — slightly larger than the text it leads, intentional for visual weight.
- The Apply CTA's container padding (`18 18 8`) has asymmetric vertical: 18 top, 8 bottom. The trailing 20px footer spacer compounds to ~28px total below the button.
- Status bar stays `light-content` for the whole scroll — even when scrolled past the hero. Matches prototype which doesn't toggle on scroll.

## 15. Things being omitted vs prototype

| Prototype style              | RN decision                                         |
|------------------------------|------------------------------------------------------|
| `cursor: 'pointer'`          | `TouchableOpacity activeOpacity={0.85}`              |
| `border-bottom: 1px dashed`  | Use existing `DashedDivider` component (RN's `borderStyle: 'dashed'` is broken) |
| `backdropFilter`             | Not used here — prototype's hero pills use opaque alpha which renders fine |

## 16. Acceptance checklist

### Hero
- [ ] 2-stop gradient `#5A3800 → #9B6B14` at 160°
- [ ] LotusHero `size={180}` (smaller than dashboard's 210), no right/bottom offsets
- [ ] Back row with `← Back` SVG + label, taps go to `router.back()`
- [ ] Kicker `{type} · {days} days` — `days` translates ("days" / "दिन")
- [ ] Title 23/800, sub city 13 with country flag
- [ ] Two glass pills: date + open count (`{n} open` / `{n} खुला`)

### Intake card
- [ ] `marginTop: 14` (separates from hero)
- [ ] Title 13/700 + right meta 11/`tx3`
- [ ] Progress bar height **7** (not 5), thresholds 80/50 same as dashboard

### About
- [ ] sph header `📖 About this course` (uppercase)
- [ ] Body 13/`tx2` lineHeight 20.15 with `{days}` substituted

### Daily schedule
- [ ] 7 rows, each `gap: 12`, paddingVertical 7
- [ ] Hour cell width 72, color `#9B6B14`, weight 700, fontSize 12
- [ ] DashedDivider between rows, none after last
- [ ] Activity text 12/`tx2` translates per language

### Service areas
- [ ] No card wrapper — chips render directly
- [ ] Chips fontSize **11** / padding 5 10 / weight 700 (slightly bigger than card chips)

### What to expect
- [ ] 3 bullets with `•` glyph in `#9B6B14`
- [ ] Text 12.5/`tx2` lineHeight 18.1

### CTA
- [ ] Full-width gradient `#9B6B14 → #6B4610` at 135°
- [ ] Height via paddingVertical 15, borderRadius 13
- [ ] Reuses `server.opportunities.apply_serve` i18n key
- [ ] Tap navigates to `routeTo.serverApply(c.id)`

### Cross-cutting
- [ ] Tab bar hidden when this screen is active
- [ ] Status bar light content over the dark hero
- [ ] No TypeScript errors
