---
id: 26-admin-calendar
title: Admin Calendar
route: /(admin)/calendar
prototype: VipassanaTeacherApp/app.html:2430–2484
status: draft
related: [21-admin-dashboard, 25-admin-auto-schedule]
---

# 26 · Admin Calendar

The Centre Manager's "Calendar" tab — month-by-month view of all
scheduled courses. Header has prev/next month navigation; a colour
legend identifies course types; a horizontal day-strip shows the
month at a glance with coloured cells per active course; event cards
list each scheduled course; an "Unscheduled" warning card at the
bottom links to Auto-Schedule for the gap.

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/calendar` (tab 4 — `CalendarIcon`)               |
| **Component**    | `app/(admin)/calendar.tsx` default `AdminCalendarScreen`   |
| **Prototype**    | `AdminCal` function, app.html 2430–2484                     |
| **Status bar**   | `barStyle="dark-content"` (light page)                     |

## 2. State

```ts
const [mo, setMo] = useState(6); // 0-indexed; initial = July
```

Prev/next buttons clamp to `[0, 11]`.

## 3. Data

### 3.1 Month names

```ts
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_NE = ['जनवरी','फेब्रुअरी','मार्च','अप्रिल','मे','जुन','जुलाई','अगस्ट','सेप्टेम्बर','अक्टोबर','नोभेम्बर','डिसेम्बर'];
```

### 3.2 Events (hard-coded, all in July per prototype's `mo: 6` demo)

```ts
const EVENTS = [
  { day: 7,  len: 11, center: 'Dhamma Shringa 🇳🇵', type: '10-Day', teacher: 'B. Ananda', color: Colors.fo  },
  { day: 15, len: 11, center: 'Dhamma Pokhara 🇳🇵', type: '10-Day', teacher: 'K. Gurung',  color: Colors.sf  },
  { day: 3,  len: 11, center: 'Dhamma Adhara 🇳🇵',  type: '10-Day', teacher: 'A. Mehta',   color: Colors.bl  },
  { day: 20, len: 21, center: 'Dhamma Shringa 🇳🇵', type: '20-Day', teacher: 'G. Thapa',   color: Colors.sfd },
];
```

Prototype renders these regardless of `mo` value — v1 matches that behavior (no month filter).

## 4. Layout overview

```
┌──────────────────────────────────────────────────────────────────┐
│ Header (white)                                                    │
│   Course Calendar              (26/800)                           │
│   [ ‹ ]            July 2026             [ › ]                   │
├──────────────────────────────────────────────────────────────────┤
│   ■ 10-Day   ■ Children's   ■ Satipatthana   ■ Unscheduled       │
├──────────────────────────────────────────────────────────────────┤
│  ┌─ Day strip card ───────────────────────────────────────────┐  │
│  │  1  2  3  4 ... 31  (horizontal scroll, 17×17 coloured)    │  │
│  └────────────────────────────────────────────────────────────┘  │
│  4 COURSES IN JULY                                                │
│  ┌─ Event card · 4px left-border ─────────────────────────────┐  │
│  │ Dhamma Shringa 🇳🇵                          [🪷 38 tile]   │  │
│  │ 10-Day · Day 7–17                                          │  │
│  │ 👤 B. Ananda                                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ... (4 cards)                                                    │
│  ┌─ Unscheduled banner (url bg) ──────────────────────────────┐  │
│  │ ⚠ Unscheduled                                              │  │
│  │ Dhamma Shringa — 30-Day (Dec 1–30) · No AT assigned        │  │
│  │ [⚡ Run Auto-Schedule]                                     │  │
│  └────────────────────────────────────────────────────────────┘  │
│ (20px footer)                                                     │
└──────────────────────────────────────────────────────────────────┘
              ┌─ Bottom Tab Bar (visible) ─┐
```

## 5. Header

White panel, padding `56 18 14`. Top inset.

### 5.1 Title
- fontSize 26, fontWeight 800, color `Colors.tx`: `t('admin.calendar.title')` ("Course Calendar" / "पाठ्यक्रम पात्रो")

### 5.2 Month nav row
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 11`, `marginTop: 10`
- `‹` button — `.btn.ou.sm`: transparent, 2px `Colors.bd2`, color `Colors.tx`, padding `7 15` (sm base), borderRadius 10, fontSize 12.5, fontWeight 700. Disabled-styled when `mo === 0` (opacity 0.5).
- Centre — `flex: 1`, textAlign center: fontSize 16, fontWeight 700, color `Colors.tx`. Text: `"{MONTHS[mo]} 2026"`
- `›` button — same as `‹`, opacity 0.5 when `mo === 11`.

