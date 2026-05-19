# Spec: Admin — Add Teacher

> **Status:** `draft`
> **Owner of approval:** Sujay
> **Last updated:** 2026-05-18

---

## 0. Source of truth

No prototype mockup for this — new functionality requested 2026-05-18.

Today `(admin)/directory.tsx:154` has an `+ Add Teacher` button that opens an `Alert "Coming soon"`. This spec implements that flow end-to-end: form → save → success card with credentials the admin can copy / share with the teacher.

The teacher is then able to log in via the existing login flow (`(auth)/login.tsx`) using any of:
- **Email + password** (works out of the box once we set `passwordHash`),
- **Phone + password** — new, see §7,
- **Invite code** (already supported by `teachersRepo.findByIdentifier`).

---

## 1. Identity

| Field | Value |
|---|---|
| Spec ID | `33-admin-add-teacher` |
| Routes | `(admin)/directory/add` (new modal-style screen) |
| Source files | `app/(admin)/directory.tsx` (wire the button), new `app/(admin)/directory/add.tsx`, new helpers in `src/utils/credentials.ts`, possibly `src/store/teachersStore.ts` (no schema change — uses existing `addTeacher`) |
| Roles | `admin` (super-admin) only |
| Related specs | `24-admin-directory`, `01-login`, `03-onboarding-teacher` |

---

## 2. Purpose

Let a super-admin create a teacher record from inside the app and hand the teacher their credentials. The form covers only the **identity** fields (name, email, phone, gender). Course authorisations, languages, regions, availability — all the deeper profile data — are filled in by the teacher themselves on first login via the existing onboarding flow.

In short: admin establishes *who* the teacher is and *how they log in*; the teacher establishes *what they can teach* during onboarding.

---

## 3. Visual Layout

### 3.1 Trigger

Existing `+ Add Teacher` button on `(admin)/directory.tsx`. Replace `Alert.alert('Coming soon')` with `router.push(Routes.adminDirectoryAdd)`.

### 3.2 Form screen — `(admin)/directory/add`

Stack-presented (slides up). Saffron-gradient header with title + close (×) button.

```
┌─────────────────────────────────────┐
│  ×                Add Teacher       │  ← saffron header
├─────────────────────────────────────┤
│                                     │
│  Full name *                        │
│  [Bhikkhu Ananda                ]   │
│                                     │
│  Email *                            │
│  [ananda@dhamma.org             ]   │
│                                     │
│  Phone (with country code)          │
│  [+977 98xxxx xxxx              ]   │
│                                     │
│  Gender *      ( ) Male  ( ) Female │
│                                     │
│  Region (optional)                  │
│  [Kathmandu Valley            ▼ ]   │
│                                     │
│  ────────────────────────────       │
│                                     │
│  Login credentials                  │
│                                     │
│  Auto-generate password  [✓]        │
│  Auto-generate invite code [✓]      │
│                                     │
│  Send credentials by email [ ]      │
│                                     │
│              ┌──────────────────┐   │
│              │  Create teacher  │   │
│              └──────────────────┘   │
└─────────────────────────────────────┘
```

