---
id: 14-server-opportunities
title: Server Opportunities (Serve a Course)
route: /(server)/opportunities
prototype: VipassanaTeacherApp/app.html:2618–2677
status: draft
related: [13-server-dashboard, 15-server-course-detail, 16-server-apply]
---

# 14 · Server Opportunities

The "Serve a Course" list — reachable from the **Serve** tab and from
the dashboard's `See all →`. Shows all open server courses, filterable
by service area.

---

## 1. Identity

| Property         | Value                                                         |
|------------------|---------------------------------------------------------------|
| **Route**        | `/(server)/opportunities` (tab 2 — `LotusIcon`)               |
| **Component**    | `app/(server)/opportunities/index.tsx` default export `ServerOpportunitiesScreen` |
| **Prototype**    | `ServerCourses` function, app.html 2618–2677                  |
| **Status bar**   | `barStyle="dark-content"` (page is light)                     |
| **Safe area**    | Top inset added to header `paddingTop`                        |

## 2. Purpose

After the dashboard's curated top-3 cards, the Server browses the full
list here, filters to a service area they want, and either taps a card
to see the full detail (spec 15) or jumps straight to Apply (spec 16).

## 3. Layout (top → bottom)

```
┌──────────────────────────────── (white) ──────────────────────────────┐
│  Serve a Course                       (fontSize 26 / weight 800)      │
│  Nepal Vipassana Centers · 44 open slots   (fontSize 13 / tx2 / mt 2) │
├──────────────────────────────── (white) ──────────────────────────────┤
│  ┌─ Search (placeholder only — not functional in v1) ────────────┐    │
│  │ 🔍  Search center or area…                                    │    │
│  └──────────────────────────────────────────────────────────────┘    │
│  [All] [🍳 Kitchen] [🍽 Dining] [🔔 Dhamma] [🌿 Compound] …→        │
├──────────────────────────────── (cream gap 8px) ──────────────────────┤
│  ┌─ Card · all areas, full CTA row ────────────────────────────────┐  │
│  │ Dhamma Shringa                              8 open (right-rgt)  │  │
│  │ Budhanilkantha, Kathmandu 🇳🇵               12M + 10F           │  │
│  │ 📅 Jul 7–18, 2026 · 10-Day · 11 days                            │  │
│  │ ───── progress bar ──────  14/22 filled                         │  │
│  │ [🍳 Kitchen][🍽 Dining][🔔 Dhamma][🌿 Compound][📋 Reg]…all      │  │
│  │                          [View Details] [Apply to Serve →]      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│  ... (one card per filtered course)                                   │
│  (20px footer spacer)                                                 │
└───────────────────────────────────────────────────────────────────────┘
                ┌─ Bottom Tab Bar (visible) ─┐
```

## 4. State

```ts
const [selArea, setSelArea] = useState<'All' | ServiceAreaId>('All');
const filtered = selArea === 'All'
  ? serverCourses
  : serverCourses.filter((c) => c.areas.includes(selArea));
```

Search bar is **non-functional in v1** — it's a visual placeholder. No
text input; tapping it is a no-op (or could open a real search later).

## 5. Header section (white card)

| Property            | Value                                          |
|---------------------|------------------------------------------------|
| Container bg        | `Colors.white`                                 |
| Padding             | `paddingTop: Math.max(56, insets.top + 14)`, `paddingHorizontal: 18`, `paddingBottom: 12` |
| Title               | fontSize 26, fontWeight 800, color `Colors.tx`  |
| Title text          | `t('server.opportunities.title')` ("Serve a Course" / "शिविरमा सेवा गर्नुहोस्") |
| Sub-line            | fontSize 13, color `Colors.tx2`, marginTop 2    |
| Sub-line content    | `${t('server.opportunities.subtitle')} · ${openSlots} ${t('server.opportunities.open_slots_short')}` |

`openSlots` = `serverCourses.reduce((a,c)=>a+(c.total-c.filled), 0)` — same calc as dashboard. Numbers stay Latin in both languages.

