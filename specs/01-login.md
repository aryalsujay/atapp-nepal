# Spec: 01 — Login (v2)

> **Status:** 🔨 `code_in_progress` — Login v2 implementation on branch `screen/01-login-v2`
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-13
> **Pilot:** First screen migrated under the spec-first workflow. **v2 extends the prototype with production features:** email-or-phone identifier, save-password toggle, demo auto-login on role tap, local GIF logo, and +2 px font baseline.

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `01-login` |
| Route (Expo Router) | `/(auth)/login` |
| Source file | `app/(auth)/login.tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines **891–937**, with CSS classes at **510–512** (`.inp`, `.ilab`) and **499** (`.btn.pr`) |
| Roles | `all` (entry point) |
| Related specs | `02-auth-router`, `03-teacher-onboarding`, `12-server-onboarding`, `21-admin-dashboard` |

---

## 2. Purpose

Three-mode entry point. The user picks a role (Teacher / Server / Admin), enters email + password, and signs in. The screen also conveys that teacher accounts are invite-only (admin-created) and switches its hero color + CTA label to match the chosen role.

---

## 3. Visual Layout (top → bottom)

Viewport: 390×844 (iPhone 14 size). Screen background: `Colors.cr` (`#F8F3EB`).

### 3.1 Status bar
- Renders the iOS status bar inside the hero. In prototype: `<SBar dark={false}/>` → light icons because the hero is dark.
- In our app: `<StatusBar barStyle="light-content" translucent backgroundColor="transparent" />`.

### 3.2 Hero gradient block (top)
- Padding: `58px top, 24px horizontal, 36px bottom`
- `position: relative; overflow: hidden`
- Gradient direction **160°**, three stops, varies by mode (see §5)
- `transition: background .3s` on mode change (smooth color crossfade)

Contents (in z-order, back → front):

1. **`LotusHero`** — `color="white"`, `opacity=0.1`, `size=260`, `right=-50`, `bottom=-50`
2. **`MountainSilhouette`** — `color="rgba(255,255,255,0.07)"`
3. **Logo image** — wrapper has `marginBottom: 10`
   - `<img>` 56×56 px, `objectFit: contain`
   - `src`: Dhamma Wheel logo (see `_design-tokens.md` §8)
4. **App name** — text `Dhamma AT`
   - 30 px / 800 weight / white / line-height 1.1
5. **Nepali subtitle** — text `विपस्सना शिक्षक/सेवक अनुसूचक`
   - 14 px / `rgba(255,255,255,0.8)` / `marginTop: 5`
   - Font family: Noto Sans Devanagari
6. **English subtitle** — text `Teacher · Server · Admin · Nepal`
   - 12 px / `rgba(255,255,255,0.6)` / `marginTop: 2`

> ⚠️ The prototype does NOT show a language-toggle button on the login screen. The current implementation adds a `🌐 नेपाली` pill top-right; per the "100% as-is" rule this should be removed for the pilot (logged as intentional delta — see §12).

### 3.3 Form area
- Padding: `20px top, 18px horizontal, 0 bottom`
- `flex: 1`

#### 3.3.1 Role pill (segmented control)
- Container: `background: Colors.cr2 (#F0E9DC)`, `borderRadius: 13`, `padding: 4`, `flexDirection: row`, `marginBottom: 20`
- Three tabs in this order: **Teacher → Server → Admin**
- Each tab:
  - `flex: 1`, `padding: 9px 4px`, `borderRadius: 10`, `cursor: pointer`
  - Label is a single inline string (emoji + word): `🧘 Teacher`, `🌿 Server`, `🛠 Admin`
  - Font: 12.5 px / 700
  - Active: `background: white`, `color: Colors.sfd (#A85C08)`, `boxShadow: Shadows.card` (`0 2px 14px rgba(28,20,8,0.09)`)
  - Inactive: `background: transparent`, `color: Colors.tx2 (#7A6A58)`
  - Transition: `all .2s`

> The active tab color stays saffron-dark (`sfd`) regardless of which mode is active — it doesn't switch to blue for admin or brown for server. That's prototype behavior.

