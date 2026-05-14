# Dhamma AT — Screen Specs Index

This folder holds one spec file per screen. The spec is the source of truth for what each screen must look like and how it must behave. The prototype at `../../VipassanaTeacherApp/app.html` is the visual reference; specs translate that into actionable, version-controlled documents the codebase can be measured against.

## Workflow

1. **Draft** the spec from the prototype (`_TEMPLATE.md` → `NN-screen.md`).
2. **Review** with the product owner. Iterate until `approved`.
3. **Implement** the Expo screen to match the spec.
4. **Verify** by visual diff against the prototype and the acceptance checklist.
5. **Mark** the spec `verified`. Move on.

Do not modify the screen code without updating the spec first.

## Shared references

- [`_TEMPLATE.md`](./_TEMPLATE.md) — spec template
- [`_design-tokens.md`](./_design-tokens.md) — color, gradient, font, spacing tokens used across all screens
- [`_i18n.md`](./_i18n.md) — internationalization workflow (en.json / ne.json, adding keys, languages, fonts)
- [`_refactor-plan.md`](./_refactor-plan.md) — production-readiness audit + phased refactor plan

## Foundation specs

| # | Spec | Scope | Status |
|---|---|---|---|
| 00 | [Data Layer (SQLite)](./00-data-layer.md) | persistence, migrations, repositories, export | 📝 draft |

## Screen index

Legend: `📝 draft` · `👀 review` · `✅ approved` · `🔨 in progress` · `✓ done` · `🎯 verified` · `—` not started

### Shared / Auth

| # | Spec | Route | Prototype | Status |
|---|---|---|---|---|
| 01 | [Login](./01-login.md) | `/(auth)/login` | `app.html:891` | 🔨 awaiting verification |
| 02 | Auth Router | `/` (app/index.tsx) | (implied) | — |

### Teacher

| # | Spec | Route | Prototype | Status |
|---|---|---|---|---|
| 03 | [Teacher Onboarding](./03-onboarding-teacher.md) | `/onboarding/teacher/[step]` | `app.html:1713` | 📝 draft |
| 04 | Teacher Home | `/(teacher)/home` | `app.html:940` | — |
| 05 | Teacher Courses | `/(teacher)/courses` | `app.html:1008` | — |
| 06 | Teacher Course Detail | `/(teacher)/courses/[id]` | `app.html:1071` | — |
| 07 | Teacher Course Brief | `/(teacher)/applications/brief/[id]` | `app.html:1225` | — |
| 08 | Teacher Applications | `/(teacher)/applications` | `app.html:1155` | — |
| 09 | Teacher Profile | `/(teacher)/profile` | `app.html:1385` | — |
| 10 | Teacher Edit Profile | `/(teacher)/profile/edit` | `app.html:1585` | — |
| 11 | Teacher Notifications | `/(teacher)/notifications` | `app.html:3377` | — |

### Server

| # | Spec | Route | Prototype | Status |
|---|---|---|---|---|
| 12 | Server Onboarding | `/(server)/onboarding` | `app.html:2973` | — |
| 13 | Server Dashboard | `/(server)/home` | `app.html:2529` | — |
| 14 | Server Opportunities | `/(server)/opportunities` | `app.html:2618` | — |
| 15 | Server Course Detail | `/(server)/opportunities/[id]` | `app.html:3082` | — |
| 16 | Server Apply | `/(server)/apply/[id]` | `app.html:2679` | — |
| 17 | Server Applications | `/(server)/applications` | `app.html:2823` | — |
| 18 | Server Application Detail | `/(server)/applications/[id]` | `app.html:3173` | — |
| 19 | Server Profile | `/(server)/profile` | `app.html:2864` | — |
| 20 | Server Notifications | `/(server)/notifications` | `app.html:3307` | — |

### Admin

| # | Spec | Route | Prototype | Status |
|---|---|---|---|---|
| 21 | Admin Dashboard | `/(admin)/dashboard` | `app.html:1935` | — |
| 22 | Admin Inbox | `/(admin)/inbox` | `app.html:2013` | — |
| 23 | Admin Review | `/(admin)/inbox/[id]` | `app.html:2059` | — |
| 24 | Admin Directory | `/(admin)/directory` | `app.html:2115` | — |
| 25 | Admin Auto-Schedule | `/(admin)/schedule` | `app.html:2291` | — |
| 26 | Admin Calendar | `/(admin)/calendar` | `app.html:2430` | — |
| 27 | Admin Notifications | `/(admin)/notifications` | `app.html:2487` | — |
| 28 | Admin Centres | `/(admin)/centres` | (new — not in prototype) | — |
| 29 | Admin Server Inbox | `/(admin)/server/inbox` | `app.html:3492` | — |
| 30 | Admin Server Board | `/(admin)/server/board` | `app.html:3649` | — |