## 5.1 White wrapper continuation

The prototype's white background extends down past the header to **enclose both the search bar and filter chip row** (`app.html:2630`):
```jsx
<div style={{ background: 'var(--card)', paddingBottom: 10 }}>
  <SearchBar />
  <FilterRow />
</div>
```

In RN: wrap the search bar + filter chips in one `<View style={{ backgroundColor: Colors.white, paddingBottom: 10 }}>`. The cream gap (§7.1) immediately follows.

## 6. Search bar (`.sbar`)

Prototype CSS (`app.html:514`):
```css
.sbar {
  margin: 0 18px 13px;
  background: white;
  border: 1.5px solid var(--bd);
  border-radius: 13px;
  padding: 11px 14px;
  display: flex; align-items: center; gap: 8px;
  font-size: 13.5px;
  color: var(--tx3);
}
```

In RN:
- `marginHorizontal: 18`, `marginBottom: 13`, `marginTop: 0`
- `backgroundColor: Colors.white`
- `borderWidth: 1.5`, `borderColor: Colors.bd`
- `borderRadius: 13`
- `paddingHorizontal: 14`, `paddingVertical: 11`
- Row: search-icon SVG (size 18, stroke `Colors.tx3`) + placeholder text
- Text: fontSize 13.5, color `Colors.tx3`, leftMargin 8

Use the prototype's `Icons.Search` SVG — a 11px-radius circle + diagonal handle. Add to `TabIcons.tsx`? No — that file is for tab icons. Create `src/components/ui/SearchIcon.tsx` (or inline a small SVG in this file). Decision: **inline** in this screen since no reuse yet.

## 7. Filter chip row (`.frow` + `.fchip`)

Prototype CSS:
```css
.frow {
  display: flex; gap: 7px;
  overflow-x: auto; padding: 0 18px 4px;
  scrollbar-width: none;
}
.fchip {
  flex-shrink: 0;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13;
  font-weight: 600;
  border: 1.5px solid var(--bd2);
  background: white;
  color: var(--tx2);
}
.fchip.on { background: var(--sf); border-color: var(--sf); color: white }
```

The active styling is **overridden inline in the prototype** for the server screen to use `#9B6B14` instead of `--sf`. We must use `#9B6B14` (server accent).

In RN:
- Horizontal `ScrollView`, `showsHorizontalScrollIndicator: false`, `contentContainerStyle: { paddingHorizontal: 18, paddingBottom: 4, gap: 7 }`
- Each chip: TouchableOpacity, `paddingHorizontal: 14`, `paddingVertical: 7`, `borderRadius: 20`, `borderWidth: 1.5`, fontSize 13, fontWeight 600.
- Inactive: `borderColor: Colors.bd2`, `backgroundColor: Colors.white`, text `color: Colors.tx2`
- Active: `borderColor: '#9B6B14'`, `backgroundColor: '#9B6B14'`, text `color: Colors.white`

First chip is always `"All"` (label: `t('server.opportunities.filter_all')`). Then one chip per `SERVICE_AREAS` entry, label `${sa.emoji} ${sa.label}` (English labels — same as dashboard area chips).

### 7.1 Cream gap divider

Immediately after the white wrapper, an 8px-tall band of `Colors.cr` (`#F8F3EB`) separates the white panel from the scrollable card list:
```tsx
<View style={{ height: 8, backgroundColor: Colors.cr }} />
```

## 8. Course card

Standard `.card` (white, 16 radius, padding 15, mh 18, mb 11, shadow). **No left-border accent** (unlike dashboard).

Tap → `routeTo.serverOpportunityDetail(c.id)`.

### 8.1 Top row
Flex row, `space-between`, `flex-start`, marginBottom 8.

Left (flex 1, paddingRight 8):
- Title — fontSize **15**, fontWeight 700, color `tx` (note: dashboard used 14; this list uses 15)
- City — fontSize **12.5**, color `tx2` (dashboard: 12)
- Meta — fontSize 11, color `tx3`, marginTop 1: `📅 {c.dates} · {c.type} · {c.days} days`. **`days` is an English literal** (prototype hard-codes it; no i18n key). Dashboard's meta line did not include this `days` suffix — opportunities adds it.