## 6. Legend row

- Container: `paddingHorizontal: 18`, `paddingTop: 6`, `paddingBottom: 4`
- `flexDirection: 'row'`, `flexWrap: 'wrap'`, `gap: 9`

Four legend items (`flexDirection: 'row'`, `alignItems: 'center'`, `gap: 5`):

| Colour swatch | Label                                       |
|---------------|---------------------------------------------|
| `Colors.fo`   | `"10-Day"` (English literal)                |
| `Colors.bl`   | `"Children's"`                              |
| `Colors.sf`   | `"Satipatthana"`                            |
| `Colors.ur`   | `"Unscheduled"`                             |

Swatch — `width: 10`, `height: 10`, `borderRadius: 2`, `backgroundColor: c`.

Label — fontSize 10.5, color `Colors.tx2`.

## 7. Day strip card

Card with `margin: '8 18 0'`, `backgroundColor: Colors.white`, `borderRadius: 16`, `paddingHorizontal: 12`, `paddingVertical: 14`, shadow.

Inside, horizontal scroll: `gap: 1.5`, `paddingBottom: 4`.

For each day 1..31:
- Wrapper: `flexDirection: 'column'`, `alignItems: 'center'`, `gap: 2`, `minWidth: 21`
- Day number — fontSize 8, color `Colors.tx3`, fontWeight 500
- Cell — `width: 17`, `height: 17`, `borderRadius: 4`:
  - If an event covers this day (`d >= e.day && d < e.day + e.len`): `backgroundColor: e.color`, `opacity: 1`
  - Else: `backgroundColor: Colors.cr3`, `borderWidth: 1`, `borderColor: Colors.bd`, `opacity: 0.6`

## 8. Section header

`.sph` with `marginTop: 14` override.

Text: `"{n} courses in {Month}"` — English: `"{n} courses in {Jul}"`, Nepali: `"{n} शिविरहरू {जुलाई}"` (translation flips word order).

In RN render as two `<Text>` nodes inline, or use interpolation: `t('admin.calendar.courses_in_month', { count, month })`.

`count = EVENTS.length` (4); `month = MONTHS[mo]`.

## 9. Event cards

For each event, standard `.card` with `borderLeftWidth: 4`, `borderLeftColor: e.color`.

### 9.1 Layout
- `flexDirection: 'row'`, `justifyContent: 'space-between'`, `alignItems: 'flex-start'`

Left (`flex: 1`, paddingRight 8):
- Centre — fontSize 14, fontWeight 700, color `Colors.tx`: `e.center` (with flag suffix)
- Type + day range — fontSize 12.5, color `Colors.tx2`: `"{type} · Day {start}–{end}"`
- Teacher — fontSize 11.5, color `Colors.tx3`, marginTop 2: `"👤 {teacher}"`

Right — Icon tile (`flexShrink: 0`):
- `width: 38`, `height: 38`, `borderRadius: 11`, `backgroundColor: e.color`
- Centred emoji fontSize 19, color white:
  - `type === '10-Day'` → `🪷`
  - `type.includes('Child')` → `👦`
  - otherwise → `🧘`

## 10. Unscheduled warning card

Standard card with overrides:
- `backgroundColor: Colors.url`
- `borderWidth: 1`, `borderColor: Colors.urd` (== `#F5C0BB`)
- `marginHorizontal: 18`, `marginBottom: 12`

Contents:
- Title — fontSize 13, fontWeight 700, color `Colors.ur`, marginBottom 4: `"⚠ Unscheduled"`
- Body — fontSize 12.5, color `Colors.ur`: `"Dhamma Shringa — 30-Day (Dec 1–30) · No AT assigned"` (English literal)
- Button — `.btn.dg.sm`: bg `Colors.url`, color `Colors.ur`, 1.5px `Colors.urd` border, padding `7 15`, borderRadius 10, fontSize 12.5, fontWeight 700, marginTop 8
  - Text: `"⚡ Run Auto-Schedule"` (English literal — Nepali variant in prototype: "स्वत: तालिका")
  - onPress → `router.push(Routes.adminSchedule)`

