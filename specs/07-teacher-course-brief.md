# Spec: Teacher Course Brief

> **Status:** `code_done`
> **Owner of approval:** Sujay
> **Last updated:** 2026-05-14

---

## 0. Source of truth

**Visual reference:** `../VipassanaTeacherApp/app.html` lines `1225–1382` (the `function CourseBrief` component) and the surrounding CSS at lines `447–540`.

This is the **pre-course briefing pack** a teacher reads once they're confirmed on a course — arrival, co-teacher, coordinator, students, travel, what-to-bring, center notes, and a step-down action. Prototype-faithful port. Forest-green hero accent distinguishes it from the saffron "Open course detail" screen (spec 06).

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `07-teacher-course-brief` |
| Route | `/(teacher)/applications/brief/[id]` |
| Source file | `app/(teacher)/applications/brief/[id].tsx` |
| Prototype reference | `app.html:1225–1382` |
| Roles | `teacher` |
| Related specs | [`04-teacher-home`](./04-teacher-home.md) (upcoming-card target), `08-teacher-applications` (applications screen target), `06-teacher-course-detail` (the **applying** flow — different screen, saffron accent) |

---

## 2. Purpose

The teacher has been confirmed (approved or admin-assigned) for a specific course. This screen gives them everything they need to prepare for and arrive at that course — written by the centre, not the teacher. Reading it should answer:

- When and where do I need to arrive?
- Who's the co-teacher? Coordinator?
- How many students? What's the gender split?
- How do I get there? How long? What altitude?
- What do I bring as an AT?
- Anything else the centre wants me to know?

Plus one action: **request to step down** if they can no longer serve.

---

## 3. Visual Layout (top → bottom)

> **Container** — `<ScrollView>` with `Colors.cr` background.

### 3.1 Hero — forest-green, padding `56 18 22`

`linear-gradient(160deg, #2A4A30, Colors.fo)` (forest dark → forest mid). Overflow hidden, position relative.

- **Decorations**: `LotusHero` (white, 0.08, size 210, right -30 / bottom -30) + `MountainSilhouette` (white 0.07).
- **Back row** (relative): `← Back` — 13 px, `rgba(255,255,255,0.78)`, gap 4 px, tappable. Goes to `/(teacher)/home` (default) or `/(teacher)/applications` if the user came from there. We resolve this from the `?back=` query param (`?back=applications`); falls back to home.
- **Kicker** (`.sph`-style but inline): `PRE-COURSE BRIEF` — 11 px, weight 700, `rgba(255,255,255,0.7)`, uppercase, letter `.06em`.
- **Title**: `course.center` — 21 px, `fontWeight: 800`, white, `lineHeight: 1.2`, 3 px margin-top.
- **Subtitle**: `${course.type} · ${course.dates}` — 13 px, `rgba(255,255,255,0.78)`, 2 px margin-top.
- **City**: `course.city` — 12 px, `rgba(255,255,255,0.62)`, 1 px margin-top.
- **Status pills** (`flex row gap 7 wrap`, 13 px margin-top):
  - Always: `✓ Confirmed` — bg `rgba(255,255,255,0.22)`, white, padding 4 × 11, radius 20, 11.5 px weight 700.
  - When `application.source === 'assigned'`: `📨 Assigned by Admin` — bg `rgba(91,111,168,0.55)`, same shape.
  - Otherwise (applied): `✋ You Applied` — bg `rgba(255,255,255,0.13)`, `rgba(255,255,255,0.8)` text, weight 600.

### 3.2 Section — 🛬 Arrival

Section header (`.sph`): margin `18 18 9`, 12 px / weight 700 / `Colors.tx2` / uppercase / letter `.07em`. Text: `🛬 {t('brief.arrival_label')}`.

Card (`margin: 0 18`, `Colors.fol` bg, `1.5 px Colors.fom` border, otherwise `.card` shape):
- **Sublabel** — 11 px, `Colors.tx3`, weight 600, uppercase, letter `.05em`. Text: `t('brief.arrive_by')`.
- **Value** — 17 px, weight 800, `Colors.fo`. Text: `${course.arrivalDate} · ${course.arrivalTime}`. 3 px margin-top.
- **Context** — 11.5 px, `Colors.tx2`, 1.45 line-height, 4 px margin-top. Localized prose: "Course formally opens in the evening. Please arrive in time for dinner, introductions, and the AT briefing."

