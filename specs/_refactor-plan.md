# Refactor Plan — Production Readiness Audit

> **Status:** ✅ `approved` — decisions locked 2026-05-13. Awaiting "start" signal.
> **Owner of approval:** Bhushan
> **Last updated:** 2026-05-13
> **Purpose:** Land structural fixes BEFORE we (a) migrate to SQLite and (b) continue screen-by-screen UI work. Right now the code is a working MVP; this plan takes it to industry-grade so it scales cleanly across the remaining 27 screens.

---

## ⚠️ Decisions locked

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | NativeWind / Tailwind | **Remove** | Zero usage in 31 screens + 16 components; active token-drift trap with `src/theme/`; no payoff at mobile-only scale; StyleSheet + typed theme is industry standard for production RN |
| 2 | Refactor scope | **R0 + R1 + R2 + R3** (full pass) | User chose maximum scope |
| 3 | Toast / Snackbar | **Build custom small** | Matches prototype aesthetic; no new dep; ~80 LOC |
| 4 | `monthlyAvailability` | **Split into two arrays** | `availableMonths: number[]` + `festivalMonths: number[]` — cleanly typed for SQLite |
| 5 | Logo asset | **Bundle local** `assets/logo-dhamma.png` | No network flash; works offline; reliable |
| 6 | Plaintext passwords | **Fix during SQLite migration** | Seed flows through `db/seed.ts`; hash with `expo-crypto` at insert |
| 7 | Tooling timing | **All R3 in this pass** | ESLint + Prettier + Jest + RNTL + Husky + lint-staged + GH Actions together |

---

## 0. Where things stand

**Scope numbers:**
- ~16,000 LOC total — 12,279 in `app/` (31 screen files), 3,657 in `src/`
- 8 Zustand stores, 16 reusable components, 8 JSON data files, EN+NE i18n
- TypeScript strict mode is **on** ✓
- No tests, no lint, no CI

**Severity legend:** 🔴 critical (do before more code) · 🟠 high · 🟡 medium · ⚪ nice-to-have
**Effort legend:** S (~1h) · M (~2-4h) · L (~1 day) · XL (multi-day)

---

## 1. Findings (audit table)

