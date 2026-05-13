# Design Tokens — Source of Truth

Every screen spec references this file instead of repeating hex / px / weight values. When the prototype changes, update this file once and every spec stays consistent.

**Prototype reference:** `VipassanaTeacherApp/app.html` lines **445–545** (`:root` CSS variables + global classes + `@keyframes`).
**Implementation:** `src/theme/colors.ts`, `src/theme/typography.ts`, `src/theme/spacing.ts`, `src/theme/shadows.ts`.

All deltas vs prototype have been resolved as of 2026-05-13. Going forward, if any value in this file diverges from the prototype, flag it with ⚠️ and link to the resolving spec.

---

## 1. Colors

### Primary — Teacher / Saffron
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.sf` | `#D4760E` | `--sf` | saffron main, teacher accents |
| `Colors.sfd` | `#A85C08` | `--sfd` | saffron darker (gradient stop, active state) |
| `Colors.sfl` | `#FDF1E3` | `--sfl` | saffron light bg, chips |
| `Colors.sfm` | `#FAE0C0` | `--sfm` | saffron medium bg, avatars |

### Approved / Forest Green
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.fo` | `#3D6847` | `--fo` | forest main, approved badges |
| `Colors.fol` | `#E8F2EA` | `--fol` | forest light bg |
| `Colors.fom` | `#C8DFCB` | `--fom` | forest medium bg |
| `Colors.foDark` | `#2D5236` | (inline) | second stop of `.btn.fo-btn` gradient |

### Neutral / Surface — Beige/Cream
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.cr` | `#F8F3EB` | `--cr` | screen base, default bg |
| `Colors.cr2` | `#F0E9DC` | `--cr2` | secondary surfaces, pill containers |
| `Colors.cr3` | `#E5DDD0` | `--cr3` | tertiary, meter rails |
| `Colors.white` | `#FFFFFF` | `--card` | cards, raised surfaces |

### Text
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.tx` | `#1C1410` | `--tx` | primary text |
| `Colors.tx2` | `#7A6A58` | `--tx2` | secondary text |
| `Colors.tx3` | `#B0A090` | `--tx3` | tertiary / muted |

### Borders
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.bd` | `#EAE2D4` | `--bd` | default border |
| `Colors.bd2` | `#DDD4C5` | `--bd2` | stronger border |

### Error / Urgent — Red
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.ur` | `#C0392B` | `--ur` | urgent / error |
| `Colors.url` | `#FDECEA` | `--url` | urgent light bg |
| `Colors.urd` | `#F5C0BB` | (inline) | urgent border (`.btn.dg`) |

### Gold / Pending
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.gd` | `#C89000` | `--gd` | pending / festival |
| `Colors.gdl` | `#FFF8E3` | `--gdl` | gold light bg |
| `Colors.gdd` | `#7A6000` | (inline) | gold dark text |

### Admin / Blue
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.bl` | `#1A5C96` | `--bl` | admin accent |
| `Colors.bll` | `#E6F0FA` | `--bll` | admin light bg, info notices |
| `Colors.bld` | `#BDD4EE` | (inline) | blue border (invite-only notice) |
| `Colors.bl2` | `#5B6FA8` | (inline) | step-down button accent |

### Server / Earthy Tan
| Token | Hex | CSS var | Used for |
|---|---|---|---|
| `Colors.sv` | `#8B5E14` | `--sv` | server accent |
| `Colors.svd` | `#6B4610` | `--svd` | server darker |
| `Colors.svl` | `#FBF0E0` | `--svl` | server light bg |
| `Colors.svm` | `#F5DFB8` | `--svm` | server medium bg |
| `Colors.svfo` | `#4A7A58` | `--svfo` | server forest accent |

### Shadow base
| Token | Hex | Used for |
|---|---|---|
| `Colors.shadowBase` | `#1C1408` | warm-toned shadow color used by `--sh` / `--shl` |

---

## 2. Gradients

All hero gradients are **160°**, all button gradients are **135°**. The direction is applied at the call site via `LinearGradient`'s `start`/`end` props using the helpers in `GradientDirection`.