### 3.3 Section — 🧘 Co-Teacher

Card (standard `.card` chrome).

- **If `course.coTeacher` is set:**
  - Top row (`flex row align-center gap 12`):
    - **Avatar** — 48 × 48, radius 14. Color theme depends on gender:
      - Female: bg `#FBE8F0`, border `1.5 px #F0C8D8`, glyph `🙏🏻`.
      - Male / Any: bg `Colors.fol`, border `1.5 px Colors.fom`, glyph = LotusGlyph SVG at 28 px in `Colors.fo`.
    - **Identity** (`flex: 1`):
      - Name — 14.5 px, weight 800.
      - Sub — 11.5 px, `Colors.tx2`. `${gender label} · ${langs.join(', ')}` where gender label = "Female AT" / "Male AT" / "AT".
    - **Confirmed chip** — right-aligned. Existing `.chip.fo` style: 10 px font, `Colors.fol` bg, `Colors.fo` text.
  - **Phone row** — 11 px margin-top, padding 9 × 11, `Colors.cr` bg, radius 10. Left: `📞 ${co.phone}` (12.5 px `Colors.tx2`). Right: `Call →` (11.5 px, `Colors.fo`, weight 700) — taps `Linking.openURL('tel:' + phone)`.

- **Otherwise** (no co-teacher yet): italic 12.5 px `Colors.tx2` — "No co-teacher confirmed yet."

### 3.4 Section — 👤 Coordinator

Card.

- Top row:
  - **Avatar** — 42 × 42, radius 13, `Colors.sfl` bg, 📋 glyph at 18 px.
  - **Identity** (`flex: 1`): name 14 px weight 700; role 11.5 px `Colors.tx2`.
- **Phone row** — same shape as co-teacher's. Call link in `Colors.sf`.

### 3.5 Section — 👥 Students Expected

Card.

- Top: `${course.students.expected}` in 32 px weight 800 + the word "students" in 12 px `Colors.tx2` (or NE equivalent), baseline-aligned with gap 9.
- Sublabel — 11 px, `Colors.tx3`, uppercase, letter `.05em`, margin `6 0`. Text: `t('brief.students_split')`.
- **Split bar** — `flex row gap 6 height 32 radius 10 overflow hidden`, bg `Colors.cr3`. Two segments sized by `students.male` and `students.female`:
  - Male: bg `Colors.bl` (blue), white text `♂ ${male}` — 12 px weight 700.
  - Female: bg `#C8527A` (pink), white text `♀ ${female}` — 12 px weight 700.

### 3.6 Section — 🚌 Travel

Card.

- **3-tile stat row** (`flex row gap 8 marginBottom 10`):
  | Tile | Value | Label |
  |---|---|---|
  | 0 | `${course.distanceKm} km` | `Distance` |
  | 1 | `~${course.travelHrs}` | `Hours` |
  | 2 | `${course.altitude} m` | `Altitude` |
  - Each tile: `flex: 1`, bg `Colors.cr`, radius 10, padding `8 × 6`, centered. Value 13.5 px weight 800; label 9.5 px `Colors.tx3` uppercase letter `.04em`, 1 px margin-top.
- **Transport sublabel** — 11 px `Colors.tx3` weight 600 uppercase letter `.05em`, 5 px margin-bottom. Text: `t('brief.transport_label')`.
- **Transport prose** — 12.5 px `Colors.tx2`, 1.5 line-height. Text: `course.transport`.

### 3.7 Section — 🎒 What to Bring (AT)

Card with 7 hardcoded checklist items (defined in `app.html:1230–1238`):

| # | Icon | EN | NE |
|---|---|---|---|
| 1 | 🤍 | White / off-white kurta and pyjama (3 sets) | सेतो / हल्का रङको कुर्ता-पाइजामा (३ जोर) |
| 2 | 🧣 | Shawl (mornings cold even in summer at altitude) | शाल (उचाइमा बिहान चिसो हुन्छ) |
| 3 | 🪑 | AT seat cushion / zafu (your own preferred height) | AT आसन / जाफू (आफ्नो उचाइ अनुसार) |
| 4 | 🆔 | Citizenship / passport copy + 2 passport photos | नागरिकता / राहदानी प्रतिलिपि + २ पासपोर्ट फोटो |
| 5 | 💊 | Personal medication for full course duration | शिविरको पूरा अवधिको लागि व्यक्तिगत औषधि |
| 6 | 🔦 | Flashlight (load-shedding still happens at remote centers) | टर्च (दुर्गम केन्द्रमा बिजुली कटौती हुन्छ) |
| 7 | 📿 | Personal mala (optional) and notes from previous AT manuals | व्यक्तिगत माला (वैकल्पिक) र अघिल्लो AT पुस्तिकाका टिप्पणी |

