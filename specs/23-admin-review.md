---
id: 23-admin-review
title: Admin Review (Application Detail)
route: /(admin)/inbox/[id]
prototype: VipassanaTeacherApp/app.html:2059–2112
status: draft
related: [22-admin-inbox]
---

# 23 · Admin Review

The Centre Manager's per-application review page. Reached by tapping
a card or "Review →" from spec 22's inbox. Shows: applicant identity,
the course they're applying for, a giant match-score card, a 5-point
eligibility checklist, admin notes (private to admin), and Approve /
Reject CTAs. On decision, both buttons collapse into a result card
that confirms the action.

---

## 1. Identity

| Property        | Value                                                       |
|-----------------|-------------------------------------------------------------|
| **Route**        | `/(admin)/inbox/[id]` (hidden from tab bar)                |
| **Component**    | `app/(admin)/inbox/[id].tsx` default `AdminReviewScreen`   |
| **Prototype**    | `AdminReview` function, app.html 2059–2112                  |
| **Status bar**   | `barStyle="light-content"` (dark hero)                     |
| **Param**        | `id: string` — looked up in `adminApplications`             |

Fallback to `adminApplications[0]` if id missing/unknown.

## 2. State

```ts
const [dec, setDec] = useState<'approved' | 'rejected' | null>(null);
```

Tapping Approve / Reject sets `dec` and swaps the action area to a
result card. No mutation of `adminApplications` data in v1.

## 3. Eligibility checks (derived)

Per prototype line 2061:

```ts
const checks = [
  {
    label: 'Language match',
    ok: a.langs.includes('Nepali') || a.langs.includes('English'),
    desc: `Course: Nepali/English · AT: ${a.langs.join(', ')}`,
  },
  {
    label: 'Location preference',
    ok: true,
    desc: 'Nepal in preferred regions ✓',
  },
  {
    label: 'Rest gap',
    ok: true,
    desc: 'Last taught Feb 2026 · sufficient rest ✓',
  },
  {
    label: 'Match score',
    ok: a.match >= 85,
    desc: `${a.match}% compatibility`,
  },
  {
    label: 'Gender match',
    ok: true,
    desc: 'Meets course requirement ✓',
  },
];
```

These descriptions are **English literals in both languages** (prototype hard-codes). Match prototype exactly.

## 4. Hero

### 4.1 Gradient
- 2 stops `['#0F2438', Colors.bl]` (`#0F2438 → #1A5C96`)
- 160° (`GradientDirection.hero`)
- This is the **admin review gradient** — already in `src/theme/colors.ts` as `Gradients.adminReview`. Reuse.

### 4.2 Padding & decorations
- `paddingHorizontal: 18`, `paddingTop: Math.max(56, insets.top + 12)`, `paddingBottom: 22`
- `position: relative`, `overflow: hidden`
- `<LotusHero color="white" opacity={0.07} size={200} />` — **size 200** (between dashboard's 220 and others' 180)
- No MountainSilhouette here.

