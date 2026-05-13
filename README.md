# Dhamma AT — Vipassana Teacher & Server Scheduling

> Mobile app for assistant teachers, servers, and center admins coordinating Vipassana courses across Dhamma centres in Nepal.

Built with **Expo SDK 54** + **expo-router 6** + **React Native 0.81** + **Zustand** + **react-i18next**.

---

## Quick start

```bash
npm install --legacy-peer-deps
npm start                 # Expo dev menu — press 'i' for iOS, 'a' for Android, 'w' for web
```

Demo accounts (pre-filled on login):

| Role    | Email              | Password     |
| ------- | ------------------ | ------------ |
| Teacher | `ananda@dhamma.np` | `demo123`    |
| Server  | `priya@dhamma.np`  | `demo123`    |
| Admin   | `admin`            | `dhamma2026` |

> ⚠️ Demo credentials live in `src/data/*.json`. They will be replaced with hashed values during the SQLite migration (`specs/00-data-layer.md`).

---

## npm scripts

```bash
npm run start         # Expo dev server
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web build

npm run typecheck     # tsc --noEmit (TypeScript only)
npm run lint          # ESLint over the whole project
npm run lint:fix      # ESLint with autofix
npm run format        # Prettier write
npm run format:check  # Prettier check (CI gate)
```

---

## Project structure

```
DhammaATApp/
├── app/                       # expo-router screens (file = route)
│   ├── (auth)/                # public — login
│   ├── (teacher)/             # teacher role screens
│   ├── (server)/              # server role screens
│   ├── (admin)/               # admin role screens
│   ├── onboarding/            # first-run onboarding flows
│   ├── _layout.tsx            # root layout — fonts, stores, splash
│   └── index.tsx              # auth router — redirects by role
├── src/
│   ├── components/
│   │   ├── ui/                # atomic UI (Button, Badge, etc.)
│   │   ├── cards/             # composite cards (CourseCard, etc.)
│   │   └── layout/            # ScreenWrapper, HeroSection, etc.
│   ├── store/                 # Zustand state slices
│   ├── theme/                 # colors, typography, spacing, shadows
│   ├── i18n/                  # react-i18next setup
│   ├── translations/          # en.json, ne.json
│   ├── types/                 # shared TypeScript types
│   ├── utils/                 # pure helpers (dates, matching, etc.)
│   ├── data/                  # seed JSON — migrating to SQLite
│   └── routes.ts              # typed route constants
├── specs/                     # SPECIFICATION DOCS — see below
├── assets/                    # images, icons, fonts
└── (config files at root)
```

All cross-`src` imports use the `@/` alias. Example: `import { Colors } from '@/theme/colors';`

---

## Specs / source of truth

**Every screen has a spec file** under `specs/`. The spec describes what the screen must look like, what it must do, and the prototype reference. Code is measured against the spec, not the other way around.

| File                                                   | What it is                                                  |
| ------------------------------------------------------ | ----------------------------------------------------------- |
| [`specs/_INDEX.md`](./specs/_INDEX.md)                 | Status tracker for all foundation + screen specs            |
| [`specs/_TEMPLATE.md`](./specs/_TEMPLATE.md)           | Reusable spec template (14 sections)                        |
| [`specs/_design-tokens.md`](./specs/_design-tokens.md) | Colors, gradients, typography, spacing, shadows, animations |
| [`specs/_i18n.md`](./specs/_i18n.md)                   | Translation workflow (en.json / ne.json)                    |
| [`specs/_refactor-plan.md`](./specs/_refactor-plan.md) | Production-readiness audit + phased refactor plan           |
| [`specs/00-data-layer.md`](./specs/00-data-layer.md)   | SQLite schema + repository layer plan                       |
| [`specs/01-login.md`](./specs/01-login.md)             | Login screen — first migrated screen (pilot)                |

**Workflow:** spec → review → implement → verify visually → mark `verified`. Never modify a screen without updating its spec first.

The visual reference (prototype) lives at `../VipassanaTeacherApp/app.html`. To view, run:

```bash
open ../VipassanaTeacherApp/app.html
```

---

## Theme

Theme tokens live in `src/theme/`. Import via:

```ts
import {
  Colors,
  Gradients,
  Shadows,
  FontFamily,
  FontSize,
  FontWeight,
  Layout,
  Spacing,
  Radius,
} from '@/theme/colors';
```

Never inline hex / px in screens — add a token if it's missing. See `specs/_design-tokens.md` for the canonical reference.

---

## i18n

Two languages: **English** (`en`) and **Nepali** (`ne`). All UI strings live in `src/translations/{en,ne}.json` and flow through `t('namespace.key')`.

Translators edit the JSON files directly. See [`specs/_i18n.md`](./specs/_i18n.md).

---

## State management

Zustand stores in `src/store/`:

| Store                | Owns                            |
| -------------------- | ------------------------------- |
| `authStore`          | role, userId, onboarding flag   |
| `settingsStore`      | language, UI prefs              |
| `teachersStore`      | teacher + server directory      |
| `coursesStore`       | course list, dhamma.org sync    |
| `applicationsStore`  | teacher applications            |
| `notificationsStore` | inbox                           |
| `profileStore`       | current user's editable profile |
| `hallsStore`         | admin hall config               |

Stores currently load from `src/data/*.json` at boot. They will swap to SQLite repositories per `specs/00-data-layer.md`.

---

## Conventions

- **Strict TypeScript** — no `any` going forward (existing ones being burned down).
- **Single quotes**, semicolons, trailing commas (Prettier-enforced).
- **`@/` path alias** for all cross-`src` imports.
- **Specs first** — no UI work without an approved spec.
- **No `console.log`** in committed code (warn/error allowed in dev).
- **No `Alert.alert`** going forward — use the Toast component (coming in R1).

Pre-commit hooks (R3) will gate commits on `typecheck` + `lint` + `format:check`.

---

## Project lineage

The HTML prototype at `../VipassanaTeacherApp/app.html` is the visual + behavioural source of truth. This app is the production migration of that prototype, screen-by-screen, with full i18n, SQLite persistence, and production-grade tooling.