| Token | Stops | Direction | Used for |
|---|---|---|---|
| `Gradients.teacher` | `#6B3600`, `#C87010`, `#E8A058` | `GradientDirection.hero` (160°) | login hero (teacher), teacher home hero |
| `Gradients.server` | `#5A3800`, `#9B6B14`, `#D4A050` | hero | login hero (server), server dash hero |
| `Gradients.admin` | `#0F2A40`, `#1A4A72`, `#2A6096` | hero | login hero (admin), admin dashboard hero |
| `Gradients.approved` / `Gradients.course` | `#2A4A30`, `#3D6847` | hero | course confirmation, briefing |
| `Gradients.autoSchedule` | `#1C4228`, `#3D6847` | hero | admin auto-schedule hero |
| `Gradients.adminReview` | `#0F2438`, `#1A5C96` | hero | admin review hero |
| `Gradients.primaryCta` | `#D4760E`, `#A85C08` | `GradientDirection.button` (135°) | `.btn.pr` saffron CTA |
| `Gradients.forestCta` | `#3D6847`, `#2D5236` | button | `.btn.fo-btn` confirm/approve CTA |

---

## 3. Typography

Font families:
- **Plus Jakarta Sans** for Latin (loaded via `@expo-google-fonts/plus-jakarta-sans`)
- **Noto Sans Devanagari** for Nepali

Font sizes — common values mapped to `FontSize.*`; specific fractional or one-off values are written as literals in screens.

| Token | px | Used for |
|---|---|---|
| `FontSize.xs` | 11 | uppercase labels (`.ilab`), notice body |
| `FontSize.sm` | 12 | chip text, section header (`.sph`), footer |
| `FontSize.smPlus` | 13 | body small, forgot-password link |
| `FontSize.md` | 14 | input text (`.inp`), card body |
| `FontSize.mdPlus` | 15 | primary CTA (`.btn.pr`) |
| `FontSize.base` | 16 | section emojis |
| `FontSize.lg` | 17 | section title |
| `FontSize.xl` | 18 | card title |
| `FontSize.xxl` | 20 | stat numbers |
| `FontSize.h3` | 22 | card title large |
| `FontSize.h2` | 24 | screen heading |
| `FontSize.h1` | 28 | screen title |
| `FontSize.hero` | 32 | hero title (use 30 inline for login per prototype) |

Inline literals also valid: `9, 9.3, 9.5, 10, 10.5, 11.5, 12.5, 13.5, 22, 23, 26, 30`.

Weights — `400 normal`, `500 medium`, `600 semibold`, `650 (literal, nav-tab labels)`, `700 bold`, `800 extrabold`.

Letter-spacing — `-0.01em` (nav), `0.04em` (`.ilab`), `0.06em` (pill), `0.07em` (`.sph`).

---

## 4. Spacing

| Token | px | Used for |
|---|---|---|
| `Spacing.xs` | 4 | tight gaps, pill inner padding |
| `Spacing.sm` | 8 | small gaps, divider sections |
| `Spacing.md` | 12 | form-field gap |
| `Spacing.lg` | 18 | screen horizontal padding |
| `Spacing.xl` | 24 | hero horizontal padding |
| `Spacing.xxl` | 28 | between major sections |
| `Spacing.xxxl` | 40 | extra-large gaps |

| Layout | px | Used for |
|---|---|---|
| `Layout.horizontalPad` | 18 | screen padding |
| `Layout.cardPad` | 18 | card outer margin |
| `Layout.heroPadTop` | 56 | hero top padding (overrideable per screen — Login uses 58) |
| `Layout.heroPadBottom` | 22 | hero bottom padding (override per screen) |
| `Layout.buttonPadV` | 15 | `.btn.pr` vertical |
| `Layout.buttonPadH` | 22 | `.btn.pr` horizontal |
| `Layout.inputPadV` | 13 | `.inp` vertical |
| `Layout.inputPadH` | 15 | `.inp` horizontal |
| `Layout.chipPadV` | 7 | filter chip vertical |
| `Layout.chipPadH` | 14 | filter chip horizontal |
| `Layout.tabBarHeight` | 64 | bottom nav height (66 in normal, 64 compact) |

Inline literals also valid: `5, 6, 7, 9, 10, 11, 13, 14, 20, 26, 36, 58`.

---

## 5. Radius

| Token | px | Used for |
|---|---|---|
| `Radius.xs` | 6 | small chips |
| `Radius.sm` | 8 | calendar cells |
| `Radius.md` | 12 | inputs (`.inp`) |
| `Radius.lg` | 14 | nav-tab buttons |
| `Radius.xl` | 20 | chips, status pills |
| `Radius.full` | 999 | avatars, fully rounded |

Inline literals also valid: `10` (role-tab inner), `11` (notice), `13` (role-tab container, CTA), `16` (card).

---

## 6. Shadow

All shadows use the **warm** `Colors.shadowBase = #1C1408` (rgba 28,20,8) — not pure black.

