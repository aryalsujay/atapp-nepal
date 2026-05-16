# Spec: Server Onboarding

> **Status:** `code_done`
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-15

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `12-server-onboarding` |
| Route (Expo Router) | `/(server)/onboarding` |
| Source file | `app/(server)/onboarding.tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines `2973–3075` |
| Roles | `server` (first-time login only) |
| Related specs | [`01-login`](./01-login.md), [`03-onboarding-teacher`](./03-onboarding-teacher.md) (parallel structure), [`13-server-dashboard`](./13-server-dashboard.md) |

---

## 2. Purpose

First-time eligibility check before a new server can apply for any service course. Five yes/no questions, each focusing on one Code-of-Discipline pillar (10-Day course completed, sitting regularly, rest interval, health, Code of Discipline). Single-question-at-a-time wizard with a top progress bar. After question 5 it summarises responses and either routes to the dashboard (all yes) or blocks with a "Review answers / Continue anyway (limited access)" choice (any no).

Reached automatically after login when `auth.isOnboarded === false` for a server. Not part of the bottom tab bar.

---

## 3. State model

```ts
type Answer = 'yes' | 'no';
const QUESTIONS = [
  { key: 'q1', icon: '🪷' },
  { key: 'q2', icon: '🧘' },
  { key: 'q3', icon: '📅' },
  { key: 'q4', icon: '💚' },
  { key: 'q5', icon: '📜' },
] as const;
type QKey = (typeof QUESTIONS)[number]['key'];