Right (textAlign right, flexShrink 0):
- "{open} open" — fontSize **14**, fontWeight 800 (dashboard: "8 slots left" at 13/800). Color `open <= 3 ? Colors.ur : '#9B6B14'`. **`open` is an English literal in both languages** — prototype hard-codes it (`{open} open`), same convention as dashboard's `slots left`.
- "{mServers}M + {fServers}F" — fontSize 10, color `tx3`. Latin digits + literal `M`/`F` in both languages.

### 8.2 Progress row
Identical to dashboard §7.3.2 (5px track, color thresholds 80/50, `{filled}/{total} filled` 10/tx3). marginBottom 8.

### 8.3 Area chips
**All** chips (no `slice(0, 4)`, no `+N more`). Same style as dashboard. marginBottom 8.

### 8.4 CTA buttons row
Flex row, `justifyContent: 'flex-end'`, gap 6.

| Button         | Style                                                                |
|----------------|----------------------------------------------------------------------|
| View Details   | bg `Colors.cr2`, color `Colors.tx2`, no border, fontSize 12.5, fontWeight 700, padding 7/15, borderRadius 10 |
| Apply to Serve →| gradient `#9B6B14 → #6B4610` (135°), color white, no border, same size |

Both reuse `.btn.sm` sizing (padding `7 15`, fontSize `12.5`, borderRadius 10, fontFamily Plus Jakarta Sans, fontWeight 700). Use `TouchableOpacity` + `LinearGradient` for the gradient button.

**Apply button gradient** uses **135° direction** (`GradientDirection.button` — `start: { x: 0, y: 0 }, end: { x: 1, y: 1 }`), 2 stops `['#9B6B14', '#6B4610']`. Consider adding `Gradients.serverCta` to `src/theme/colors.ts` for reuse (this same gradient appears on multiple server CTAs throughout the prototype — e.g. `app.html:3196`, `3336`).

**View Details button** has `backgroundColor: Colors.cr2`, `color: Colors.tx2`, no border. No gradient.

Prototype's `.btn:active { transform: scale(.96) }` we skip — `TouchableOpacity activeOpacity={0.85}` is the convention.

| Button onPress         | Action                                          |
|------------------------|-------------------------------------------------|
| Card tap (background)  | push `routeTo.serverOpportunityDetail(c.id)`    |
| View Details           | push `routeTo.serverOpportunityDetail(c.id)`    |
| Apply to Serve →       | push `routeTo.serverApply(c.id)`                |

Stop propagation: in RN, child `TouchableOpacity` consumes the press, so the parent card tap won't fire. No explicit stopPropagation needed.

## 9. Empty state
If `filtered.length === 0`, render:
- `<Text>` fontSize 13, color `Colors.tx3`, textAlign center, paddingVertical 40
- Text: `t('server.opportunities.no_results')` ("No courses match this filter." / "यो फिल्टरमा कुनै शिविर मिलेन।")

## 10. Footer spacer
`<View style={{ height: 20 }} />` + `paddingBottom: insets.bottom + 8` on the ScrollView content.

## 11. Behaviour

| Trigger                          | Action                                                |
|----------------------------------|-------------------------------------------------------|
| Tap filter chip                  | setSelArea(chip.id)                                   |
| Tap card                         | router.push(routeTo.serverOpportunityDetail(c.id))    |
| Tap "View Details"               | router.push(routeTo.serverOpportunityDetail(c.id))    |
| Tap "Apply to Serve →"           | router.push(routeTo.serverApply(c.id))                |
| Tap search bar                   | no-op (v1 placeholder)                                |

## 12. i18n

New keys under `server.opportunities.*` (replacing the existing block):