#### 3.3.2 Email / ID field
- Wrapper: `marginBottom: 14`
- Label (`.ilab`): text `Email / ID`
  - 11 px / 700 / `Colors.tx2` / uppercase / letter-spacing 0.04em / `marginBottom: 5`
- Input (`.inp`):
  - `width: 100%`, `background: Colors.cr`, border `1.5px solid Colors.bd`, `borderRadius: 12`, `padding: 13px 15px`
  - Font: 14 px Plus Jakarta Sans, color `Colors.tx`
  - Focus: `borderColor: Colors.sf`, `background: white`
  - **Default value** depends on mode (pre-filled for demo):
    - Teacher: `ananda@dhamma.org.np`
    - Server: `priya@dhamma.org.np`
    - Admin: `admin@dhamma.org.np`
  - Placeholder: `your@email.com`
  - `keyboardType: email-address`, `autoCapitalize: none`, `autoCorrect: false`

#### 3.3.3 Password field
- Wrapper: `marginBottom: 16`
- Label: text `Password`, same `.ilab` style
- Input (`.inp`): `type="password"`, no pre-fill in production build (see §12 delta vs prototype `defaultValue="••••••••"`)

#### 3.3.4 Forgot password link
- Wrapper: `textAlign: right`, `marginBottom: 20`
- Inner pressable text: `Forgot password?`
  - 13 px / 600 / `Colors.sf` / cursor pointer
- **Behavior:** for the pilot, tap shows an `Alert.alert` with message `Contact your Regional Administrator to reset your password.` Future iteration may add a real reset flow.

#### 3.3.5 Sign-in button
- Class `.btn.pr` (primary CTA):
  - Width 100%, `padding: 15px 22px`, `borderRadius: 13`
  - Background: linear-gradient(135°, `Colors.sf`, `Colors.sfd`) — **always saffron, regardless of mode**
  - Box-shadow: `0 4px 16px rgba(212,118,14,0.32)`
  - Font: 15 px / 700 / white / Plus Jakarta Sans
  - Active state: `transform: scale(0.96)`
- Label depends on mode:
  - Teacher → `Continue as Teacher →`
  - Server → `Continue as Server →`
  - Admin → `Sign in as Admin →`
- Disabled state (during async): show `Signing in...`, opacity 0.6

#### 3.3.6 Invite-only notice (TEACHER MODE ONLY)
- Conditional: visible only when `mode === 'teacher'`
- Wrapper: `marginTop: 14`, `padding: 10px 12px`, `background: Colors.bll (#E6F0FA)`, border `1px solid #BDD4EE`, `borderRadius: 11`, `flexDirection: row`, `gap: 9`, `alignItems: flex-start`
- Icon: `🔒` at 14 px, `marginTop: 1`
- Text (i18n key `login.invite_only`):
  - 11 px / `Colors.tx2` / `lineHeight: 1.5` / `flex: 1`
  - EN: `Teacher accounts are created by your center administrator. If you've been authorized but don't have an account, contact your Regional Administrator.`
  - NE: `शिक्षक खाताहरू तपाईंको केन्द्र व्यवस्थापकद्वारा सिर्जना गरिन्छन्। यदि तपाईं प्राधिकृत हुनुहुन्छ तर खाता छैन भने, क्षेत्रीय व्यवस्थापकलाई सम्पर्क गर्नुहोस्।`

#### 3.3.7 Footer disclaimer
- `marginTop: 12`, `textAlign: center`
- 12 px / `Colors.tx3`
- Text: `By continuing you agree to serve with ` + inline span (`color: Colors.sf`) text `Dhamma`
- Trailing spacer: `<div style={{height: 20}}/>`

---

## 4. Component Inventory

