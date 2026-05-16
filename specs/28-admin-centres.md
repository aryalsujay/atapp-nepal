---
id: 28-admin-centres
title: Admin Centres
route: /(admin)/centres
prototype: (none — new screen, not in VipassanaTeacherApp/app.html)
status: not started
related: [21-admin-dashboard]
---

# 28 · Admin Centres

> **Status: NOT STARTED.** This screen has no prototype reference in
> `VipassanaTeacherApp/app.html`. It is reserved in the spec index but
> intentionally unbuilt during the prototype-faithful pass.

When we get to designing this, the proposed scope is:

1. **List of all Nepal Vipassana centres** (data already exists in
   `src/data/centers.json` and `nepalCenters` from the prototype's
   constants).
2. **Per-centre card**: name, English + Nepali label, city, region,
   maybe capacity/active-courses stat.
3. **Tap → centre detail** (`/(admin)/centres/[id]` — file already
   exists with a WIP placeholder).
4. Likely a small admin-only "+ Add Centre" button if we ever support
   creating new centres.

Until designed, the `app/(admin)/centres/index.tsx` and `[id].tsx` files
remain WIP and the route is not surfaced in the admin tab bar.

## Open questions to resolve before drafting

- Will admins ever create new centres, or are centres pre-seeded by the
  Vipassana organization at the source level?
- Per-centre stats (capacity, courses-this-quarter, ATs-assigned) — do
  we have this data, or is it derived?
- Multi-tenancy: does an admin see only their centre, or all centres
  globally? Today the app assumes single-centre (Dhamma Shringa); this
  spec is what unlocks multi-centre admin views.

## When to revisit

Block this spec until:
- The user explicitly requests the centres directory feature; **or**
- A multi-centre admin requirement lands (e.g. a regional manager seeing
  multiple centres at once).