### 4.3 Back link
- `flexDirection: 'row'`, `alignItems: 'center'`, `gap: 4`, `marginBottom: 13`
- SVG back arrow 18×18 strokeWidth 2.2, stroke `rgba(255,255,255,0.72)` (note: **0.72**, slightly dimmer than other screens' 0.75–0.85)
- Label: `"Back to Inbox"` / `"इनबक्समा फर्कनुहोस्"` — fontSize 13, color `rgba(255,255,255,0.72)`
- Tap → `router.back()`

### 4.4 Identity row
`flexDirection: 'row'`, `gap: 12`, `alignItems: 'center'`.

#### 4.4.1 Avatar
- `width: 62`, `height: 62`, `borderRadius: 31` (50%)
- `backgroundColor: rgba(255,255,255,0.2)` (white-glass)
- Centred initial — fontSize **24**, fontWeight 700, color `Colors.white`
- `flexShrink: 0`

#### 4.4.2 Body
- Name — fontSize **20**, fontWeight 800, color white: `a.name`
- Role line — fontSize 13, color `rgba(255,255,255,0.72)`: `"AT · {a.courses} courses"` (English literal — `AT` and `courses` both stay English)
- Lang chips row — `flexDirection: 'row'`, `gap: 5`, `flexWrap: 'wrap'`, `marginTop: 7`
  - Each chip: bg `rgba(255,255,255,0.2)`, color white, paddingHorizontal 9, paddingVertical 2, borderRadius 20, fontSize 11, fontWeight 600
  - Text: `a.langs[i]` (English literals)

### 4.5 "Applying for" tile
`marginTop: 13`, white-glass background:
- bg `rgba(255,255,255,0.14)` (slightly less opaque than the chips)
- borderRadius 12, paddingHorizontal 13, paddingVertical 11
- backdropFilter omitted

Contents:
- Tiny label — fontSize **11**, color `rgba(255,255,255,0.65)`, fontWeight 600, `textTransform: 'uppercase'`, `letterSpacing: 0.55` (`11 × 0.05`), marginBottom 2: `"Applying for"` (English literal — prototype hard-codes line 2073)
- Course title — fontSize 14, fontWeight 700, color white: `a.course`

## 5. Match score card

Standard `.card` with **`margin: 14 18 0`** (top-bottom 14/0, horizontal 18 — different from section cards' `0 18`).

`alignItems: 'center'` (textAlign center on all children).

Contents (stacked):
1. Label — fontSize 13, fontWeight 600, color `Colors.tx2`, marginBottom 7: `"Match Score"` (English literal)
2. Score — fontSize **52**, fontWeight 800:
   - color `Colors.fo` if `a.match >= 90`, else `Colors.sf`
   - Format: `"{a.match}%"`
3. Meter bar — `Meter` component (reuse from existing):
   - height 5, bg `Colors.cr3`, borderRadius 3, marginTop 5
   - Fill: `width: {match}%`, colour matches the score colour above
4. Caption — fontSize 12, color `Colors.tx3`, marginTop 5:
   - `match >= 90` → `"Excellent match 🌟"`
   - `match >= 80` → `"Good match"`
   - else → `"Fair match"`
   - All **English literals** (prototype hard-codes)

## 6. Eligibility section

### 6.1 Section header
`.sph` → `"Eligibility"` — English literal (prototype's `t("eligibility")` falls through to the key name; no NE override). i18n key `admin.review.eligibility` to keep our pattern, with same text in both langs.

### 6.2 Card
Section card with `margin: 0 18`, `marginBottom: 0`.

### 6.3 Check rows (`.chk` class — prototype line 526)

Prototype CSS base:
```css
.chk {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--bd);
}
```

In RN:
- `flexDirection: 'row'`, `alignItems: 'flex-start'`, `gap: 10`, paddingVertical 10
- `borderBottomWidth: 1`, `borderBottomColor: Colors.bd` on every row including last (per prototype — no `:last-child` exception)

#### 6.3.1 Status icon (`.chk-ic`)
Square pill tile:
- `width: 22`, `height: 22`, `borderRadius: 11` (50%)
- `alignItems: 'center'`, `justifyContent: 'center'`
- `flexShrink: 0`
- `ok` variant: `backgroundColor: Colors.fol`, color `Colors.fo`
- `fail` variant: `backgroundColor: Colors.url`, color `Colors.ur`

SVG glyph 13×13 inside:
- `ok`: checkmark path `M5 13L9 17L19 7`, strokeWidth 2.2, stroke `Colors.fo`, strokeLinecap/Join round
- `fail`: cross path `M18 6L6 18M6 6L18 18`, strokeWidth 2.2, stroke `Colors.ur`, strokeLinecap round

#### 6.3.2 Body
- Label — fontSize 13, fontWeight 700, color `Colors.tx`
- Desc — fontSize 11.5, color `Colors.tx2`, marginTop 2

## 7. Admin Notes section

### 7.1 Section header
`.sph` → `"Admin Notes"` — English literal. i18n key `admin.review.admin_notes`.

### 7.2 Card (gold-tinted)
Section card with overrides:
- `backgroundColor: Colors.gdl` (gold-light = `#FFF8E3`)
- `borderWidth: 1`, `borderColor: '#F5E0A0'` (gold-muted, **not** in token palette — inline literal)
- `margin: 0 18`, `marginBottom: 0` (standard section card spacing)

Body:
- fontSize 13, `fontStyle: 'italic'`, `lineHeight: 20.15` (×1.55), color `Colors.tx` (default)
- Format: `"\"{a.note}\""` — wrap note text in real double-quotes (smart quotes `"..."` would be even nicer; basic ones match prototype)

## 8. Decision area (bottom)

### 8.1 When `dec === null`: Approve / Reject buttons

Container: `paddingHorizontal: 18`, `paddingTop: 18`, `paddingBottom: 8`, `gap: 9`, `flexDirection: 'column'`.

Two full-width buttons:

| Button       | Class         | Style                                                                |
|--------------|---------------|----------------------------------------------------------------------|
| ✓ Approve Application | `.btn.fo-btn` | Forest gradient (`Gradients.forestCta` 135°), white text, paddingVertical 15, paddingHorizontal 22, borderRadius 13, fontSize 15, fontWeight 700, width 100% |
| ✗ Reject with Reason  | `.btn.dg`     | `Colors.url` bg, `Colors.ur` text, 1.5px `Colors.urd` border, same size as approve |

Text:
- Approve: `t('admin.review.approve_btn')` → `"✓ Approve Application"` / `"✓ आवेदन स्वीकृत"` (reuse global `approve` key if present)
- Reject: `t('admin.review.reject_btn')` → `"✗ Reject with Reason"` / `"✗ कारण सहित अस्वीकार"`

Approve onPress → `setDec('approved')`. Reject onPress → `setDec('rejected')`.

### 8.2 When `dec !== null`: Result card

Container: `paddingHorizontal: 18`, `paddingTop: 18`, `paddingBottom: 10`.

Card:
- `backgroundColor: dec === 'approved' ? Colors.fol : Colors.url`
- `borderWidth: 1.5`, `borderColor: dec === 'approved' ? Colors.fom : Colors.urd`
- `borderRadius: 14`, padding 16, `alignItems: 'center'` (centred text)

Contents:
- Emoji — fontSize 30, marginBottom 6: `'✅'` if approved, `'❌'` if rejected
- Title — fontSize 15, fontWeight 700:
  - approved: `Colors.fo` "Application Approved!"
  - rejected: `Colors.ur` "Application Rejected"
- Body — fontSize 12.5, color `Colors.tx2`, marginTop 4, textAlign center:
  - approved: `"Teacher notified by email. Sadhu! 🙏"`
  - rejected: `"Teacher notified with reason."`
  - All **English literals** in both languages.
- "Back to Inbox" button — `.btn.ou.sm`:
  - bg transparent, 2px `Colors.bd2` border, color `Colors.tx`
  - paddingHorizontal 15, paddingVertical 7, borderRadius 10, fontSize 12.5, fontWeight 700
  - `marginTop: 11`, `alignSelf: 'center'`
  - onPress → `router.push(Routes.adminInbox)`

## 9. Footer spacer
`<View style={{ height: 20 }} />` + `paddingBottom: insets.bottom + 8` on the ScrollView.

## 10. Hide bottom tab bar

Add to `app/(admin)/_layout.tsx`:
```tsx
<Tabs.Screen
  name="inbox/[id]"
  options={{ href: null, tabBarStyle: { display: 'none' } }}
/>
```
Currently `href: null` only — add the `tabBarStyle`.

## 11. i18n

New block under `admin.review.*`:

| Key                  | EN                              | NE                                  |
|----------------------|--------------------------------|--------------------------------------|
| `back_inbox`         | Back to Inbox                  | इनबक्समा फर्कनुहोस्                  |
| `applying_for`       | Applying for                   | का लागि आवेदन                        |
| `match_score`        | Match Score                    | मिलान अंक                            |
| `eligibility`        | Eligibility                    | योग्यता                              |
| `admin_notes`        | Admin Notes                    | व्यवस्थापक टिप्पणी                    |
| `approve_btn`        | ✓ Approve Application          | ✓ आवेदन स्वीकृत                      |
| `reject_btn`         | ✗ Reject with Reason           | ✗ कारण सहित अस्वीकार                 |
| `approved_title`     | Application Approved!          | आवेदन स्वीकृत भयो!                   |
| `rejected_title`     | Application Rejected           | आवेदन अस्वीकृत                        |
| `approved_body`      | Teacher notified by email. Sadhu! 🙏 | शिक्षकलाई इमेलबाट सूचित गरियो। साधु! 🙏 |
| `rejected_body`      | Teacher notified with reason.  | शिक्षकलाई कारण सहित सूचित गरियो।     |

Hard-coded English literals (no keys):
- Eligibility check labels and descriptions
- Match-score caption strings ("Excellent match 🌟", "Good match", "Fair match")
- Identity row "AT · X courses"

Reuse: `common.back` is **not** used here (the back link says "Back to Inbox" not just "Back").

## 12. Routes/data
- Reuse `adminApplications` from spec 21.
- Add `Routes.adminInbox` reference for the back-to-inbox button (already in routes.ts).
- Reuse existing `Meter` component from `src/components/ui/` (used in teacher home spec).

## 13. Behaviour

| Trigger                       | Action                                              |
|-------------------------------|----------------------------------------------------|
| Tap Back to Inbox             | `router.back()`                                    |
| Tap ✓ Approve                 | `setDec('approved')`                               |
| Tap ✗ Reject                  | `setDec('rejected')`                               |
| Tap "Back to Inbox" (result)  | `router.push(Routes.adminInbox)`                   |

## 14. Things being omitted vs prototype

| Prototype style                  | RN decision                                              |
|----------------------------------|----------------------------------------------------------|
| `backdropFilter: blur(10px)`     | Skip (the rgba opacity already provides visibility)      |
| `cursor: 'pointer'`              | TouchableOpacity activeOpacity                            |
| `transition: 'all .15s'`         | Skip                                                       |

### 14.1 Other small details to preserve

- Hero gradient is **2 stops** (`#0F2438 → #1A5C96`), not 3-stop like the dashboard. Slightly darker top.
- Back-link stroke is `rgba(255,255,255,0.72)` — **dimmer** than dashboard's 0.85. Subtle de-emphasis on review screen.
- Avatar size **62** is the largest avatar in the app (dashboard 36, inbox 38, this 62). Hero subject prominence.
- Avatar text colour is plain `Colors.white` here (not `Colors.sfd` like inbox) because the avatar bg is white-glass, not saffron.
- Lang chip paddingVertical is **2** (not 3 like elsewhere) — keeps the chip tight inside the dense hero.
- "Applying for" tile background `rgba(255,255,255,0.14)` is **less opaque** than the lang chips' `0.2`. The tile sits "behind" the chips visually.
- The "Applying for" label uppercase letter-spacing `0.05em × 11px ≈ 0.55px` matches the profile screen's expertise label spacing — same micro-typography rule.
- Match-score number is **52px** — by far the largest single text on any screen in the app. Hero stat.
- Match-score colour threshold here (≥90 fo / else sf) is **different** from the inbox card border tier (≥95 / ≥85 / else). Two different bucketings for two different visual cues.
- Caption strings transition at ≥90 / ≥80 / else (yet another threshold). All three thresholds are intentional — don't normalize.
- Eligibility check rows have `border-bottom: 1px solid var(--bd)` on **every row including the last** — no `:last-child` exception. Matches the prototype's `.chk` class declaration.
- Check-icon background uses the *tint* (fol/url), not the *strong* colour (fo/ur). Soft pills.
- Admin Notes card uses `gdl` bg + `#F5E0A0` border — gold-tinted to signal "private to admin" / "internal note" semantically distinct from neutral cards.
- Note text is italic AND wrapped in `"..."` quotes — visual cue this is a verbatim third-party comment.
- Reject button text says `"✗ Reject with Reason"` (with "Reason" suffix) — implies an upcoming reason input that doesn't exist yet. Keep the label honest for the prototype; future spec adds the reason input.
- Result card border is **1.5px** (heavier than the standard `.card`'s shadow alone) — emphasises the finality of the decision.
- The result card's "Back to Inbox" button is a **small outline** (`btn.ou.sm`), not a primary CTA — the action is already complete, this is just a way out.
- After decision, the original Approve / Reject buttons are **replaced** (not disabled) — single source of truth for the action area.

## 15. Acceptance checklist

### Hero
- [ ] 2-stop admin-review gradient `#0F2438 → #1A5C96` at 160°
- [ ] LotusHero size 200 opacity 0.07
- [ ] Back link with 0.72 opacity, "Back to Inbox" label
- [ ] Avatar 62×62 r31 with rgba(.2) bg, fontSize 24 white initial
- [ ] Name 20/800, role line `AT · X courses`, lang chips rgba(.2)/9-2/r20/11/600
- [ ] "Applying for" tile: rgba(.14) bg, r12, padding 13/11, uppercase 11/600 letter-spacing 0.55 label + 14/700 course

### Match score card
- [ ] margin `14 18 0`, alignItems centre
- [ ] Label 13/600/tx2 mb 7 "Match Score"
- [ ] Score 52/800 colour by ≥90 fo / else sf
- [ ] Meter bar with matching fill colour
- [ ] Caption 12/tx3 mt 5 with 3-tier text

### Eligibility
- [ ] sph "Eligibility"
- [ ] Section card with 5 .chk rows
- [ ] Each row: 22×22 r11 tinted-pill status icon + label 13/700 + desc 11.5/tx2 mt 2
- [ ] borderBottom 1px bd on every row including last

### Admin Notes
- [ ] sph "Admin Notes"
- [ ] gdl bg, 1px `#F5E0A0` border, italic 13 body in quotes, lineHeight 20.15

### Decision area
- [ ] When dec===null: stacked Approve (fo-btn) + Reject (dg) full-width
- [ ] When dec set: result card swap with ✅/❌ 30px, title 15/700, body 12.5/tx2 mt 4, outline back-to-inbox sm

### Cross-cutting
- [ ] Tab bar hidden on this route
- [ ] No TS errors