| Key                | EN                              | NE                                       |
|--------------------|----------------------------------|-----------------------------------------|
| `title`            | Serve a Course                  | शिविरमा सेवा गर्नुहोस्                  |
| `subtitle`         | Nepal Vipassana Centers         | नेपाल विपस्सना केन्द्रहरू               |
| `open_slots_short` | open slots                      | खुला सिटहरू                              |
| `search_placeholder` | Search center or area…        | केन्द्र वा क्षेत्र खोज्नुहोस्…          |
| `filter_all`       | All                             | सबै                                      |
| `view_details`     | View Details                    | विवरण हेर्नुहोस्                         |
| `apply_serve`      | Apply to Serve →                | सेवाका लागि आवेदन →                     |
| `no_results`       | No courses match this filter.   | यो फिल्टरमा कुनै शिविर मिलेन।            |

(There's an existing `server.opportunities.*` block from the old WIP — we will overwrite it.)

## 13. Things being omitted vs prototype

| Prototype style                       | RN decision                                              |
|---------------------------------------|----------------------------------------------------------|
| `scrollbar-width: none`               | RN doesn't show scrollbars by default on horizontal ScrollView |
| `cursor: 'pointer'`                   | TouchableOpacity activeOpacity                            |
| `e.stopPropagation()` on inner buttons| Not needed in RN — child Touchable consumes the press   |
| Functional search input               | Placeholder only in v1 (no `TextInput`)                  |

### 13.1 Other small details to preserve

- The middle-dot separators `·` in title-sub and card-meta lines are U+00B7, not `•`.
- Card title fontSize **15** is one step larger than dashboard's **14** — intentional list-vs-summary difference.
- Card "{open} open" right-aligned uses **flexShrink: 0** so it never wraps under a long centre name.
- Filter chip `.frow` first chip starts 18px from the left edge (mirrors body card horizontal margin). Last chip has 18px trailing space via `contentContainerStyle.paddingHorizontal: 18`.
- `.fchip.on` border-color matches background (`#9B6B14`) so the chip looks like a solid pill, not a ringed one.
- `.sbar` `marginBottom: 13` is **inside** the white wrapper — combined with wrapper's `paddingBottom: 10` this gives ~14–17px of visual breathing room above the chip row depending on `.frow` padding-top (which is 0).
- All cards have `marginBottom: 11` from `.card` base; no extra spacing between them. The first card after the 8px cream gap inherits its own top margin via `.card` base (which is 0 — only marginBottom is set).
- Search bar is rendered as a non-interactive `<View>` (not a `TextInput`). No focus state, no caret.

## 14. Acceptance checklist

### Header
- [ ] Title 26/800, sub-line 13/tx2 with `· {n} open slots` count
- [ ] White background; top inset respected
- [ ] Open-slots count reflects sum across all `serverCourses`

### Search + filters
- [ ] Search bar: 1.5px `bd` border, radius 13, padding 11/14, icon + placeholder text
- [ ] Search bar is non-interactive (no TextInput in v1)
- [ ] Filter chip row scrolls horizontally
- [ ] First chip is "All"; followed by SERVICE_AREAS chips with emoji + English label
- [ ] Active chip: `#9B6B14` bg/border, white text. Inactive: white bg, `bd2` border, `tx2` text
- [ ] 8px cream gap divider below the filter row

### Cards
- [ ] All filtered courses render, full list (no slice)
- [ ] Title 15/700, city 12.5/tx2, meta with `· {days} days` suffix
- [ ] "{open} open" right-aligned 14/800 — red ≤ 3 else `#9B6B14`
- [ ] Progress bar identical to dashboard (5px, thresholds 80/50)
- [ ] **ALL** area chips render (no overflow)
- [ ] Two buttons right-aligned: View Details (`cr2` bg, `tx2` text) + Apply to Serve → (gradient `#9B6B14 → #6B4610`)
- [ ] Card-body tap and View Details both navigate to opportunity detail
- [ ] Apply button navigates to apply screen with `c.id`

### Cross-cutting
- [ ] Empty state shown when filter yields zero courses
- [ ] Tab bar visible (no `display: 'none'` override)
- [ ] No TypeScript errors