| Token | Equivalent CSS | Used for |
|---|---|---|
| `Shadows.card` | `0 2px 14px rgba(28,20,8,0.09)` | cards, active role tab |
| `Shadows.elevated` | `0 8px 36px rgba(28,20,8,0.13)` | modal, phone frame |
| `Shadows.modal` | `0 12px 48px rgba(28,20,8,0.18)` | dialog overlays |
| `Shadows.primaryCta` | `0 4px 16px rgba(212,118,14,0.32)` (saffron-tinted) | `.btn.pr` |
| `Shadows.forestCta` | `0 4px 16px rgba(61,104,71,0.28)` (forest-tinted) | `.btn.fo-btn` |
| `Shadows.adminCta` | `0 4px 16px rgba(26,92,150,0.28)` (admin-tinted) | admin-themed CTA |

---

## 7. Animations & Transitions

Prototype animations live in `<style>` at `app.html:542–545` and on individual `:active` selectors. RN port uses `Animated.timing` / `Animated.spring` or the `expo-router` screen options for screen-level transitions.

### Screen entry
| Source | Prototype | RN equivalent |
|---|---|---|
| `.screen` mount | `@keyframes scrIn { from { transform: translateX(22px); opacity: 0.35 } to { transform: translateX(0); opacity: 1 } } .28s cubic-bezier(.4,0,.2,1)` | `Animated.parallel([translateX(22→0), opacity(0.35→1)])` over 280ms with `Easing.bezier(.4,0,.2,1)` |
| Card mount | `@keyframes cardUp { from { transform: translateY(12px); opacity: 0 } to { transform: translateY(0); opacity: 1 } } .35s ease-out` | `FadeInView` extended to support Y-translate; 350ms `Easing.out(Easing.ease)` |
| Hero background swap (login mode change) | CSS `transition: background .3s` | crossfade by overlaying two `LinearGradient`s with `Animated.timing(opacity)` 300ms |

### Press states
| Element | Prototype | RN equivalent |
|---|---|---|
| `.btn` (any button) | `:active { transform: scale(0.96) }` | `Animated.spring(scale, { toValue: 0.96 })` on `onPressIn`, back to 1 on `onPressOut`. Alternative: `Pressable` + `style={({pressed}) => ({transform: [{scale: pressed ? 0.96 : 1}]})}` |
| `.card.c-ptr` | `:active { transform: scale(0.975); box-shadow: 0 1px 8px rgba(28,20,8,.07) }` | scale 0.975 on press; tighten shadow |
| `.ntab` (bottom-nav tab) | `:active { opacity: 0.62 }` | `activeOpacity={0.62}` on `TouchableOpacity` |
| `.fchip` (filter chip) | `:active { transform: scale(0.94) }` | scale 0.94 on press |

### Role-tab transition (login)
| Prototype | RN equivalent |
|---|---|
| `transition: all .2s` on tab pill | `Animated.timing(bg/color/shadow, { duration: 200, easing: Easing.inOut(Easing.ease) })`. Practically: the active-pill swap is fast; default `TouchableOpacity` + state re-render is acceptable. |

### Input focus
| Prototype | RN equivalent |
|---|---|
| `.inp:focus { border-color: var(--sf); background: white }` | toggle border + bg on `onFocus`/`onBlur` (manual state) |

### Meter / progress bars
| Prototype | RN equivalent |
|---|---|
| `.meter-f { transition: width .6s }` | `Animated.timing(width, { duration: 600 })` on mount |

> Implementation guidance: prefer the `Pressable` API + interpolated `Animated` values for press states, since `TouchableOpacity` only animates opacity (not scale). For mount animations, use a small shared `<PressScale>` and `<FadeInView>` (already exists) family in `src/components/ui/`.

---

## 8. Decorative SVG Components

| Component | Default props | Used in |
|---|---|---|
| `LotusHero` | `color="white"`, `opacity=0.1`, `size=260`, `right=-50`, `bottom=-50` | login hero, teacher home, server dash, admin dash |
| `MountainSilhouette` | `color="rgba(255,255,255,0.07)"` | login hero, teacher home, briefing |
| `MeditationFigure` | `size=130`, `color="rgba(255,255,255,0.13)"` | defined; not visibly used in v2 prototype |

---

## 9. External Image Assets

| Asset | URL | Used in |
|---|---|---|
| Dhamma Wheel logo | `https://wp-multisite-prd.dhamma.org/np/wp-content/uploads/sites/286/2018/03/logo_simple.gif` | login hero |

> Decision pending: bundle locally vs. fetch over network. See `01-login.md` §13.