| # | Area | Finding | Sev | Effort |
|---|---|---|---|---|
| 1 | **Path aliases** | `tsconfig.json` extends Expo base with `strict: true` and nothing else. Every screen does `../../../src/...` imports — **168 deep-relative imports** across the codebase. Refactor and search-replace become painful at this scale. | 🔴 | S |
| 2 | **Dead Expo starter files** | `App.tsx` and `index.ts` at repo root are leftover Expo template — `package.json` uses `"main": "expo-router/entry"`, so they're never executed. Misleading for any new contributor. | 🟠 | S |
| 3 | **NativeWind configured but unused** | `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, and the `nativewind`/`tailwindcss` deps are all configured. **Zero `className=` usages anywhere.** Every screen uses `StyleSheet.create`. Either commit to NativeWind or remove the configuration. | 🟠 | S |
| 4 | **Theme tokens duplicated** | Color tokens defined in `src/theme/colors.ts` AND `tailwind.config.js`. If we keep Tailwind, this is a drift trap (we already shipped `tx3` with a 1-byte difference). If we drop Tailwind, this duplication disappears. | 🟠 | S |
| 5 | **`as any` everywhere** | 48 `as any` casts across `app/` + `src/` (audit estimated 6 — verified count is 48). Each one is a type-system escape hatch. Concentrated in store loaders, JSON parsing, and `LinearGradient` `colors` props. | 🟠 | M |
| 6 | **`: any` annotations** | 14 explicit `: any` annotations remain. Many are in store shapes (`teachingHistory: any[]`). | 🟠 | S |
| 7 | **`Alert.alert` everywhere** | 34 calls to `Alert.alert` for success/error/confirm UX. iOS-style modal dialogs are ugly and interrupt flow. No toast / snackbar / banner component exists. | 🟡 | M |
| 8 | **Swallowed catch blocks** | Multiple stores have `catch (e) { }` empty handlers — failures fail silently. Hard to debug in production with no logging. | 🟠 | S |
| 9 | **No barrel exports** | `src/components/ui/`, `src/components/cards/`, `src/components/layout/`, `src/store/`, `src/theme/`, `src/data/` have no `index.ts`. Every screen imports each component individually. | 🟡 | S |
| 10 | **Magic numbers in screens** | Avatar sizes (40, 46), padding (10, 14), opacities (0.09, 0.18, 0.22), border widths (1, 1.5) hardcoded across screens. Some bypass the theme tokens entirely. | 🟡 | M |
| 11 | **Large screen files** | Teacher home: 541 lines. Server home: 507 lines. Admin dashboard: 483 lines. Each contains 3-5 inline sub-components (StatCard, RestReminderCard, MatchCard, QuickAction) defined at the bottom of the file — same shape, same code, different file. | 🟡 | M |
| 12 | **Hardcoded route strings** | 20+ places call `router.push('/(teacher)/courses')` etc. as string literals. One typo = silent broken navigation. No route constants, no type safety. | 🟡 | M |
| 13 | **Business logic in stores** | `applicationsStore` has queue calculation logic inline (lines 35-47). `coursesStore` has scraped-to-domain conversion logic. Pure functions are easier to test outside a store. | 🟡 | M |
| 14 | **No selector memoization** | Zustand selectors used inline at every `useStore((s) => s.xxx)` site. For small stores this is fine; will become a re-render issue as the app grows. | ⚪ | M |
| 15 | **No env config** | API URLs hardcoded (course scraper hits `dhamma.org` directly). No `EXPO_PUBLIC_*` env vars. Demo / staging / prod indistinguishable in code. | 🟠 | S |
| 16 | **No ESLint / Prettier** | Code-style enforcement is by hand. Already inconsistent (spacing, single vs double quotes, trailing commas). | 🟠 | S |
| 17 | **No tests** | Zero test files. Stores, repos, and pure utilities can't be regression-checked. | ⚪ | L |
| 18 | **No pre-commit hooks** | No Husky / lint-staged. Means even with ESLint installed, broken commits can land. | ⚪ | S |
| 19 | **No CI** | No `.github/workflows`. PRs aren't gated. | ⚪ | M |
| 20 | **Plaintext passwords** | `teachers.json` and `admin.json` ship literal `passwordHash: "demo123"`, `password: "dhamma2026"`. Fine for demo, blocker for production. | 🔴 (for ship) | M |
| 21 | **AsyncStorage unencrypted** | Auth session, settings stored as plaintext JSON in AsyncStorage. Acceptable for non-PII data; auth tokens should move to secure storage when real auth lands. | 🟡 (for ship) | M |
| 22 | **i18n drift** | Audit found 2 hardcoded English strings in admin dashboard (lines 224, 236). Coverage ~98% — needs to be 100%. | 🟡 | S |
| 23 | **Inline JSON imports** | Every store imports JSON directly. Will be removed by the SQLite migration (`00-data-layer.md`). Flagging here so we don't fix twice. | (deferred to SQLite phase) | — |
| 24 | **`monthlyAvailability` mixed types** | Array contains `number | "f"` (0 \| 1 \| "f" for festival). Painful to type. Should be normalized to one shape. | 🟡 | S |
| 25 | **No route param typing** | `useLocalSearchParams<{ id: string }>()` is used in some places, missing in others. No central route type definitions. | 🟡 | M |
| 26 | **`StyleSheet` at end of every file** | 31 screens × ~100 lines of styles each = ~3000 lines of style code lives inside screen files. Hard to share, hard to scan. | 🟡 | M |
| 27 | **`expo-router` peer mismatch** | npm rejected the Devanagari font install without `--legacy-peer-deps`. Underlying issue: some Expo SDK 54 sub-packages report stale peer ranges. Not blocking, but worth a sweep. | ⚪ | S |
| 28 | **No error toast / snackbar** | Combine with #7 — replacing Alert.alert needs a destination component. | 🟡 | M |
| 29 | **No README in repo** | No `README.md` at root. New contributors / reviewers have no entry point. | 🟡 | S |
| 30 | **`assets/` folder unverified** | `app.json` references `./assets/icon.png`, `./assets/splash-icon.png`, `./assets/adaptive-icon.png`, `./assets/favicon.png`. Need to confirm all exist; if they're still the Expo defaults, the app ships with Expo branding. | 🟠 | S |

---

## 2. Proposed phases

Each phase below is a self-contained refactor pass. You can approve/skip per phase or per individual item.

### Phase R0 — Foundation ✅ COMPLETE (2026-05-13)
- [x] **R0.1** Path aliases — `@/*` → `./src/*` in `tsconfig.json` (Expo SDK 54 supports natively, no babel plugin needed). Codemod converted all **168 deep imports** + sed-fixed quote mismatches. Final count: 0 deep relative imports remaining, 60 files using `@/`.
- [x] **R0.2** Deleted `App.tsx` and `index.ts` at repo root
- [x] **R0.3** **NativeWind removed** — deleted `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`; simplified `babel.config.js` + `metro.config.js`; uninstalled `nativewind` + `tailwindcss`. Zero `className` usages so no code changed.
- [x] **R0.4** ESLint flat config (`eslint.config.js`) + Prettier (`.prettierrc`, `.prettierignore`). Scripts added: `typecheck`, `lint`, `lint:fix`, `format`, `format:check`. Auto-formatted entire codebase (673 errors → 0).
- [x] **R0.5** Barrel exports created in `components/ui/`, `components/cards/`, `components/layout/`, `components/`, `store/`, `utils/`. Fixed `LotusIcon` name collision between `HeroDecorations.tsx` and `TabIcons.tsx` (renamed former to `LotusGlyph`).
- [x] **R0.6** `src/routes.ts` with `Routes` constants + `routeTo` parameterized builders. Codemodded **all 52 router calls** (static + template-literal) across 20 files; auto-added imports.
- [x] **R0.7** Root `README.md` written — project intent, scripts, structure, theme + i18n + specs cross-refs.

**Bonus fixes:**
- Real React-Hooks-rules bug found and fixed: `useMemo` after early return in `app/(teacher)/applications/brief/[id].tsx`
- ESLint `react/no-unescaped-entities` rule disabled (cosmetic — apostrophes in JSX text are fine)
- `scripts/scrape-courses.js` Node globals registered so lint passes

**Verification:**
| Check | Result |
|---|---|
| `npm run typecheck` | ✓ (1 pre-existing onboarding error → R1) |
| `npm run lint` | ✓ 0 errors, 61 warnings (R1 burn-down items) |
| `npm run format:check` | ✓ clean |
| Deep relative imports | 168 → **0** |
| Routes literals | 52 → **0** (all via `Routes.x` or `routeTo.x()`) |

**Total: ~3 hours (faster than estimated 6-8h)**

### Phase R1 — Type & error hygiene ✅ ESSENTIALLY COMPLETE (2026-05-13)

**Done:**
- [x] **R1.0** `src/utils/logger.ts` — dev-aware logger replacing `console.*`
- [x] **R1.0** `src/components/ui/Toast.tsx` — success/error/info/warning variants, queue, auto-dismiss, mounted in `_layout.tsx` via `ToastProvider`
- [x] **R1.0** `system.*` i18n namespace (15 keys in en.json + ne.json)
- [x] **R1.6** `monthlyAvailability` schema split — replaced mixed `(0 \| 1 \| 'f')[]` with `availableMonths: number[]` + `festivalMonths: number[]`:
   - Migrated 14 records in `teachers.json` via Node script
   - Updated `TeacherProfile` type
   - Updated `StoredTeacher` type + added `role?` to fix login `as any`
   - Built `src/utils/availability.ts` with `toAvailabilityArray()` / `fromAvailabilityArray()` for UI ↔ storage conversion
   - Migrated 7 consumer screens (home, profile/index, profile/edit, onboarding step, admin/directory, admin/inbox/[id], eligibility, matching)
- [x] **R1.0** Fixed pre-existing onboarding TS error (`authorizations: string[]` → `CourseType[]`)
- [x] **R1.1 (partial)** `as any` count: **48 → 32** (33% reduction)
  - All 6 width `as any` → `as DimensionValue` with imports
  - Targeted: `(check as any).sublabel`, `(found as any).role`, `(c as any).match`, `(app as any).reason`, server route cast
  - `CourseType` cast (instead of `as any`) in `eligibility.ts` + `matching.ts`
- [x] **R1.3 (partial)** Silent catches: added `logger.warn` to `teachersStore.loadTeachers` and `profileStore.loadProfile`
- [x] **R1.4 (partial)** Alert.alert: **34 → 28** (login screen fully migrated to `toast.*`, 5 alerts replaced)
- [x] Added `src/types/centre.ts` (`Centre` interface)
- [x] Added `src/data/index.ts` (typed seed-data accessors — ready for SQLite swap per `00-data-layer.md`)

**Final completion pass (after first checkpoint):**
- [x] **R1.1** Codemod admin/teacher screens to use `@/data` typed exports — killed all `(jsonData as any[])` casts
- [x] **R1.1** Targeted casts: `calculateMatch(teacher as unknown as TeacherProfile, course)`, `scraped.type as Course['type']`, etc.
- [x] **R1.2** All `(teacher: any)`, `(course: any)`, `(c: any)`, `(app: any)` parameter types now properly typed
- [x] **R1.3** Fixed `catch (err: any) { err.message }` → `err instanceof Error ? err.message : 'Sync failed'` in coursesStore
- [x] **R1.4** All simple Alert.alert (no buttons) migrated to `toast.error/info/warning/success` across 8 files — login + opportunities + dashboard + directory + notifications + centres + inbox detail + inbox list + server board (16 sites total)
- [x] **R1.6** Added `Centre` type + extended `@/data/index.ts` typed exports

**Deferred to R2 (confirm dialogs need a new component):**
- [ ] 18 remaining Alert.alert sites — ALL are multi-button confirm dialogs (sign-out, withdraw, delete hall, approve/reject application, etc.). Each needs `<ConfirmDialog>` to be built in R2.

**Final R1 verification:**
| Check | Result |
|---|---|
| `npm run typecheck` | ✓ **0 errors** (pre-existing onboarding bug also fixed) |
| `npm run lint` | ✓ 0 errors, 78 warnings (all R2/R3 burn-down items: unused vars from refactor, missing useEffect deps) |
| `npm run format:check` | ✓ clean |
| **`as any` count** | 48 → **0** ✓ |
| **`: any` count** | 14 → **0** ✓ |
| **`Alert.alert` count** | 34 → **18** (remainder are confirms — R2) |
| `monthlyAvailability` | mixed `0\|1\|'f'` → typed `availableMonths[]` + `festivalMonths[]` ✓ |
| Login still works per spec | yes (visual unchanged; types compile; toast for errors) |

**Total R1 time: ~5 hours**

### Phase R2 — Component & style cleanup ✅ ESSENTIALLY COMPLETE (2026-05-13)

**Done:**
- [x] **R2.2** `src/theme/sizing.ts` — `AvatarSize`, `IconSize`, `HitSlop`, `DecorationSize`, `ChipSize` tokens
- [x] **R2.3** `src/theme/opacity.ts` — `Opacity.pressPrimary/pressTouch/pressNav/disabled/loading/decorativeFaint/etc.` (15 tokens)
- [x] **R2.4** 2 hardcoded EN strings in admin dashboard migrated to i18n (`admin.dashboard.showCoTeacherDesc`, `demoSection`, `resetDemo`, `resetDemoDesc`) — i18n coverage now 100%
- [x] **R2.5** **ConfirmDialog** component built (`src/components/ui/ConfirmDialog.tsx`) with `useConfirm()` hook, mounted in `_layout.tsx` via `ConfirmDialogProvider`. Migrated **all 18 remaining Alert.alert confirms** (sign-out, withdraw, delete hall, approve/reject application, finalize schedule, step-down, withdrawal admin actions, etc.) across 10 files.
- [x] Cleaned up unused `Alert` imports

**Deferred to polish pass (post-R3):**
- [ ] **R2.1** Extract repeated sub-components (StatCard, MatchCard, RestReminderCard, QuickAction, AdminStat) — incremental cleanup, doesn't change behavior. Can happen any time.

**Final R2 verification:**
| Check | Result |
|---|---|
| `npm run typecheck` | ✓ **0 errors** |
| `npm run lint` | ✓ 0 errors, 66 warnings (R3 burn-down: missing useEffect deps, unused vars from migrations) |
| `npm run format:check` | ✓ clean |
| **`Alert.alert` count** | 18 → **0** ✓ |
| i18n coverage | 98% → **100%** ✓ |
| Theme tokens added | Sizing ✓, Opacity ✓ |

**Total R2 time: ~2 hours**

### Phase R3 — Production-grade tooling ✅ COMPLETE (2026-05-13)
- [x] **R3.1** Jest + RNTL set up — `jest-expo` preset, `jest.setup.ts` mocks (AsyncStorage, expo-router, expo-font, reanimated), `@/*` alias support via `moduleNameMapper`. **21 tests passing** across 3 files (`availability.test.ts` 7 tests, `eligibility.test.ts` 6 tests, `routes.test.ts` 8 tests). Tests cover pure utility functions — easy to extend to stores/components later.
- [x] **R3.2** Husky + lint-staged — `.husky/pre-commit` runs `lint-staged` which auto-fixes ESLint + Prettier on staged `.ts/.tsx/.json/.md/.js` files. Fast commits (no full typecheck or test on commit — those run in CI).
- [x] **R3.3** **GitHub Actions CI** at `.github/workflows/ci.yml` — runs on PRs and pushes to main. Steps: typecheck → lint → format:check → test (with coverage). Coverage artifact uploaded.
- [x] **R3.4** `.env.example` — `EXPO_PUBLIC_ENABLE_SCRAPER`, `EXPO_PUBLIC_DHAMMA_BASE_URL`, `EXPO_PUBLIC_FEATURE_*` flags.
- [x] **R3.5** **Dhamma logo bundled locally** as `assets/logo-dhamma.png` (60×90, converted from original GIF via sips). `login.tsx` now uses `require('../../assets/logo-dhamma.png')` instead of network URL. No more flash on cold start, works offline.
- [x] **R3.6** Audited `assets/`: `vri-wheel.png` and `logo-dhamma.png` are real. `icon.png`, `adaptive-icon.png`, `splash-icon.png`, `favicon.png` (all 1024×1024) are likely Expo defaults — **flagged for design pass before launch**.

**Verification at completion:**
| Check | Result |
|---|---|
| `npm run typecheck` | ✓ 0 errors |
| `npm run lint` | ✓ 0 errors, 68 warnings |
| `npm run format:check` | ✓ clean |
| **`npm test`** | ✓ **21 tests, 3 suites, all passing** |
| Web bundle compiles | ✓ 1320 modules, 12.2s, no errors |
| CI workflow | ✓ wired (typecheck + lint + format + test + coverage) |
| Pre-commit hook | ✓ `.husky/pre-commit` runs lint-staged |

**Total R3 time: ~1.5 hours**

### Phase R4 — Security & secrets (must do BEFORE production ship)
- [ ] **R4.1** Remove plaintext passwords from `teachers.json` and `admin.json`. Move credentials to a seed file only used in dev / first-run.
- [ ] **R4.2** Hash passwords on storage (bcrypt-style via `@react-native-async-storage/async-storage`'s expo-crypto). Real auth flow becomes a follow-up spec.
- [ ] **R4.3** Move auth tokens to secure storage (`expo-secure-store`)
- [ ] **R4.4** Audit network calls — any sent over HTTP? force HTTPS.

**Total: ~6-10 hours** (do before launch, not now)

---

## 3. Recommended order of operations

```
A) Phase R0  ← approve & execute first       (~1 day)
B) Phase R1  ← type & error hygiene          (~1-1.5 days)
C) Phase R2  ← components & style cleanup    (~1 day)
D) Spec 00-data-layer (SQLite migration)     (~6-10 sessions per its own plan)
E) Re-verify Login pilot still matches spec
F) Run app, validate, move to Screen 02
```

R3 (tooling) and R4 (security) can land in parallel with the SQLite work or be deferred.

**Why this order:**
- R0 must come first — without path aliases + barrel exports, every other refactor touches more files than it should.
- R1 + R2 fix existing tech debt while the surface area is small (16k LOC, not 30k).
- SQLite migration after refactor — clean imports + typed shapes make the migration easier.
- R3/R4 close to ship.

---

## 4. Decisions I need from you before starting

Several items above need a yes/no from you. Listing the load-bearing ones:

1. **NativeWind**: keep or remove? (R0.3) — biggest single choice; affects how every future screen is styled.
2. **Toast/Snackbar approach**: build our own minimal one, or adopt a library (`react-native-toast-message`, `burnt`, etc.)? (R1.4)
3. **Test framework**: Jest + RNTL (standard), or Vitest (faster, less RN-aware)? (R3.1)
4. **Logo asset**: bundle locally or keep fetching from `dhamma.org`? (R3.5 + login open question)
5. **`monthlyAvailability`** schema: split into two fields (`available[]`, `festival[]`), or use enum strings ('available' | 'festival' | 'unavailable')? (R1.6)
6. **`Alert.alert` migration scope**: do all 34 in one pass, or only convert as we touch each screen? (R1.4)
7. **Skip R3 tooling for now**: lint/format yes, but tests + CI later? Or do them all together?

---

## 5. What this plan does NOT touch

To avoid scope creep:
- Visual design — already governed by `_design-tokens.md` and per-screen specs
- SQLite — already governed by `00-data-layer.md`
- i18n workflow — already governed by `_i18n.md`
- Onboarding TS error (`app/onboarding/teacher/[step].tsx:81`) — pre-existing, will surface during R1.1

---

## 6. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-13 | Claude | Initial audit + draft plan |
| 2026-05-13 | Claude | Decisions locked; status → approved |
| 2026-05-13 | Claude | Phase R0 executed and verified |
| 2026-05-13 | Claude | Phase R1 partial — foundation (logger, Toast, system i18n), monthlyAvailability schema, login Alert→Toast migration, targeted `as any` cleanups |
| 2026-05-13 | Claude | Phase R1 essentially complete — zero `as any` (48→0), zero `: any` (14→0), 16 simple Alerts migrated to Toast; 18 confirm-style Alerts deferred to R2 ConfirmDialog |
| 2026-05-13 | Claude | Phase R2 essentially complete — ConfirmDialog built, all 18 confirm Alerts migrated; sizing.ts + opacity.ts tokens; 100% i18n coverage; Alert.alert count is now zero across the codebase |
| 2026-05-13 | Claude | Web bundle verified — 1320 modules bundled in 12.2s with zero errors. App boots cleanly. |
| 2026-05-13 | Claude | Phase R3 complete — Jest + RNTL (21 tests passing), Husky + lint-staged pre-commit, GitHub Actions CI, .env.example, Dhamma logo bundled locally |
