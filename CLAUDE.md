# Dhamma AT — Agent rules

Single source of truth for any AI agent working on this codebase.
Loaded automatically each session — keep tight.

## What this app is

Expo SDK 54 / React Native 0.81 / TypeScript scheduling app for Vipassana
Assistant Teachers (ATs) and Servers in Nepal. SQLite is the source of
truth. Two languages: English + Nepali (Acharya-correct — never use
शिक्षक for AT; use आचार्य).

## Tech stack (frozen — do not change without asking)

- Expo Router 6, React Native 0.81, TypeScript strict, path alias `@/* → src/*`
- Zustand for state (`src/store/*`)
- expo-sqlite native + in-memory shim for tests/web (localStorage persistence)
- Repository pattern in `src/db/repositories/`, migrations in `src/db/migrations/`
- react-i18next (`src/translations/en.json` + `ne.json`)
- Plus Jakarta Sans (Latin) + Noto Sans Devanagari (Nepali)
- No new deps without asking.

## Source-of-truth hierarchy

1. **`VipassanaTeacherApp/app.html`** — visual prototype. The pixel reference.
2. **`specs/NN-*.md`** — translates prototype into actionable spec per screen.
3. **Code** — implements the spec.

Never modify code without updating the spec first. Never modify a spec
without re-reading the prototype.

## Workflow per screen

1. **Draft spec** from prototype. Step-by-step decomposition like
   `specs/12-server-onboarding.md`. Include i18n table, design tokens,
   acceptance checklist.
2. **Pause for review.** User signs off before any implementation.
3. **Branch.** Before creating `screen/NN-<slug>`, **delete any existing
   branch of that same name** (local + origin) so the new branch starts
   from the latest `main`, not a stale snapshot:
   ```
   git checkout main && git pull
   git branch -D screen/NN-<slug>                 # local (ignore if absent)
   git push origin --delete screen/NN-<slug>      # remote (ignore if absent)
   git checkout -b screen/NN-<slug>
   ```
4. **Implement** the screen to match the spec exactly.
5. **Audit** against prototype — list any drift, fix it.
6. **Commit** on the branch.
7. **Merge** into main with `--no-ff` only after user says "complete".
8. **Push** only when user explicitly says "push". Push both `main` and
   the screen branch so the per-screen history stays on GitHub:
   `git push origin main screen/NN-<slug>`.

Stale `screen/*` branches on origin are historical bookmarks for screens
nobody is currently working on. **Do not** check them out for new work —
always recreate fresh off `main` per step 3.

Mark spec status in `specs/_INDEX.md`: `📝 draft → 👀 review → ✓ done → 🎯 verified`.

## Prototype-faithfulness rules

- Pixel sizes, gradients, borders, font weights, line heights — copy exactly from prototype CSS.
- RN can't do `backdropFilter`, `cursor`, hover. Document the omission in spec §13.
- RN's `borderStyle: 'dashed'` is broken — use the shared `DashedDivider` component.
- Forest-tinted cards have `elevation: 0` and no shadow (see spec 13 §8).
- Devanagari digits in NE: use the `digit(n, lang)` helper.

## Things to never do

- Push to remote without explicit "push" from the user.
- Force-push to `main` or `master`.
- Skip git hooks (`--no-verify`).
- Amend commits — always create new commits.
- Rename शिक्षक → आचार्य silently. Acharya-correct everywhere.
- Add features/refactors beyond what the current spec requires.
- Add code comments that explain _what_ (the code already shows that). Only add comments for non-obvious _why_.
- Introduce new abstractions for hypothetical future requirements.
- Write planning/analysis docs unless the user asks.

## Communication

- Brief updates at decision points, not running commentary.
- No emojis in code or commits unless the user asks.
- Reference files as `file_path:line_number`.
- Ask before any hard-to-reverse action.

## Useful conventions already in the repo

- `Routes` constants live in `src/routes.ts` — use them instead of string literals.
- `Colors` tokens live in `src/theme/colors.ts` — mirrors prototype CSS vars.
- `FontFamily` tokens live in `src/theme/typography.ts`.
- Stable course IDs use FNV-1a 31-bit hash (see `src/utils/hash.ts`).
- Multi-slot AT requirements: `course.openSlots?: SlotGender[]` with `resolveOpenSlots()` fallback.
- Idempotent backfills gated by `settings.backfill.*` flags.

## Screen organisation rules

- **300-line cap.** No screen file in `app/**` should exceed ~300 LOC. If a screen grows past that, extract sub-components.
- **Where extracted components live:**
  - Screen-specific sub-components → `src/components/<role>/<feature>/` (e.g. `src/components/admin/schedule/`, `src/components/teacher/profile/`).
  - Generic primitives reusable across many screens → `src/components/ui/`.
- **Each sub-component owns its own StyleSheet** (duplicate `card` chrome across files is the accepted trade-off vs a shared `Card` wrapper).
- **Static rows / lookup tables** belong in `src/data/<role>/<name>.json` with types exported from `src/data/index.ts`.
- **Screen file orchestrates** stores + handlers + memos; children are pure presentation.
- Pattern reference: see `specs/25-admin-auto-schedule.md` § Phase 3 refactor.

## Update specs as you go

Every time you change a screen, **update its spec in the same commit** (or block of commits):

- Visual/copy changes → patch the spec body, not just an Implementation notes block.
- Refactors that move code around → add a dated entry to the spec's `Implementation notes` or `Changelog` section so the spec still reflects what's in the repo.
- Status in `specs/_INDEX.md` → bump `✓ done → 🎯 verified` when the user has manually smoke-tested.

If you find drift (spec says X, code does Y), don't silently fix one to match the other — surface it to the user and ask which is correct.

## Where each markdown file lives in the branch model

| Bucket           | Files                                                                                                   | Edit on which branch                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Per-screen specs | `specs/NN-<slug>.md`                                                                                    | The matching `screen/NN-<slug>` branch, same commit as the code.               |
| Shared, additive | `specs/_INDEX.md`, `specs/_design-tokens.md`, `specs/_i18n.md`                                          | Fine on the screen branch when adding only your row / token / i18n key.        |
| Project-wide     | `CLAUDE.md`, `README.md`, `AUDIT.md`, `SMOKE_TESTS.md`, `specs/_refactor-plan.md`, `specs/_TEMPLATE.md` | Always a dedicated `chore/docs-<topic>` branch. Never bundle with screen work. |

Rule of thumb: **screen-scoped docs ride with the screen; project-wide docs get their own branch.** That keeps the conflict surface tiny when multiple branches are in flight.

## Quick reference

| Task                   | Where                                     |
| ---------------------- | ----------------------------------------- |
| Add a screen spec      | `specs/NN-<slug>.md` + update `_INDEX.md` |
| Add an i18n key        | both `en.json` and `ne.json`              |
| Add a colour           | `src/theme/colors.ts` + design-tokens doc |
| Add a migration        | `src/db/migrations/NNNN_<name>.ts`        |
| Add a repository       | `src/db/repositories/`                    |
| Reusable UI primitives | `src/components/ui/`                      |
| Screen sub-components  | `src/components/<role>/<feature>/`        |
| Static data rows       | `src/data/<role>/<name>.json`             |