| # | Element | Type | Component | Status |
|---|---|---|---|---|
| 1 | Hero gradient | view | `LinearGradient` (expo-linear-gradient) | ✓ existing |
| 2 | Lotus background | svg | `<LotusHero>` from `src/components/ui/HeroDecorations` | ✓ existing |
| 3 | Mountain background | svg | `<MountainSilhouette>` from `src/components/ui/HeroDecorations` | ✓ existing |
| 4 | Dhamma logo | image | `<Image>` from `react-native` | — needs adding |
| 5 | App name / subtitles | text | `<Text>` | ✓ existing |
| 6 | Role pill container | view | inline `<View>` | ✓ existing |
| 7 | Role tab button | pressable | local `RoleTab` component | ✓ existing — needs label restyle |
| 8 | Field label | text | inline `<Text style={styles.fieldLabel}>` | ✓ existing — restyle to `.ilab` |
| 9 | Text input | input | `<TextInput>` | ✓ existing — restyle to `.inp` |
| 10 | Forgot password link | pressable | inline `<TouchableOpacity><Text>` | — needs adding |
| 11 | Primary CTA | button | `<TouchableOpacity>` wrapping `<LinearGradient>` | needs gradient wrap |
| 12 | Invite-only notice | view | inline view; consider extracting as `<InfoNotice>` if reused | — needs adding |
| 13 | Footer disclaimer | text | `<Text>` with inline `<Text>` for "Dhamma" | — needs adding |
| 14 | Fade-in animation | wrapper | `<FadeInView>` from `src/components/ui/FadeInView` | ✓ existing — keep |

---

## 5. Design Tokens

| Element | Tokens | Notes |
|---|---|---|
| Screen background | `Colors.cr` | scroll bg |
| Teacher hero gradient | `Gradients.teacher` + `GradientDirection.hero` | 160°, 3 stops |
| Server hero gradient | `Gradients.server` + `GradientDirection.hero` | 160°, 3 stops — newly exported |
| Admin hero gradient | `Gradients.admin` + `GradientDirection.hero` | 160°, 3 stops |
| Logo bg circle | n/a | logo image stands alone; no bg |
| Role pill container | `Colors.cr2` | `#F0E9DC` |
| Active tab | `Colors.white`, text `Colors.sfd`, `Shadows.card` | warm shadow `Shadows.card` |
| Inactive tab text | `Colors.tx2` | `#7A6A58` |
| Input bg | `Colors.cr` | not white — matches `.inp` |
| Input border | `Colors.bd` 1.5px | focus → `Colors.sf`, bg → white |
| Input text | `Colors.tx` | 14 px |
| Input padding | `Layout.inputPadV (13)` / `Layout.inputPadH (15)` | |
| Field label | `Colors.tx2` 11 px / 700 / uppercase / 0.04em | |
| Forgot password | `Colors.sf` 13 / 600 | |
| Primary CTA gradient | `Gradients.primaryCta` + `GradientDirection.button` | 135°, sf → sfd |
| Primary CTA shadow | `Shadows.primaryCta` | warm saffron tint |
| Primary CTA radius | 13 (literal) | |
| Primary CTA padding | `Layout.buttonPadV (15)` / `Layout.buttonPadH (22)` | |
| Invite notice bg | `Colors.bll` | `#E6F0FA` |
| Invite notice border | `Colors.bld` 1px | newly added token (was inline `#BDD4EE`) |
| Invite notice text | `Colors.tx2` 11 px lh 1.5 | |
| Footer disclaimer | `Colors.tx3` 12 px; "Dhamma" `Colors.sf` | |

### Local constants
None — all values now reference tokens.

---

## 6. Strings & i18n

> The prototype only translates `lg_invite_only`; the rest of the login UI strings are hardcoded English. For the pilot we will make every user-visible string i18n-managed (this is an intentional improvement; see §12).