## 11. Footer spacer

`<View style={{ height: 20 }} />`.

## 12. i18n

New block under `admin.calendar.*`:

| Key                       | EN                          | NE                                |
|---------------------------|------------------------------|------------------------------------|
| `title`                   | Course Calendar              | पाठ्यक्रम पात्रो                  |
| `courses_in_month`        | `{{count}} courses in {{month}}` | `{{count}} शिविरहरू {{month}}`     |
| `unscheduled_title`       | ⚠ Unscheduled               | ⚠ तालिका नभएको                    |
| `run_auto_schedule`       | ⚡ Run Auto-Schedule         | ⚡ स्वत: तालिका                    |
| `months.0..11`            | (Jan…Dec)                    | (जनवरी…डिसेम्बर)                  |

Hard-coded English literals (per prototype):
- Legend labels: `"10-Day"`, `"Children's"`, `"Satipatthana"`, `"Unscheduled"`
- `"Dhamma Shringa — 30-Day (Dec 1–30) · No AT assigned"`
- Centre names in event cards
- `Day X–Y` format
- `👤 {teacher}` format

## 13. Things omitted vs prototype

| Prototype feature               | RN decision                                                     |
|---------------------------------|------------------------------------------------------------------|
| Month filtering of events       | v1 shows all 4 events regardless of `mo` (prototype does too)    |
| Real date math for day ranges   | v1 uses prototype's hardcoded `day` + `len` numbers              |

### 13.1 Other small details to preserve

- Day strip cell is **17×17** (small) with `borderRadius: 4` (gentle rounding, not pill-shape).
- Empty-day cells use `Colors.cr3` bg + `1px Colors.bd` border + **0.6 opacity** — combined effect is a faint hollow square.
- Active-day cells use the event colour at full opacity. No border. The colour does the work.
- Day strip `gap: 1.5` (fractional!) is tight to fit 31 cells in a 354px-wide card.
- Day-number text fontSize **8** is the smallest text on any screen.
- Each day column has `minWidth: 21` so the day strip total ≈ 21 × 31 = 651px — wider than the screen. Hence horizontal scroll.
- Legend swatch border-radius **2** (sharp-cornered, not circles) — visually distinct from chips/pills.
- Event card right icon tile uses the event colour as a **solid** fill (not a tint), white emoji on top. Strong visual chip.
- Icon mapping: 🪷 (10-Day), 👦 (Children's), 🧘 (default — includes Satipatthana / 20-Day / etc).
- 20-Day events use `Colors.sfd` (saffron-dark) — distinct from the saffron `sf` used for Satipatthana. Subtle palette extension.
- Unscheduled banner uses `.btn.dg` (danger button) — same pattern as Reject in inbox. Red tint says "needs attention".
- "Run Auto-Schedule" links to spec 25 — the prev/next breadcrumb between calendar and the actual scheduling tool.

## 14. Acceptance checklist

### Header
- [ ] Title "Course Calendar" 26/800
- [ ] Month nav row: outline ‹ + centred month name 16/700 + outline ›
- [ ] Buttons clamp to 0..11 (opacity 0.5 at limits)

### Legend
- [ ] 4 items in a flex-wrap row, 10×10 r2 swatch + 10.5/tx2 label
- [ ] Colours: fo, bl, sf, ur

### Day strip
- [ ] Card with shadow, paddingHorizontal 12, paddingVertical 14, margin 8/18/0
- [ ] 31 columns, gap 1.5, horizontal scroll
- [ ] Cell 17×17 r4, day number 8/tx3/500 above
- [ ] Coloured by event, or cr3+bd at 0.6 opacity when no event

### Event cards
- [ ] 4px left border by event colour
- [ ] Title 14/700, type · day range 12.5/tx2, 👤 teacher 11.5/tx3 mt 2
- [ ] Right: 38×38 r11 colour-fill tile, white emoji 19 (🪷 / 👦 / 🧘)

### Unscheduled banner
- [ ] url bg + urd border, mh 18 mb 12
- [ ] Title 13/700/ur, body 12.5/ur
- [ ] .btn.dg.sm "⚡ Run Auto-Schedule" mt 8 → adminSchedule route

### Cross-cutting
- [ ] Tab bar visible
- [ ] No TS errors
