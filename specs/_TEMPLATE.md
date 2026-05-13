# Spec: <screen name>

> **Status:** `draft` · `approved` · `code_in_progress` · `code_done` · `verified`
> **Owner of approval:** <name>
> **Last updated:** <YYYY-MM-DD>

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `NN-screen-name` |
| Route (Expo Router) | `/(role)/path` |
| Source file | `app/(role)/path.tsx` |
| Prototype reference | `VipassanaTeacherApp/app.html` lines `X–Y` |
| Roles | `teacher` / `server` / `admin` / `all` |
| Related specs | `<spec-id>`, `<spec-id>` |

---

## 2. Purpose

One or two sentences. What is this screen for? What does the user accomplish here?

---

## 3. Visual Layout (top → bottom)

Describe every visible section in order, as it appears on a 390×844 viewport. Include nesting where relevant.

1. **<Section name>** — what it is, how it behaves
2. **<Section name>** — ...

For each section, drill down to:
- All visible elements (text, icons, controls)
- Conditional rendering (e.g. "shown only for teacher mode")
- Animation / transition behavior

---

## 4. Component Inventory

Every visible element mapped to its component. If the component doesn't exist yet, mark "needs creation".

| # | Element | Type | Component (existing or new) | Prototype style ref |
|---|---|---|---|---|
| 1 | <element> | text / button / input / card | `<Component>` from `src/components/...` | `app.html:line` |

---

## 5. Design Tokens

Reference `_design-tokens.md` instead of pasting hex values. Use one row per visible style.

| Element | Token(s) | Notes |
|---|---|---|
| Background | `Colors.cr` | screen base |

If a value is NOT in the shared token file, list it under "Local Constants" below, and propose whether it should be promoted to a token.

### Local Constants
| Name | Value | Used by | Promote to token? |
|---|---|---|---|

---

## 6. Strings & i18n

Every string the user can read on this screen. One row per string.

| Key (proposed) | Used in | English | Nepali | Source |
|---|---|---|---|---|
| `login.title` | hero | Dhamma AT | धम्म AT | prototype |

If a string is hardcoded in the prototype with no i18n, decide here whether to make it i18n-managed in our app. Note the decision.

---

## 7. Local State

Variables held within the screen component.

| Name | Type | Initial | Purpose |
|---|---|---|---|
| `mode` | `'teacher'\|'server'\|'admin'` | `'teacher'` | active role tab |

---

## 8. Behavior

User-visible behaviors. One row per interaction.

| Trigger | Action | Result |
|---|---|---|
| Tap role tab | `setMode(role)` | hero gradient + CTA label update |
| Tap "Sign In" | validate + auth + navigate | routes to onboarding/home |

Include validation rules, error messages, loading states.

---

## 9. Data Dependencies

| Store | Reads | Writes |
|---|---|---|
| `authStore` | — | `role`, `userId`, `isOnboarded` |

---

## 10. Navigation

| Direction | Source | Target |
|---|---|---|
| In | `/` (auth router when no role) | this screen |
| Out (success) | tap "Sign In" | `/(teacher)/home` or `/onboarding/teacher/1` |
| Out (forgot) | tap "Forgot password?" | `<TBD>` |

---

## 11. Acceptance Checklist

- [ ] Visual matches prototype at 390×844 (screenshot diff)
- [ ] All hex values reference theme tokens (no inline hex)
- [ ] All strings reference i18n keys (unless intentionally hardcoded per §6)
- [ ] Behavior in §8 implemented end-to-end
- [ ] Navigation in §10 wired
- [ ] Loading + error + empty states present
- [ ] EN and NE both render without text overflow
- [ ] Light + dark status bar tested
- [ ] Safe-area insets respected on iOS notch + Android nav bar
- [ ] No console warnings on mount/unmount

---

## 12. Intentional Deltas from Prototype

Things we change on purpose. Each item must include a rationale.

| Delta | Prototype | Our app | Why |
|---|---|---|---|

---

## 13. Open Questions

Things to resolve before status moves to `approved`.

- [ ] <question>

---

## 14. Changelog

| Date | Author | Change |
|---|---|---|
