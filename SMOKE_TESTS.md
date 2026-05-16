# Dhamma AT — Smoke Test Checklist

Walk through every primary path per role. Mark ✓ pass / ✗ fail with a note.
The checklist assumes you boot the app fresh and login with each role.

> **No code can verify these end-to-end** — you have to boot the app
> and tap through. Below is the minimum coverage. Spend ~30 min total.

---

## Setup

- [ ] `npx expo start` boots without errors
- [ ] Reload in iOS sim / device — no red error screens
- [ ] Reload in Android sim / device — no red error screens
- [ ] EN ↔ NE language toggle (any screen with the 🌐 pill) switches without crash and persists across reloads

---

## Teacher role (login as `bhikkhu` / standard demo creds)

### Home + Tabs

- [ ] Home renders — hero shows name + saffron gradient
- [ ] All 5 tabs reachable: Home / Courses / Applied / Notifications / Profile

### Courses flow

- [ ] Open Courses tab — sees the open courses list
- [ ] Tap a course card → detail screen opens
- [ ] Tap "View Pre-Course Brief →" on an approved card → brief screen opens
- [ ] Brief screen: all sections render (about / objectives / arrival / co-teacher / contact)
- [ ] Back from brief → returns to detail

### Applications flow

- [ ] Applied tab shows the 3 demo applications
- [ ] Approved card shows dashed footer + Brief link
- [ ] Rejected card shows reason box

### Profile flow

- [ ] Profile renders hero + avail calendar + languages + regions
- [ ] Tap month cells cycles avail → festival → unavail → avail
- [ ] Edit Profile button opens edit screen
- [ ] Edit screen: type in personal-note field, save — value persists on re-open

### Notifications

- [ ] Notifications list renders with 5 demo types
- [ ] Tap an invite → detail view with Accept / Decline buttons
- [ ] Decline → 2-step confirm flow works
- [ ] Back returns to list

---

## Server role (login as `priya` / standard demo creds)

### Onboarding (first run only — clear app storage to retest)

- [ ] All 5 yes/no questions render
- [ ] Q2 shows animated dhamma-wheel GIF (not 🧘 emoji)
- [ ] Continue button enables only after answering current step
- [ ] Result screen: all-yes path shows gold "Eligible" hero
- [ ] All-yes → "Enter Dashboard →" lands on server home
- [ ] Re-test: at least one "No" → red "Eligibility Pending" hero with Review/Continue CTAs

### Home + Tabs

- [ ] All 5 tabs visible: Home / Serve / My Service / Notifications / Profile
- [ ] Tab labels show Acharya-correct Nepali in NE mode
- [ ] Home renders hero with name + 🌿 badge

### Opportunities flow

- [ ] Serve tab → list of 5 server courses
- [ ] Filter chips work — "All" + per service area
- [ ] Tap a course card → detail with daily schedule + service areas
- [ ] Apply to Serve → opens apply wizard
- [ ] Apply wizard: pick at least one area; Submit enables; full/partial toggle works
- [ ] On submit → success screen "Dhanyabad!" with stacked CTAs

### My Service (applications)

- [ ] List shows 3 demo applications with status pills
- [ ] Tap an approved card → detail with What to Bring checklist
- [ ] Tap a pending card → detail with pending banner
- [ ] Tap a rejected card → detail with reason card
- [ ] Withdraw flow: red outline button → confirm panel → confirm → withdrawn success state

### Profile

- [ ] Hero + eligibility banner render
- [ ] Availability grid is 2 rows × 6 months (not all 12 in one row)
- [ ] "View all courses →" tap shows "Coming soon" Alert (not a crash)
- [ ] Sign Out → returns to login

---

## Admin role (login as `admin` / standard demo creds)

### Dashboard

- [ ] Navy gradient hero with "Admin" kicker + Dashboard title
- [ ] Bell icon top-right has red unread dot — tap → notifications screen
- [ ] 3 stat chips: 4 (gold) / 6 (coral) / 138 (white)
- [ ] Quick-action row: 3 buttons (Applications / Teachers / Auto-Schedule)
- [ ] Urgent section: 3 cards with year-suffix dates (e.g. `Jul 15–26, 2026`)
- [ ] Assign AT → routes to Teachers directory
- [ ] Recent Applications: 2 cards, tap → review screen
- [ ] Notification Center card → notifications list
- [ ] Co-Teacher toggle flips between on/off
- [ ] Sign Out works