| Key (proposed) | Used in | English | Nepali |
|---|---|---|---|
| `login.title` | hero title | `Dhamma AT` | `Dhamma AT` |
| `login.subtitle_ne` | hero NE subtitle | `विपस्सना शिक्षक/सेवक अनुसूचक` | `विपस्सना शिक्षक/सेवक अनुसूचक` |
| `login.subtitle_en` | hero EN subtitle | `Teacher · Server · Admin · Nepal` | `शिक्षक · सेवक · व्यवस्थापक · नेपाल` |
| `login.tab_teacher` | role pill | `🧘 Teacher` | `🧘 शिक्षक` |
| `login.tab_server` | role pill | `🌿 Server` | `🌿 सेवक` |
| `login.tab_admin` | role pill | `🛠 Admin` | `🛠 व्यवस्थापक` |
| `login.email_label` | field label | `Email / ID` | `इमेल / आईडी` |
| `login.email_placeholder` | input placeholder | `your@email.com` | `your@email.com` |
| `login.password_label` | field label | `Password` | `पासवर्ड` |
| `login.forgot` | link | `Forgot password?` | `पासवर्ड बिर्सनुभयो?` |
| `login.forgot_alert` | alert body | `Contact your Regional Administrator to reset your password.` | `पासवर्ड रिसेट गर्न क्षेत्रीय व्यवस्थापकलाई सम्पर्क गर्नुहोस्।` |
| `login.cta_teacher` | CTA button | `Continue as Teacher →` | `शिक्षकका रूपमा जारी राख्नुहोस् →` |
| `login.cta_server` | CTA button | `Continue as Server →` | `सेवकका रूपमा जारी राख्नुहोस् →` |
| `login.cta_admin` | CTA button | `Sign in as Admin →` | `व्यवस्थापकका रूपमा साइन इन गर्नुहोस् →` |
| `login.cta_loading` | CTA loading state | `Signing in...` | `साइन इन भइरहेको छ...` |
| `login.invite_only` | notice body | `Teacher accounts are created by your center administrator. If you've been authorized but don't have an account, contact your Regional Administrator.` | `शिक्षक खाताहरू तपाईंको केन्द्र व्यवस्थापकद्वारा सिर्जना गरिन्छन्। यदि तपाईं प्राधिकृत हुनुहुन्छ तर खाता छैन भने, क्षेत्रीय व्यवस्थापकलाई सम्पर्क गर्नुहोस्।` |
| `login.footer_prefix` | footer | `By continuing you agree to serve with ` | `जारी राख्दा तपाईं सेवा गर्न सहमत हुनुहुन्छ ` |
| `login.footer_brand` | footer | `Dhamma` | `धम्म` |

> All existing `login.*` keys in `en.json` / `ne.json` will be replaced with this set during implementation.

---

## 7. Local State

| Name | Type | Initial | Purpose |
|---|---|---|---|
| `mode` | `'teacher' \| 'server' \| 'admin'` | `'teacher'` | active role tab |
| `identifier` | `string` | demo email per mode | email input value |
| `password` | `string` | `''` | password input value |
| `showPassword` | `boolean` | `false` | toggle masking (current app has eye icon — see §12) |
| `loading` | `boolean` | `false` | guards double-submit |

> **Decision needed (§13):** Does the eye-toggle stay or get removed? Prototype has no eye-toggle. Per "100% as-is", remove it. The eye-toggle is convenient on mobile so opinions may differ.

---

## 8. Behavior

| Trigger | Action | Result |
|---|---|---|
| Mount | seed `identifier` with demo email for `mode='teacher'` | field pre-filled |
| Tap role tab | `setMode(role)` AND swap `identifier` to that role's demo email | hero gradient transitions 0.3s; CTA label updates; teacher-only notice toggles |
| Type email | controlled update | — |
| Type password | controlled update | — |
| Tap "Forgot password?" | `Alert.alert(t('login.forgot_alert'))` | user sees instruction; no navigation |
| Tap CTA, empty fields | `Alert.alert('Missing Fields', 'Please enter your credentials.')` | block submit |
| Tap CTA, admin role | match against `admin.json` username/password | success → `/(admin)/dashboard`; fail → `Alert.alert('Invalid Credentials', ...)` |
| Tap CTA, teacher role | `findTeacher(identifier)` → check `passwordHash === password` | success → if `isOnboarded` → `/(teacher)/home`; else → `/onboarding/teacher/1`. Fail → alert. |
| Tap CTA, server role | `findTeacher(identifier)` → check role is `server` AND `passwordHash === password` | success → if `isOnboarded` → `/(server)/home`; else → `/(server)/onboarding`. Fail → alert. |
| CTA in flight | disable button, set `loading=true`, label → `Signing in...` | prevent re-submit |