Each row: `flex row gap 11 padding 7 0`, dashed `Colors.bd` bottom border (no border on last). Icon 18 px, 24 px square centered. Text 12.5 px `Colors.tx2`, 1.45 line-height, `flex: 1`.

These items live in `src/translations/{en,ne}.json` under `brief.checklist.*` keys (already populated; reuse).

### 3.8 Section — 💬 Notes from Center (conditional)

Renders only when `course.notes` is non-empty.

- Section header: `💬 {t('brief.notes_from_center')}`.
- Card (`margin: 0 18`, `Colors.sfl` bg, `1 px Colors.sfm` border): 12.5 px italic `Colors.tx`, 1.55 line-height, wrapped in quote characters.

### 3.9 Bottom action — step down

Padding `14 18 0`. Two variants based on application source:

- **`source === 'assigned'`** — admin assigned this. Inset card (radius 14, `1.5 px rgba(91,111,168,0.3)` border, `rgba(91,111,168,0.07)` bg, padding `14 14 12`):
  - Note text — 12 px `#5B6FA8`, 1.55 line-height, 12 px margin-bottom. Localized: "This course was assigned by admin. Stepping down will notify them to find a replacement."
  - Outline button — `Colors.bl2` border + text (the prototype's `#5B6FA8`). Label: `⚠ Notify admin — stepping down`.

- **`source === 'applied'`** — teacher applied. Plain outline button (`.btn.ou`): `Colors.bd2` border, `Colors.tx` text. Label: `⚠ Request to step down`.

Both buttons open a `useConfirm()` dialog with a required note (the teacher must explain why). Submitting fires `applicationsStore.requestWithdrawal(applicationId, userId, note)` and a `toast.success`. The button rerenders as a green "Request sent — admin will review" badge to prevent re-submission.

### 3.10 Bottom spacer

24 px + safe-area inset.

---

## 4. Component Inventory

| Element | Type | Source |
|---|---|---|
| Hero gradient | LinearGradient | `expo-linear-gradient` |
| LotusHero / MountainSilhouette | SVG | existing `@/components/ui/HeroDecorations` |
| Back glyph | text | inline `← ` (no SVG component needed) |
| Sublabels (`.sph`) | text | inline (same style as home) |
| Cards | View | inline (same `.card` shape as home) |
| Status pill | View | inline |
| Co-teacher avatar | View | inline; uses `LotusGlyph` for male |
| Phone row "Call →" | TouchableOpacity | inline; `Linking.openURL('tel:...')` |
| Students split bar | View | inline |
| Travel stat tile | View | inline (same shape as home stat tiles, but `Colors.cr` bg) |
| Checklist row | View | inline |
| Step-down dialog | `useConfirm` | existing `@/components/ui/ConfirmDialog` |

No new shared components.

---

## 5. Design Tokens

| Element | Token |
|---|---|
| Hero gradient | `['#2A4A30', Colors.fo]` |
| Hero status pills | `rgba(255,255,255,0.22)` / `rgba(91,111,168,0.55)` / `rgba(255,255,255,0.13)` |
| Arrival card | `Colors.fol` bg, `Colors.fom` border, `Colors.fo` headline |
| Co-teacher F avatar | `#FBE8F0` bg, `#F0C8D8` border |
| Co-teacher M avatar | `Colors.fol` bg, `Colors.fom` border, `Colors.fo` lotus |
| Coordinator avatar | `Colors.sfl` |
| Students bar male | `Colors.bl` |
| Students bar female | `#C8527A` |
| Students bar track | `Colors.cr3` |
| Travel stat tile | `Colors.cr` |
| Notes card | `Colors.sfl` bg, `Colors.sfm` border |
| Admin step-down inset | `rgba(91,111,168,0.07)` bg, `rgba(91,111,168,0.3)` border, `Colors.bl2` text |

Inline literal font sizes match the prototype (same policy as login/home/onboarding). Do not use `FontSize` tokens.

---

## 6. Strings & i18n

Most keys already exist under `brief.*` in `src/translations/{en,ne}.json` from the earlier work. Verify these and add the few that are missing:

| Key | EN (existing or proposed) | NE |
|---|---|---|
| `brief.title` | `Pre-Course Brief` | `शिविर-पूर्व विवरण` |
| `brief.confirmed` | `Confirmed` | `पुष्टि भयो` |
| `brief.assigned_by_admin` | `Assigned by Admin` | `एडमिनद्वारा नियुक्त` |
| `brief.you_applied` | `You Applied` | `तपाईंले आवेदन दिनुभएको` |
| `brief.arrival_label` | `Arrival` | `आगमन` |
| `brief.arrive_by` | `Arrive by` | `सम्म आउनुहोस्` |
| `brief.arrival_context` | `Course formally opens in the evening. Please arrive in time for dinner, introductions, and the AT briefing.` | `शिविर औपचारिक रूपमा साँझ खुल्छ। कृपया भोजन, परिचय र समूह बैठकका लागि समयमै आइपुग्नुहोस्।` |
| `brief.co_teacher_label` | `Co-Teacher` | `सह-शिक्षक` |
| `brief.co_teacher_confirmed` | `Confirmed` | `पुष्टि भयो` |
| `brief.no_co_teacher` | `No co-teacher confirmed yet.` | `सह-शिक्षक अझै पुष्टि भएका छैनन्।` |
| `brief.call` | `Call →` | `कल →` |
| `brief.female_at` | `Female AT` | `महिला सहायक शिक्षक` |
| `brief.male_at` | `Male AT` | `पुरुष सहायक शिक्षक` |
| `brief.coordinator` | `Coordinator` | `समन्वयक` |
| `brief.students_expected` | `Students Expected` | `अपेक्षित विद्यार्थी` |
| `brief.students_word` | `students` | `विद्यार्थी` |
| `brief.students_split` | `Gender Split` | `लैंगिक विभाजन` |
| `brief.travel` | `Travel` | `यात्रा` |
| `brief.distance` | `Distance` | `दूरी` |
| `brief.hrs_short` | `Hours` | `घण्टा` |
| `brief.altitude` | `Altitude` | `उचाइ` |
| `brief.km_short` | `km` | `कि.मी.` |
| `brief.m_alt` | `m` | `मि` |
| `brief.transport_label` | `Transport` | `यातायात` |
| `brief.what_to_bring_at` | `What to Bring (AT)` | `के ल्याउने (AT)` |
| `brief.checklist.1` … `.7` | (7 items from §3.7) | (7 NE items) |
| `brief.notes_from_center` | `Notes from Center` | `केन्द्रको टिप्पणी` |
| `brief.step_down_assigned_note` | `This course was assigned by admin. Stepping down will notify them to find a replacement.` | `यो शिविर एडमिनले नियुक्त गरेको हो। पछि हट्नु भयो भने एडमिनलाई सूचित गरिनेछ।` |
| `brief.step_down_assigned_cta` | `⚠ Notify admin — stepping down` | `⚠ एडमिनलाई सूचित गर्नुहोस्` |
| `brief.step_down_applied_cta` | `⚠ Request to step down` | `⚠ अनुपलब्धता सूचित गर्नुहोस्` |
| `brief.step_down_dialog_title` | `Request to step down` | `पछि हट्ने अनुरोध` |
| `brief.step_down_dialog_body` | `Why can't you serve this course? Admin will review and may approve or reject your request.` | `तपाईं किन यो शिविरमा सेवा गर्न असमर्थ हुनुहुन्छ? एडमिनले समीक्षा गरी अनुमोदन वा अस्वीकार गर्नेछन्।` |
| `brief.step_down_sent` | `Request sent — admin will review` | `अनुरोध पठाइयो — एडमिन समीक्षा गर्नेछन्` |

Some of these keys already exist in `brief.*` and just need to be reconciled with the new shape. The implementation should add missing keys and reuse existing ones where the labels match.

---

## 7. Local State

| Name | Type | Purpose |
|---|---|---|
| `withdrawalSent` | `boolean` | flips after a successful step-down request so the CTA renders the "sent" state until next nav |
| (modal state) | — | handled by `useConfirm` (no local state needed) |

---

## 8. Behavior

| Trigger | Action |
|---|---|
| Mount | `applicationsStore.loadApplications(userId)` (if not already loaded) so the application for this course resolves |
| Tap Back | `router.back()` if history exists, otherwise `router.replace(Routes.teacherHome)` |
| Tap `📞 Call →` (co-teacher or coordinator) | `Linking.openURL('tel:' + phone)` — falls back silently if `Linking.canOpenURL` returns false |
| Tap step-down CTA | `useConfirm({ title, body, destructive: true, requireNote: true })` → on confirm, fire `applicationsStore.requestWithdrawal(applicationId, userId, note)` + `notificationsStore.addNotification(adminNotice)` + `toast.success` + set `withdrawalSent=true` |
| Application already `withdrawal_requested` on mount | Render the "request sent" badge instead of the CTA |

If `course` (resolved from URL `id` against `coursesStore`) is null → render an empty state with "Course not found" + a Back-to-home button.

---

## 9. Data Dependencies

| Store | Reads |
|---|---|
| `authStore` | `userId` |
| `applicationsStore` | the application for `(userId, courseId)` — drives `source` (applied vs assigned) and step-down state |
| `coursesStore` | `courses.find(c => c.id === id)` — main course payload |
| `teachersStore` | optional — if `course.coTeacher` only has an id, resolve to a full teacher record. (Our current synced data ships `course.coTeacher` as inline data already; the store fallback is for future use.) |
| `notificationsStore` | `addNotification` for the step-down notice |
| `settingsStore` | `language` (drives the NE/EN render path) |

---

## 10. Navigation

| Direction | Source | Target |
|---|---|---|
| In | `/(teacher)/home` upcoming card | this screen with `?back=home` |
| In | `/(teacher)/applications` list | this screen with `?back=applications` |
| Out — Back | tap | `router.back()` (falls back to `Routes.teacherHome`) |
| Out — Call | tap phone row | `tel:` deep link |
| Out — Step-down sent | implicit | stays on this screen (badge state) |

---

## 11. Acceptance Checklist

- [ ] Hero matches prototype at 390 × 844 (forest gradient, Back, kicker, title, type · dates, city, status pill row).
- [ ] Status pill shows the right variant based on `application.source` (`assigned` → blue; `applied` → light translucent).
- [ ] Arrival card: forest tint, big date+time, italic context note.
- [ ] Co-teacher card: gendered avatar tile (pink Female / forest Male with `LotusGlyph`), Call → row works on iOS + Android (web shows tel: link target).
- [ ] Coordinator card: saffron avatar, Call → works.
- [ ] Students card: big count, gender-split bar with male blue + female pink, sized by counts.
- [ ] Travel: 3 stat tiles + transport prose. Renders cleanly when `altitude` / `distanceKm` are 0 or missing.
- [ ] What-to-bring: 7 rows, dashed dividers, EN + NE both render.
- [ ] Notes card: only shown when `course.notes` non-empty.
- [ ] Step-down: confirm dialog with note input; sending writes to applicationsStore + notificationsStore; idempotent (subsequent visits show "sent" state).
- [ ] EN + NE both render without overflow.
- [ ] No console warnings on mount/unmount.

---

## 12. Intentional Deltas from Prototype

| Delta | Prototype | Our app | Why |
|---|---|---|---|
| Step-down stub | Prototype shows `alert('coming next iteration')` | We wire to a real `useConfirm` dialog + `applicationsStore.requestWithdrawal` flow | Already implemented in our applicationsStore + an existing CourseBrief variant; we lift it forward |
| Call → buttons | Prototype has no handler | Use `Linking.openURL('tel:...')` | Real device behavior |
| Existing 518-line implementation | n/a | **Rebuild from scratch** — current code uses pre-token-system colors, `HeroSection`, and old i18n keys. Drop and replace cleanly. | Drift from the prototype is too high to patch incrementally |

---

## 13. Open Questions

- [ ] Should the "Request sent" badge persist across navigation (read from `application.status === 'withdrawal_requested'`) or just for the local session? Default: read from application — the badge is the source of truth.
- [ ] Should the back-resolution take both `?back=` AND history into account? Currently the screen prefers `?back=` then falls back to `router.back()`. Simple, predictable.
- [ ] Notifications for admin: we already have a `notificationsStore` flow but it's still on AsyncStorage. Step-down notifications will write there and migrate when notifications hit SQLite (#11 on the roadmap).

---

## 14. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-14 | Sujay + Claude | Initial draft from prototype `app.html:1225–1382` |