### Tab bar (admin)

- [ ] 6 tabs visible with labels + admin-blue active accent: Dashboard / Applications / Teachers / Calendar / Schedule / Servers
- [ ] Applications tab has red unread dot on the icon
- [ ] AppsIcon renders as isometric hexagon (not 4-square grid)

### Applications (inbox)

- [ ] Header with bell tile (saffron-light, red dot)
- [ ] Stats row: Pending / Rejected / Approved with live counts
- [ ] 3 tabs: pending / approved / rejected — switching filters cards
- [ ] Pending cards have 3 buttons (Approve / Reject / Review →)
- [ ] Tap Approve → card moves to Approved tab
- [ ] Approved cards show `✓ Approved` pill + Review → button only
- [ ] Tap Review → → opens review detail; status pre-fills correctly

### Review detail

- [ ] Hero with 62×62 white-glass avatar, "Applying for" tile
- [ ] Match score big number (52px)
- [ ] 5 eligibility checks with ok/fail icons
- [ ] Approve/Reject buttons → result card with ✅/❌
- [ ] Back to Inbox link works

### Teachers directory

- [ ] 6 teacher cards with availability dot (forest green) where `avail: true`
- [ ] Search filter narrows by name
- [ ] Language filter chips work
- [ ] "+ Add Teacher" button shows Coming Soon alert
- [ ] View Profile → admin review

### Auto-Schedule

- [ ] Forest hero, 3 stats, 8 criteria chips in 4×2 grid
- [ ] 6 draft cards (3 high / 2 review / 1 unscheduled)
- [ ] Tap Change on assigned card → modal opens with course summary
- [ ] Modal teacher dropdown: tap "Choose a teacher… ▾" → 7-row list expands
- [ ] Tap a teacher → list collapses, button shows the name
- [ ] Reason dropdown same behavior
- [ ] Cancel closes modal; Confirm enabled only after teacher selected
- [ ] Finalize & Notify → button swaps to ✅ Notified + green confirmation banner

### Calendar

- [ ] "July 2026" centered between ‹/› buttons
- [ ] Day-strip cells visible (22×22 with day numbers)
- [ ] ‹/› navigate months, clamp at Jan/Dec
- [ ] 4 event cards with type-coloured borders
- [ ] Unscheduled banner has danger-styled "Run Auto-Schedule" → schedule screen

### Notifications

- [ ] Tab bar still visible on this screen
- [ ] 3 notification cards with type-coloured borders
- [ ] Read cards at 88% opacity, unread full opacity + saffron dot
- [ ] Tap card → expands inline with email body + Copy/Resend buttons
- [ ] Compose button shows Coming Soon alert

### Server Management (Servers tab → Board)

- [ ] "Server Management" 26/800 title
- [ ] Course selector chips with simplified labels
- [ ] Blue stats banner (open count flips red if ≤3)
- [ ] View toggle: List / Grid
- [ ] List view: per-area cards with day-dot rows + 2 buttons
- [ ] Grid view: compact table with ✓/○ cells
- [ ] All 4 paths to Inbox work (Assign Server / View Applicants / Review All / Open Inbox)

### Server Inbox

- [ ] 5 applicant cards with gendered pastel avatars
- [ ] Filter chips: All + per-course
- [ ] Inline Approve/Reject removes card from list
- [ ] Tap card or View Applicant → → detail with eligibility info + decision area
- [ ] Detail Approve/Reject closes and removes from list

---

## Cross-cutting

- [ ] Hot reload works on at least one screen edit
- [ ] No console warnings for `key` props, deprecated APIs, font loading
- [ ] EN ↔ NE toggle: every screen has Nepali labels where applicable (Acharya-correct, never शिक्षक)
- [ ] Back button (Android hardware) doesn't crash any flow

---

## After running

If anything fails, paste here:

```
Screen / path:
What happened:
Expected:
Severity (blocker / major / minor / cosmetic):
```

Then triage with me — I'll fix the bugs.