### Validation rules
- Empty `identifier` OR empty `password` → blocked with single combined alert
- Trim `identifier` before lookup
- No client-side email-format validation (matches prototype)

---

## 9. Data Dependencies

| Store | Reads | Writes |
|---|---|---|
| `authStore` | (none — this is the entry) | `setAuth(role, userId, isOnboarded)` |
| `teachersStore` | `findTeacher(identifier)` | none |
| `settingsStore` | — | none on this screen (see §12 — language toggle removed) |
| `src/data/admin.json` | imported directly: `username`, `password`, `id` | none |

---

## 10. Navigation

| Direction | Source | Target |
|---|---|---|
| In | unauthenticated `/` redirect | `/(auth)/login` |
| Out — teacher new | tap CTA, role=teacher, valid, `!isOnboarded` | `/onboarding/teacher/1` |
| Out — teacher returning | tap CTA, role=teacher, valid, `isOnboarded` | `/(teacher)/home` |
| Out — server new | tap CTA, role=server, valid, `!isOnboarded` | `/(server)/onboarding` |
| Out — server returning | tap CTA, role=server, valid, `isOnboarded` | `/(server)/home` |
| Out — admin | tap CTA, role=admin, valid | `/(admin)/dashboard` |
| Out — forgot | tap "Forgot password?" | (none — alert only for pilot) |

---

## 11. Acceptance Checklist

- [ ] Hero gradient stops match `Gradients.teacher/server/admin` exactly at 160°
- [ ] Logo image renders from `dhamma.org` URL at 56×56
- [ ] App name `Dhamma AT` is 30 px / 800 weight white
- [ ] Nepali subtitle is `विपस्सना शिक्षक/सेवक अनुसूचक` at 14 px / opacity 0.8
- [ ] English subtitle is `Teacher · Server · Admin · Nepal` at 12 px / opacity 0.6
- [ ] Role tabs are in order: Teacher, Server, Admin
- [ ] Role tab labels are inline: "🧘 Teacher", "🌿 Server", "🛠 Admin"
- [ ] Active tab has white bg, `Colors.sfd` text, card shadow
- [ ] Email label is uppercase 11 px tracked-out, says "Email / ID"
- [ ] Email field bg is `Colors.cr` (cream), not white
- [ ] Email field pre-fills demo address on mode change
- [ ] Password field has uppercase label "Password"
- [ ] Forgot-password link appears, right-aligned, above CTA
- [ ] CTA is gradient saffron `135° sf→sfd`, label changes per mode
- [ ] CTA label has `→` arrow suffix (for teacher/server: "Continue as X →"; admin: "Sign in as Admin →")
- [ ] Teacher mode shows blue invite-only notice with 🔒 icon
- [ ] Server and Admin modes do NOT show the invite notice
- [ ] Footer shows `By continuing you agree to serve with Dhamma` with "Dhamma" in saffron
- [ ] No language-toggle button visible on login (intentional delta — see §12)
- [ ] No "Sadhu 🙏" footer text visible (replaced with disclaimer)
- [ ] No demo-credentials hint box visible (replaced with invite notice in teacher mode only)
- [ ] EN and NE render without text overflow at 390 px width
- [ ] Status bar icons are light (white) over the dark hero
- [ ] Safe-area inset respected at top so SBar doesn't cover hero content
- [ ] Tap-down animation on CTA (`scale(0.96)`)
- [ ] Tap-down on role tabs (`opacity` or `scale`)
- [ ] No console warnings

---

## 12. Intentional Deltas from Prototype (v2)

All v1 deltas still apply. v2 adds the following production features that **intentionally depart from the prototype**:

| Delta | Prototype | Our app v2 | Why |
|---|---|---|---|
| **Email-or-phone identifier** | email only | unified `identifier` field accepts email, phone, or invite code; auto-classifies based on input | Nepali users frequently sign in by phone. The field icon (✉️ / 📱 / 🔑) updates as they type. |
| **Save password** | not present | checkbox below password; persists `{role, identifier, password}` to `expo-secure-store` on success; restored on next launch | Standard mobile UX. Storage is encrypted (iOS Keychain / Android Keystore). User can opt out per session. |
| **Demo auto-login on role tap** | not present | tapping a role tab fills the demo creds and auto-submits 250 ms later | Lets reviewers/testers cycle roles fast without retyping. Production users tap, then type their own creds — auto-submit only fires when the tap happens to fill creds. |
| **Eye icon password toggle** | not present in prototype | present — `👁️/🙈` toggle | Standard mobile UX; small enough not to clash with prototype's visual feel. |
| **Bigger fonts** | 11–14 px body | +2 px baseline (13–16 px); title 30 → 32, CTA 15 → 17, etc. | Older teachers and Devanagari readers struggle with 11 px. New scale documented in `_design-tokens.md`. |
| **Local GIF logo** | network GIF from `dhamma.org` | bundled `assets/logo-dhamma.gif` via `expo-image` | No network flash on cold start; works offline; encrypted at rest with the rest of the bundle. |
| Strings are i18n-managed, not hardcoded | hardcoded EN for most labels | every string in `en.json`/`ne.json` | Production app must support full NE. |
| Password field is empty | `defaultValue="••••••••"` (visual only) | empty controlled `''` | Real auth requires the user to type their password. |
| Auth is real, not stubbed | `onClick={()=>nav(target)}` | validates against `admin.json` + `teachersStore` | Current app has working auth. |
| Forgot-password shows a toast | `onClick` not wired | `toast.info(...)` | Tappable elements must do something. Reset flow is a future spec. |
| No language toggle on login | not present | not present in v2 | Matches prototype intent; switcher lives in settings. |
| Sign-out routes back here | prototype `nav("login")` | `router.replace(Routes.login)` | Same intent. |

### Key identifier classification

| Input pattern | Type | Storage lookup |
|---|---|---|
| contains `@` | email | `teachersStore.findTeacher(identifier)` matches by `email` |
| starts with digit or `+` | phone | normalized (strip spaces/dashes/parens), matched by `email` (until phone field added to seed) |
| anything else (admin mode only) | username | exact match against `admin.json:username` |

> Phone-number lookup currently falls through to `email` matching because seed teachers don't have phone numbers yet. Once we add `phone` to the teachers table (post-SQLite Phase D), the repository can look up by either column.

### Save password persistence

- Storage key: `dhamma.savedCreds.v1`
- Backend: `expo-secure-store` (iOS Keychain / Android Keystore)
- Payload: `{ role: 'teacher'|'server'|'admin', identifier: string, password: string }`
- Restored on mount; user can unset by unchecking the box and signing in again.

---

## 13. Open Questions

- [ ] **Demo email defaults** — keep `ananda@dhamma.org.np`, `priya@dhamma.org.np`, `admin@dhamma.org.np` pre-filled in production? Or only in a dev build? Recommend: keep until we have a real user base; matches prototype.
- [ ] **Logo asset** — fetch the GIF from `dhamma.org` URL at runtime, or bundle as a local PNG/SVG asset? Network-dependent splash flash is bad UX; bundling is safer.
- [ ] **Language toggle on login** — strict prototype match says remove; but for first-time NE users, removing it forces them through to onboarding before they can change language. Recommend: revisit after seeing how onboarding looks.
- [ ] **Eye-icon on password** — remove to match prototype, or keep as a UX nicety? Recommend: remove for pilot, revisit if testers complain.
- [ ] **Forgot-password destination** — alert for pilot is fine; should we add a real flow as a follow-up screen?
- [ ] **`Colors.tx3` color value** — align our `#AFA090` to prototype `#B0A090`? 1-byte change. Recommend: align in the same pass to keep the design-tokens file truthful.
- [ ] **Admin login identifier** — prototype pre-fills `admin@dhamma.org.np` but `admin.json` stores `username: "admin"`. Should admins log in by email or username? Pick one and update both the data file and the prefilled value.

---

## 14. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-13 | Claude (drafted) | Initial spec for review |
| 2026-05-13 | Claude (impl)    | Implemented `app/(auth)/login.tsx` per spec; updated `colors.ts`, `shadows.ts`, `spacing.ts`, `HeroDecorations.tsx`, `en.json`, `ne.json` |