const [answers, setAnswers] = useState<Partial<Record<QKey, Answer>>>({});
const [step, setStep] = useState(0); // 0..4 = question, 5 = result
const allYes = QUESTIONS.every(q => answers[q.key] === 'yes');
const anyNo = QUESTIONS.some(q => answers[q.key] === 'no');
```

Six rendered states: `step 0..4` (one question each) and `step 5` (result). No DB persistence of answers — onboarding completion is tracked via `auth.isOnboarded` only.

---

## 4. Common — `StepHero` (used on every question step)

`linear-gradient(160deg, #5A3800, #9B6B14, #D4A050)` — three-stop gold, ends lighter than the dashboard hero. `paddingHorizontal: 22, paddingTop: max(50, safeAreaTop + 14), paddingBottom: 28, overflow: hidden, position: relative`.

### 4.1 Decorations

- **`LotusHero`** — `color: white, opacity: 0.1, size: 220, right: -40, bottom: -40`.
- **`MountainSilhouette`** — `color: 'rgba(255,255,255,0.08)'`.

### 4.2 Back row

`flexDirection: row, alignItems: center, gap: 4, marginBottom: 10, position: relative`.

- SVG chevron `M15 18L9 12L15 6` — stroke `rgba(255,255,255,0.85)`, strokeWidth 2, 18 × 18.
- Label — `Back` (`common.back`) — **13 px / `rgba(255,255,255,0.85)`** / `fontFamily: FontFamily.sansRegular`.
- TouchableOpacity with `activeOpacity: 0.7, hitSlop {8,8,8,8}`. Behaviour: `step > 0 ? setStep(step - 1) : router.replace(Routes.login)`.

### 4.3 Kicker + title

- **Kicker** — `Welcome, Dhamma Server` (`server.onboarding.title`) — **13 px / `rgba(255,255,255,0.85)`** / `fontFamily: FontFamily.devanagari` (matches the prototype's `fontFamily:"'Noto Sans Devanagari'"` rule; renders fine for Latin too).
- **Title** — `Before you can serve, please confirm your readiness.` (`server.onboarding.sub`) — **20 px / 800 / white** / `fontFamily: FontFamily.sansExtraBold`, `lineHeight: 26` (= 20 × 1.3), marginTop **4**.

### 4.4 Progress bar

`flexDirection: row, gap: 5, marginTop: 18, position: relative`.

5 segments, one per question. Each: `flex: 1, height: 4, borderRadius: 2`. Filled when `i <= step` — `Colors.white`. Unfilled — `rgba(255,255,255,0.25)`.

### 4.5 Step counter

`{step + 1} / 5` — **11 px / `rgba(255,255,255,0.7)`** / `fontFamily: FontFamily.sansRegular`, marginTop **6**, position relative.

(Counter uses Western digits in EN, Devanagari digits in NE — `i18n` interpolation handles this via the `i18n-react-native-language-detector` fallback; numbers don't translate automatically, so we add a helper `digit(n)` that maps `0..9` to `०१२३४५६७८९` when `language === 'ne'`.)

---

## 5. Common — Question body (steps 0–4)

Outer wrapper: `paddingHorizontal: 22, paddingTop: 28, flex: 1, flexDirection: column`.

### 5.1 Emoji

`fontSize: 46, marginBottom: 14, textAlign: center`. Source: `QUESTIONS[step].icon`.

### 5.2 Question text

`fontSize: 17, fontWeight: 700, fontFamily: FontFamily.sansBold, color: Colors.tx, lineHeight: 25` (= 17 × 1.45), `textAlign: center, marginBottom: 24`. i18n: `server.onboarding.{qKey}` (`q1..q5`).

### 5.3 Yes/No tap-target row

`flexDirection: row, gap: 10`.

Each tile: `flex: 1, paddingVertical: 22, borderRadius: 14, alignItems: center`. TouchableOpacity, activeOpacity 0.85.

| State | Yes tile | No tile |
|---|---|---|
| Selected | bg `#9B6B14`, 2 px border `#9B6B14`, ✓ + label **white** | bg `#B5523A`, 2 px border `#B5523A`, ✗ + label **white** |
| Unselected | bg `#FBF0E0`, transparent 2 px border, ✓ + label `#9B6B14` | bg `#FBE8E0`, transparent 2 px border, ✗ + label `#B5523A` |

- **Glyph** — `fontSize: 26, marginBottom: 4`. `✓` for yes, `✗` for no.
- **Label** — `fontSize: 14, fontWeight: 800, fontFamily: FontFamily.sansExtraBold`. EN: `Yes` / `No`; NE: `छ` / `छैन`.

Tap: `setAnswers(a => ({ ...a, [qKey]: 'yes' | 'no' }))`.

### 5.4 Footer Continue button

Wrapper: `paddingHorizontal: 22, paddingTop: 18, paddingBottom: 22`.

Single full-width button (`width: 100%, paddingVertical: 15, borderRadius: 13, alignItems: center, justifyContent: center`):

- **Enabled** (the current step's answer is set): gradient `linear-gradient(135deg, #9B6B14, #6B4610)`. White text **15 / 700 / `fontFamily: FontFamily.sansBold`**.
- **Disabled** (no answer): `Colors.cr3` bg, `Colors.tx3` text, `disabled: true`.

Label:
- Steps 0–3 → `Continue →` (`server.onboarding.continue` + ` →`).
- Step 4 → `See result →` (`server.onboarding.see_result`).

Tap: `if (answers[qKey]) setStep(step + 1)`. From step 4 → setStep(5).

---

## 6. Per-step content

The hero / body / footer structure is identical across the 5 question steps. The **only** differences are emoji + question text. For exhaustive faithfulness, here's each step's exact content.

### 6.1 Step 0 — `q1` (Course completion)

| Field | Value |
|---|---|
| Emoji | 🪷 |
| Title (EN) | `Have you completed at least one 10-day Vipassana course?` |
| Title (NE) | `के तपाईंले कम्तीमा एक १०-दिने विपस्सना शिविर पूरा गर्नुभएको छ?` |
| Progress | `█░░░░` (segment 0 filled) |
| Counter | `1 / 5` |
| Next CTA | `Continue →` |

### 6.2 Step 1 — `q2` (Sitting regularly)

| Field | Value |
|---|---|
| Emoji | 🧘 |
| Title (EN) | `Are you sitting regularly at home?` |
| Title (NE) | `के तपाईं घरमा नियमित साधना गर्दै हुनुहुन्छ?` |
| Progress | `██░░░` |
| Counter | `2 / 5` |
| Next CTA | `Continue →` |

### 6.3 Step 2 — `q3` (Rest interval)

| Field | Value |
|---|---|
| Emoji | 📅 |
| Title (EN) | `Has it been at least 1 month since your last serving?` |
| Title (NE) | `के तपाईंको अघिल्लो सेवा सम्पन्न भएको कम्तीमा १ महिना भएको छ?` |
| Progress | `███░░` |
| Counter | `3 / 5` |
| Next CTA | `Continue →` |

### 6.4 Step 3 — `q4` (Health)

| Field | Value |
|---|---|
| Emoji | 💚 |
| Title (EN) | `Are you currently free of any major health concerns?` |
| Title (NE) | `के तपाईं अहिले प्रमुख स्वास्थ्य समस्याबाट मुक्त हुनुहुन्छ?` |
| Progress | `████░` |
| Counter | `4 / 5` |
| Next CTA | `Continue →` |

### 6.5 Step 4 — `q5` (Code of Discipline)

| Field | Value |
|---|---|
| Emoji | 📜 |
| Title (EN) | `Will you abide by the Code of Discipline for Dhamma Servers?` |
| Title (NE) | `के तपाईं धम्म सेवकको आचारसंहिता पालना गर्नुहुनेछ?` |
| Progress | `█████` |
| Counter | `5 / 5` |
| Next CTA | **`See result →`** (button changes; see §5.4) |

---

## 7. Step 5 — Result screen

Branches on `anyNo` (any answer is `no` → blocked path) vs `allYes` (every answer is `yes` → eligible path).

### 7.1 Result hero (branching gradient)

- **Eligible path**: `linear-gradient(160deg, #5A3800, #9B6B14)` — 2-stop gold (no light third stop here).
- **Blocked path**: `linear-gradient(160deg, #7A2A20, #B85040)` — 2-stop red.

Padding: `paddingHorizontal: 24, paddingTop: max(58, safeAreaTop + 14), paddingBottom: 36, overflow: hidden, position: relative, flexShrink: 0`.

**`LotusHero`** — `color: white, opacity: 0.1, size: 240, right: -50, bottom: -50` (larger + further off-canvas than the question hero).

**Big emoji** — `fontSize: 50, marginBottom: 8`:
- Eligible → `🙏`.
- Blocked → `⚠️`.

**Title** — **24 px / 800 / white** / `fontFamily: FontFamily.sansExtraBold`, `lineHeight: 29` (= 24 × 1.2):
- Eligible → `All Clear · Eligible to Serve 🙏` (`server.onboarding.complete`).
- Blocked → `Eligibility Pending` (`server.onboarding.blocked`).

**Sub** — **13 px / `rgba(255,255,255,0.85)`** / `fontFamily: FontFamily.sansRegular`, marginTop **6**, lineHeight **19.5** (= 13 × 1.5):
- Eligible → `Welcome to the path of selfless service. 🌿` (`server.onboarding.complete_sub`).
- Blocked → `Please review the Code of Discipline before applying. Contact the center coordinator if you have questions.` (`server.onboarding.blocked_sub`).

### 7.2 Responses recap card

Wrapper: `paddingHorizontal: 18, paddingTop: 22, flex: 1`.

Card: `Colors.fol` bg, **1.5 px** `Colors.fom` border, radius **16**, padding **15**, marginBottom **14** (no horizontal margin — wrapper owns it).

- **Title** — `Your responses` (`server.onboarding.responses_title`) — **13 px / 700 / `Colors.fo`** / `fontFamily: FontFamily.sansBold`, marginBottom **9**.
- **5 rows** (one per question, in q1→q5 order):
  - `flexDirection: row, alignItems: center, justifyContent: space-between, paddingVertical: 6, gap: 10`.
  - **1 px dashed `Colors.bd` bottom border** between rows 1–4, none after row 5. Implementation: sibling `<DashedDivider marginVertical={0} />` between rows (RN's `borderStyle: 'dashed'` doesn't render reliably for single-side borders).
  - **Left** — `{emoji} {question text}` — **12 px / `Colors.tx2`** / `fontFamily: FontFamily.sansRegular`, `flex: 1, paddingRight: 10, lineHeight: 17`.
  - **Right** — `✓ Yes` or `✗ No` — **11 px / 800** / `fontFamily: FontFamily.sansExtraBold`. Colour: `Colors.fo` if yes, `Colors.ur` if no. `flexShrink: 0`.

### 7.3 Result CTA(s)

Below the recap card. `paddingHorizontal: 18` (inherits wrapper).

**Common button shape** for both paths:

- Width 100 %, padding `15 / 22`, radius **13**, alignItems / justifyContent center, **15 / 700 / `fontFamily: FontFamily.sansBold`**.

**Eligible path** — single button:

- Gradient `linear-gradient(135deg, #9B6B14, #6B4610)`, white text.
- Label: `Enter Dashboard →` (`server.onboarding.cta_dashboard`).
- Shadow: `{ shadowColor: '#000', shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 4 }` (= the prototype's box-shadow on `.btn.pr`).
- Tap: `authStore.setOnboarded(true)` → `router.replace('/(server)/home')`.

**Blocked path** — two stacked buttons separated by **10 px gap**:

- **Primary — `Review answers`**: same gold gradient as the eligible button. Tap: `setAnswers({}); setStep(0);`.
- **Outline — `Continue anyway (limited access)`**: `.btn.ou` style — transparent bg, **2 px** `Colors.bd2` border, `Colors.tx` text. Padding `13 / 22`, radius **13**, **14 px / 700**. Tap: `authStore.setOnboarded(true)` → `router.replace('/(server)/home')`.

### 7.4 Bottom spacer

20 px + safe-area inset.

---

## 8. Behaviour

- **Entry**: routed automatically from login when `auth.role === 'server' && !auth.isOnboarded`. Index (`/` → `app/index.tsx`) already handles this branch.
- **Forward navigation**: Continue button advances step; from step 4 it lands on the result screen.
- **Backward navigation**: Back chevron decrements step on 1–4; on step 0 it `router.replace(Routes.login)`. On step 5 (result) the Back chevron in the hero is **not present** (per prototype — result is a terminal state with explicit CTAs only).
- **Persistence**: `setOnboarded(true)` writes through `authStore` → `settings.auth.session.isOnboarded = true`. Survives reload.
- **No language toggle on this flow** — the dashboard's `🌐 Lang` pill is intentionally absent; the prototype does not include it on the onboarding screens.

---

## 9. Data model

No schema changes. Uses existing `auth.isOnboarded` flag (already on `SessionPayload`) to gate skipping this screen on subsequent logins.

Out-of-scope-for-v1 (forward looking):
- `profile.serverOnboardedAt: string | null` — completion timestamp.
- `profile.serverOnboardingAnswers: { q1..q5: 'yes' | 'no' }` — for admin review.

Both are deliberately deferred — the prototype doesn't persist them either.

---

## 10. What's changing vs current implementation

Current `app/(server)/onboarding.tsx` (~341 lines) uses an inline English `QUESTIONS` array with a `required` boolean instead of the prototype's i18n keys + all-yes / any-no branching. The rebuild:

- Replaces the hardcoded English question array with the prototype's `s_onb_q1..q5` keys.
- Adopts the prototype's 5-question structure (preserves question wording per spec §6).
- Adds the prototype's all-yes vs any-no result branching (current treats any-no as outright block; new spec has the "Continue anyway (limited access)" escape hatch).
- Adopts the prototype's gradient palette (`#5A3800 → #9B6B14 → #D4A050` for questions; `#7A2A20 → #B85040` for blocked) and Lotus / Mountain decorations.
- Switches the option tiles to the prototype's selected vs unselected colour pair (tinted bg ↔ filled bg with white text).

---

## 11. i18n

All copy in `server.onboarding.*` keys (en + ne, Acharya-correct). Use prototype text verbatim from `app.html:609 / 660`:

| Key | EN | NE |
|---|---|---|
| `title` | `Welcome, Dhamma Server` | `स्वागत छ, धम्म सेवक` |
| `sub` | `Before you can serve, please confirm your readiness.` | `सेवा गर्नुअघि कृपया तपाईंको तत्परता पुष्टि गर्नुहोस्।` |
| `q1` | `Have you completed at least one 10-day Vipassana course?` | `के तपाईंले कम्तीमा एक १०-दिने विपस्सना शिविर पूरा गर्नुभएको छ?` |
| `q2` | `Are you sitting regularly at home?` | `के तपाईं घरमा नियमित साधना गर्दै हुनुहुन्छ?` |
| `q3` | `Has it been at least 1 month since your last serving?` | `के तपाईंको अघिल्लो सेवा सम्पन्न भएको कम्तीमा १ महिना भएको छ?` |
| `q4` | `Are you currently free of any major health concerns?` | `के तपाईं अहिले प्रमुख स्वास्थ्य समस्याबाट मुक्त हुनुहुन्छ?` |
| `q5` | `Will you abide by the Code of Discipline for Dhamma Servers?` | `के तपाईं धम्म सेवकको आचारसंहिता पालना गर्नुहुनेछ?` |
| `yes` | `Yes` | `छ` |
| `no` | `No` | `छैन` |
| `continue` | `Continue` | `अघि बढ्नुहोस्` |
| `see_result` | `See result →` | `नतिजा हेर्नुहोस् →` |
| `complete` | `All Clear · Eligible to Serve 🙏` | `सबै ठीक · सेवा गर्न योग्य 🙏` |
| `complete_sub` | `Welcome to the path of selfless service. 🌿` | `निःस्वार्थ सेवाको मार्गमा स्वागत छ। 🌿` |
| `blocked` | `Eligibility Pending` | `योग्यता विचाराधीन` |
| `blocked_sub` | `Please review the Code of Discipline before applying. Contact the center coordinator if you have questions.` | `कृपया आवेदन दिनुअघि आचारसंहिता हेर्नुहोस्। प्रश्न भए केन्द्र समन्वयकलाई सम्पर्क गर्नुहोस्।` |
| `responses_title` | `Your responses` | `तपाईंका जवाफहरू` |
| `cta_dashboard` | `Enter Dashboard →` | `ड्यासबोर्डमा प्रवेश →` |
| `cta_review` | `Review answers` | `फेरि प्रयास गर्नुहोस्` |
| `cta_continue_anyway` | `Continue anyway (limited access)` | `पछि गर्नुहोस्` |

---

## 12. Acceptance checklist

### Questions (steps 0–4)
- [ ] Three-stop gold gradient hero with Lotus + Mountain decorations
- [ ] Back link returns to previous step or login from step 0
- [ ] Kicker uses Devanagari font; title is 20/800 white, lineHeight 26
- [ ] 5-segment progress bar fills correctly per step
- [ ] Counter shows `{N} / 5` (Devanagari digits in NE)
- [ ] Emoji 46 px, question text 17/700 centred with lineHeight 25
- [ ] Yes tile: gold tint when unselected, filled gold when selected; No tile: red tint / filled red
- [ ] Continue button disabled (cream-3) until current step has an answer
- [ ] Last step's button reads `See result →`

### Result (step 5)
- [ ] All-yes → 2-stop gold hero with 🙏 + `All Clear · Eligible to Serve 🙏`
- [ ] Any-no → 2-stop red hero with ⚠️ + `Eligibility Pending`
- [ ] Recap card lists every question with ✓/✗ in the correct colour
- [ ] All-yes shows single `Enter Dashboard →` CTA
- [ ] Any-no shows `Review answers` (gold) + `Continue anyway (limited access)` (outline)
- [ ] Enter Dashboard / Continue anyway set `auth.isOnboarded = true` and route to `/(server)/home`
- [ ] Review answers resets state and returns to step 0

### Cross-cutting
- [ ] All copy through `server.onboarding.*` i18n (en + ne)
- [ ] No language toggle on this flow (matches prototype)
- [ ] Typecheck clean, tests pass

---

## Implementation notes (post-build corrections)

- Q2 ("Are you sitting regularly at home?") icon is the **animated dhamma-wheel GIF** at `assets/logo-dhamma.gif`, not the `🧘` emoji. The recap row shows `☸️` glyph for the same question. Sentinel value `'wheel'` in the `QUESTIONS` array drives the conditional render.
- `resultSub` style is `fontSize: 14, lineHeight: 21` (bumped from spec's 13/19.5) so the blocked-state body text wraps naturally with "Contact..." on its own line.