- **Validation**:
  - Name: ≥ 2 chars.
  - Email: standard regex (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`). Required.
  - Phone: **required** (≥ 7 digits, country-code prefix recommended). Many teachers will prefer to log in with phone over email — see §7.
  - Gender: required (M or F radio).
  - Region: free-text or pulled from the existing region list in `_design-tokens.md` if practical; defaults to empty.
- **Duplicate guard**: before submit, look up `teachersRepo.findByIdentifier(email)` — if found, show inline error `A teacher with that email already exists`.
- **Generated credentials** (both checkboxes default ON):
  - Invite code: format `AT-XXXX-XXXX` (4 + 4 hex uppercase). Helper in `src/utils/credentials.ts`.
  - Temp password: 12 char base32 (no ambiguous chars). Helper in same file.
  - When unchecked, exposes a regular text input so the admin can paste their own value.
- **`Send credentials by email`** checkbox: greyed out + sub-line "Email delivery not configured — share manually for now". Kept in the UI as a forward-pointer; behaviour deferred.

### 3.3 Success screen (replaces the form on save)

```
┌─────────────────────────────────────┐
│  ✓ Teacher created                  │
├─────────────────────────────────────┤
│                                     │
│  Bhikkhu Ananda                     │
│  ananda@dhamma.org                  │
│                                     │
│  Share these credentials:           │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ Invite code                  │   │
│  │ AT-3F2A-9C81           [📋]  │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │ Temporary password           │   │
│  │ k7q4n2sx8p1m            [📋] │   │
│  └──────────────────────────────┘   │
│                                     │
│       [Copy both]  [Share…]         │
│                                     │
│  The teacher will complete their    │
│  profile on first login.            │
│                                     │
│              ┌──────────────────┐   │
│              │  Done            │   │
│              └──────────────────┘   │
└─────────────────────────────────────┘
```

- **Copy buttons**: per-field clipboard copy (`expo-clipboard`, already a transitive dep — or add it). Toast on copy.
- **`Copy both`**: copies a single block including all three login identifiers + the password, so the teacher knows every way they can sign in:
  ```
  Dhamma Nepal credentials
  Phone: +977 98xxxx xxxx
  Email: ananda@dhamma.org
  Invite code: AT-3F2A-9C81
  Password: k7q4n2sx8p1m

  Log in with phone, email, or invite code.
  Open the Dhamma Nepal app.
  ```
- **`Share…`**: opens `expo-sharing` with the same text body so the admin can hand it off via WhatsApp / Signal / Mail.
- **`Done`**: closes the modal and refreshes `teachersStore` so the new teacher appears in the directory list.

---

## 4. Behavior

| Trigger | Action |
|---|---|
| Tap `+ Add Teacher` on directory | `router.push(Routes.adminDirectoryAdd)` |
| Form mount | Local state: name / email / phone / gender / region / autoCode / autoPwd / customCode / customPwd. Generate initial code + pwd. |
| Tap toggle "Auto-generate password" off | Reveal a text input pre-filled with the auto-generated value so admin can override. |
| Tap `Create teacher` | Validate → look up email duplicate → if OK: hash the password (`bcryptjs` — already a transitive dep via the existing login flow) → call `teachersStore.addTeacher({...})` → transition to success screen |
| Tap copy button | `Clipboard.setStringAsync(value)` + toast `Copied`. |
| Tap `Share…` | `Sharing.shareAsync()` with the composed text. |
| Tap `Done` | `router.back()` → directory list re-renders with the new row. |

---

## 5. Local State

| Name | Type | Initial | Purpose |
|---|---|---|---|
| `phase` | `'form' \| 'done'` | `'form'` | drives the screen render |
| `form.name`, `form.email`, `form.phone`, `form.region` | `string` | `''` | identity fields |
| `form.gender` | `'M' \| 'F' \| null` | `null` | required |
| `autoCode`, `autoPwd` | `boolean` | `true` | generate vs admin-supplied |
| `code`, `pwd` | `string` | generated on mount | actual values about to be saved |
| `error` | `string \| null` | `null` | inline error banner |

---

## 6. Strings & i18n

Namespace `admin.add_teacher.*` — add to both `en` + `ne`.

| Key | EN |
|---|---|
| `admin.add_teacher.title` | `Add Teacher` |
| `admin.add_teacher.success_title` | `Teacher created` |
| `admin.add_teacher.field_name` | `Full name` |
| `admin.add_teacher.field_email` | `Email` |
| `admin.add_teacher.field_phone` | `Phone (with country code)` |
| `admin.add_teacher.field_gender` | `Gender` |
| `admin.add_teacher.field_region` | `Region (optional)` |
| `admin.add_teacher.gender_m` | `Male` |
| `admin.add_teacher.gender_f` | `Female` |
| `admin.add_teacher.creds_header` | `Login credentials` |
| `admin.add_teacher.auto_pwd` | `Auto-generate password` |
| `admin.add_teacher.auto_code` | `Auto-generate invite code` |
| `admin.add_teacher.send_email` | `Send credentials by email` |
| `admin.add_teacher.send_email_disabled` | `Email delivery not configured — share manually for now` |
| `admin.add_teacher.create_btn` | `Create teacher` |
| `admin.add_teacher.share_intro` | `Share these credentials:` |
| `admin.add_teacher.invite_code` | `Invite code` |
| `admin.add_teacher.temp_password` | `Temporary password` |
| `admin.add_teacher.copy_both` | `Copy both` |
| `admin.add_teacher.share` | `Share…` |
| `admin.add_teacher.done` | `Done` |
| `admin.add_teacher.first_login_hint` | `The teacher will complete their profile on first login.` |
| `admin.add_teacher.err_required` | `Name, email, and gender are required.` |
| `admin.add_teacher.err_email_invalid` | `Enter a valid email address.` |
| `admin.add_teacher.err_email_taken` | `A teacher with that email already exists.` |
| `admin.add_teacher.err_phone_too_short` | `Phone number must be at least 7 digits.` |
| `admin.add_teacher.toast_copied` | `Copied` |
| `admin.add_teacher.share_subject` | `Dhamma Nepal credentials` |

NE translations to be added during implementation (Acharya-correct).

---

## 7. Data layer

No schema change. Uses existing:

- `teachersStore.addTeacher({...})` → `teachersRepo.upsert`.
- `teachersRepo.findByIdentifier(input)` → extend to also match `phone` (`LOWER(phone) = LOWER(?)`). Existing email + invite-code branches retained.
- Duplicate guard at submit time runs `findByIdentifier(email)` AND `findByIdentifier(phone)` — both must miss before we create the row.
- `passwordHash` field already lives on `TeacherDomain`. Hashing helper exists at the login flow — extract to `src/utils/credentials.ts` if not already shared.

### Phone-as-username rollout

The login screen (`(auth)/login.tsx`) already calls `findByIdentifier(input)` with whatever the user types. Once the repo accepts phone matches, **no UI change is required** — typing `+977 9812345678` into the existing identifier field will find the row, and the existing bcrypt check verifies the password. We do normalise the input lightly: strip spaces and the leading `+` before the lookup, and store the phone canonically the same way.

New helpers in `src/utils/credentials.ts`:

```ts
generateInviteCode(): string   // `AT-XXXX-XXXX`
generateTempPassword(): string // 12-char base32, ambiguous chars removed
hashPassword(plain: string): string  // reuse existing login hasher
```

---

## 8. Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Authorisations / languages / availability | **Not on this form** | Teacher fills these during onboarding (spec 03). Admin form is identity + auth only. |
| Email delivery | **Out of scope** | No email backend. Checkbox stays in UI as a visible placeholder; admin shares credentials manually via Share sheet. |
| Username field | **Skipped** — email / phone / invite-code are all login identifiers | Three identifiers cover every real preference. A separate "username" would just be a 4th alias for nothing. |
| Region | **Free-text** for now | Pulling from canonical region list can wait; users can edit later. |
| Password storage | bcrypt hash (existing helper from login flow) | Never store plain text. The plain password is shown ONCE on the success screen and is not retrievable later. |
| New deps | `expo-clipboard` if not already present; reuse `expo-sharing` (already added) | One small add. |

---

## 9. Acceptance Checklist

- [ ] Tapping `+ Add Teacher` on directory opens the form, not the "Coming soon" alert.
- [ ] Form validates name, email, gender, and email-uniqueness.
- [ ] Toggling auto-pwd off reveals an editable text input pre-filled with the auto value.
- [ ] On submit, a row is created in `teachers` with the right `name/email/phone/gender/inviteCode/passwordHash` and `role='teacher'`, `isOnboarded=false`.
- [ ] Success screen shows the plain code + plain password exactly once.
- [ ] Copy buttons work on each field; toast appears.
- [ ] Share button opens the native share sheet with a sensible default text.
- [ ] Done returns to directory; the new teacher is visible at the top of the list.
- [ ] Logging out and logging in with `email + temp password` reaches the teacher home screen with onboarding required.
- [ ] Same teacher can also log in with `phone + temp password` (no UI change on the login screen).
- [ ] Same teacher can also log in with `invite code + temp password`.
- [ ] Duplicate guard rejects creation if either email OR phone already exists in the `teachers` table.
- [ ] EN + NE both render without overflow.
- [ ] Typecheck + lint + tests pass.

---

## 10. Implementation phases

1. **Helpers + repo wiring** — `generateInviteCode`, `generateTempPassword`, `hashPassword`. Unit tests for the generators.
2. **Form screen** — identity fields, auto-gen toggles, validation, save handler. Wire `+ Add Teacher` button.
3. **Success screen** — copy + share. `expo-clipboard` if needed.
4. **i18n** — keys in en + ne.
5. **Verify** — typecheck / lint / tests / manual on the phone.

Single commit on `feature/admin-add-teacher`; merge with `--no-ff` when acceptance §9 passes.

---

## 11. Changelog

| Date | Author | Change |
|---|---|---|
| 2026-05-18 | Sujay + Claude | Initial draft. |
| 2026-05-18 | Sujay + Claude | Phone becomes required + a 3rd login identifier. `findByIdentifier` extended to match `phone`. Share text now includes all three identifiers so teachers can pick whichever they prefer. |
