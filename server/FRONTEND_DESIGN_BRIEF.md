# CEMS — Frontend Design Brief (for Claude Design)

> **Purpose of this document.** This is a self-contained brief that tells Claude (or any designer) exactly what to build so the UI matches the backend, serves non-technical users, and looks like a serious institutional product — not a hobby project. Read it top to bottom before producing a single screen.

---

## 1. Project Context

The **College Event Management System (CEMS)** is the platform that an entire college uses to plan, announce, attend, and secure on-campus events. The backend is a Node.js + MongoDB API documented in `PRD_TDD.md`. This document is about the **frontend only**.

**Critical context about the audience:**
- The primary user is an **18–22-year-old college student** with a phone.
- The secondary users are **organizing-committee members and faculty admins** who may have **zero programming or product experience**.
- Many faculty admins are first-time app users — they should *never* feel like they're "using software." They should feel like they're filling a form, tapping a button, and getting a clear result.
- The judging panel for this major project is academic — the UI must look **clean, institutional, and trustworthy**, not playful or trendy.

---

## 2. Design Non-Negotiables

These are hard rules. If a design choice conflicts with any of these, the rule wins.

1. **Solid colors only. No gradients. Anywhere. Ever.** Not on buttons, not on backgrounds, not on icons, not on charts. If a surface needs depth, use a 1px border or a flat shadow — never a gradient.
2. **No decorative illustrations or 3D mascots.** This is an institutional product. Empty states use a single line icon + plain text.
3. **Minimum screens, maximum reuse.** If two flows can share a screen, they share. Target: ≤ 14 distinct screens across all three roles.
4. **Mobile-first.** Students will primarily use phones. Tablet and desktop are scaled-up versions of the mobile layout — not separate designs.
5. **One primary action per screen.** Never make a user choose between two equally-prominent buttons.
6. **Every state must be designed.** For every screen, the designer must produce: default, loading, empty, error, and (where applicable) success. No screen is "done" until all five exist.
7. **Tap targets ≥ 44×44 px.** No exceptions, including icon buttons.
8. **Plain English, no jargon.** Never show error codes like `VENUE_CONFLICT` to the user — translate them. The error message dictionary is in §9.
9. **No "are you sure?" modal for safe actions.** Confirmation modals are reserved for destructive or irreversible actions (cancel RSVP, cancel event, consume gate pass).
10. **No light/dark theme toggle in v1.** Light theme only. Reduces design surface; can be added later.

---

## 3. Personas & Primary Jobs

### 3.1 Student (default role, ~95% of users)
**Their job in one sentence:** "Find an event that looks interesting, RSVP, and show my gate pass at the door."

Top three things they do:
1. Browse upcoming events
2. RSVP / cancel RSVP
3. Show the QR gate pass at the venue

### 3.2 Organizer (event organizing committees)
**Their job in one sentence:** "Submit my event proposal and tell the right students about it."

Top three things they do:
1. Create an event and submit it for admin approval
2. Watch its status and see who RSVPed
3. Post an announcement targeted at the right audience

### 3.3 Admin (faculty / event office)
**Their job in one sentence:** "Approve the events that should happen, reject the rest, keep the venue free of double-bookings."

Top three things they do:
1. Review the pending-approval queue
2. Approve / reject events
3. Verify gate passes at the gate (QR scanner)

---

## 4. Design Tokens

These are the only values a designer may use. **No off-palette colors.**

### 4.1 Colors (all solid, all opaque)

| Token | Hex | Used for |
|---|---|---|
| `--color-primary` | `#1E3A8A` | Brand. Primary buttons, active nav, links, focused inputs. (Deep institutional indigo.) |
| `--color-primary-hover` | `#1E40AF` | Primary button hover/press. |
| `--color-text` | `#0F172A` | Body text, headlines. |
| `--color-text-secondary` | `#475569` | Subtitles, helper text, metadata. |
| `--color-text-disabled` | `#94A3B8` | Disabled labels. |
| `--color-surface` | `#FFFFFF` | Cards, sheets, inputs. |
| `--color-background` | `#F8FAFC` | App background. |
| `--color-border` | `#E2E8F0` | Hairline borders, dividers. |
| `--color-border-strong` | `#CBD5E1` | Focused/active borders. |
| `--color-success` | `#15803D` | Confirmed states, success toasts. |
| `--color-warning` | `#B45309` | Pending approval, "expires soon." |
| `--color-danger` | `#B91C1C` | Errors, destructive buttons, conflict warnings. |
| `--color-info` | `#1E3A8A` | Info banners. (Same as primary on purpose.) |

**Status pill colors** (badge background / text — solid only):

| Event status | Background | Text |
|---|---|---|
| `DRAFT` | `#E2E8F0` | `#334155` |
| `PENDING_APPROVAL` | `#FEF3C7` | `#B45309` |
| `APPROVED` | `#DCFCE7` | `#15803D` |
| `PUBLISHED` | `#DBEAFE` | `#1E3A8A` |
| `ONGOING` | `#1E3A8A` (filled) | `#FFFFFF` |
| `COMPLETED` | `#F1F5F9` | `#475569` |
| `CANCELLED` | `#FEE2E2` | `#B91C1C` |

### 4.2 Typography

Single typeface family: **Inter** (system fallback: `-apple-system, "Segoe UI", Roboto, sans-serif`).

| Token | Size / Weight / Line-height | Used for |
|---|---|---|
| `display` | 28 / 700 / 36 | Top-of-screen page title |
| `h1` | 22 / 700 / 28 | Section header |
| `h2` | 18 / 600 / 24 | Card title |
| `body` | 16 / 400 / 24 | Default body |
| `body-strong` | 16 / 600 / 24 | Emphasis in body |
| `small` | 14 / 400 / 20 | Metadata, helper text |
| `caption` | 12 / 500 / 16 | Pill labels, timestamps |
| `button` | 16 / 600 / 24 | Button label |

### 4.3 Spacing scale (in px)

`4, 8, 12, 16, 24, 32, 48, 64`. No other values allowed.

### 4.4 Radii

| Token | Value |
|---|---|
| `radius-sm` | 6px (pills, badges) |
| `radius-md` | 10px (buttons, inputs) |
| `radius-lg` | 14px (cards, sheets) |

### 4.5 Elevation

Only two shadows exist. No gradients, no glow.

- `shadow-1` (cards): `0 1px 2px rgba(15, 23, 42, 0.06)`
- `shadow-2` (modal/sheet): `0 10px 24px rgba(15, 23, 42, 0.12)`

### 4.6 Motion

- All transitions: 150 ms ease-out.
- No parallax, no spring physics, no decorative animation. Page transitions are instant.

---

## 5. Component Primitives

Designer must produce a tiny component library used across every screen. Do NOT invent variants beyond what's listed.

| Component | Variants | Behavior |
|---|---|---|
| **Button** | `primary` (filled, primary color), `secondary` (outline, primary border + text), `danger` (filled, danger color), `ghost` (no border, primary text). All have: default / hover / pressed / disabled / loading. Loading state shows a spinner *replacing* the label, button width is preserved. |
| **Input** | Single style. Label above, input below, helper text under. Error state: red border + red helper text. |
| **Textarea** | Same as Input. Min 4 lines tall. |
| **Select / Dropdown** | Single style, native on mobile. |
| **Date/Time picker** | Native picker on mobile (`type="datetime-local"`). On desktop, a minimal calendar widget. |
| **Card** | White surface, `radius-lg`, `shadow-1`, 16 px padding. |
| **Badge / Pill** | Status pill (see §4.1). Always small caps or sentence case — never SCREAMING. |
| **Toast** | Slides in from bottom (mobile) or top-right (desktop). 4-second auto-dismiss. Stacks max 3. Solid background using `--color-success` / `--color-danger` / `--color-text`. White text. |
| **Modal / Bottom sheet** | Used only for confirmation or short forms. Backdrop is `rgba(15, 23, 42, 0.4)`. Mobile uses a bottom sheet (slides up); desktop uses a centered modal. |
| **Loader** | Two variants: (a) **Skeleton blocks** for content placeholders (list items, cards) — solid `#E2E8F0` rectangles, no shimmer animation in v1 (or a very subtle 1-second pulse if absolutely needed). (b) **Spinner** (centered, in-place) only when there is genuinely nothing to skeleton, e.g., a full-page transition. |
| **Empty state** | Single 24 px monoline icon + 1 line of plain text + (optionally) one secondary button to take action. |
| **Tab bar** | Bottom nav on mobile, top nav on desktop. Max 4 items. Active item: filled icon + primary color label. Inactive: outline icon + secondary text color. |
| **List row** | 64 px min height, tappable across the full width on mobile. |

---

## 6. Information Architecture

### 6.1 Screen map

```
PUBLIC
  └── Login
  └── Register

STUDENT  (logged in, no special role)
  ├── Home              [tab 1] — feed + upcoming events
  ├── My Events         [tab 2] — RSVPed events grouped by Upcoming / Past
  ├── My Pass           [tab 3] — gate pass QR
  └── Profile           [tab 4] — name, dept, year, logout
  └── Event Detail      (pushed from Home / My Events)

ORGANIZER  (everything STUDENT has, plus:)
  └── My Events list extends with a "Manage" tab inside it
  └── Create Event      (pushed via FAB on My Events)
  └── Create Announcement (pushed via FAB on Home)

ADMIN  (own tab set, replaces STUDENT tabs)
  ├── Approvals         [tab 1] — pending event queue
  ├── Events            [tab 2] — all events, filter by status
  ├── Scanner           [tab 3] — verify gate pass (manual paste in v1; QR camera optional later)
  └── Profile           [tab 4]
  └── Event Detail / Create Announcement / Create Asset (modal flows)
```

**Total distinct screens:** 12. Reused across roles via conditional rendering.

### 6.2 Navigation rules

- **Bottom tab bar on mobile.** Always visible except on Login, Register, and confirmation modals.
- **Top app bar.** Title in the center; back arrow on the left (only on pushed screens, never on tabs); a single action icon on the right where needed.
- **Floating action button (FAB).** Bottom-right, primary color, white icon. Used only on screens where the principal action is "create something." Tabs without a create action have no FAB.

---

## 7. Screen-by-Screen Specifications

For every screen below, the designer must produce **default + loading + empty + error + success** states.

### 7.1 Login
- Fields: Email, Password.
- Single primary button: "Sign in."
- Below: text link "Don't have an account? Sign up."
- **Loading**: button spinner replaces label, inputs become read-only.
- **Error states** (inline, under the form, in `--color-danger`):
  - Invalid credentials → "Email or password is incorrect."
  - Network failure → "Can't reach the server. Check your internet and try again."
  - Validation (e.g., empty email) → per-field error under the input.
- **API:** `POST /api/v1/auth/login` → store `accessToken` + `refreshToken`.

### 7.2 Register
- Fields: Full name, Email, Password (with min-8 helper text), Department (dropdown of college departments), Year (dropdown 1–6).
- Primary button: "Create account."
- After success: auto-login → land on Home with a one-time success toast: "Welcome! Your account is ready."
- **Error states:**
  - Email already exists → "An account with this email already exists. Try signing in."
  - Weak password → inline under the field: "Password must be at least 8 characters."
- **API:** `POST /api/v1/auth/register`.

### 7.3 Home (Student & Organizer)
Two stacked sections, scrollable:

1. **Announcements** (horizontal scroll, max 5 cards visible, last item is "See all").
2. **Upcoming events** (vertical list of cards).

Each **event card** shows:
- Status pill (top-right)
- Title (h2)
- Date & time (formatted as "Tue, 4 Mar · 6:00 PM")
- Venue name
- A "RSVP" pill button on the right (filled if not yet RSVPed; outlined check "Going" if RSVPed) — tapping toggles.

**Loading state**: 3 skeleton cards.
**Empty state**: icon + "No upcoming events right now." + (organizer only) "Create one" button.
**Error state**: a single inline retry block — "Couldn't load events. [Retry]"

**FAB (organizer only)**: "+" → opens Create Announcement.

**API:**
- `GET /api/v1/marketing/feed?limit=5` for the top strip
- `GET /api/v1/events?status=PUBLISHED&from=<now>` for the list

### 7.4 Event Detail
Sections (top to bottom):
1. Hero: title (display), status pill, date/time, venue.
2. Description (body text).
3. Capacity meter — "84 of 200 going" + a flat progress bar (solid primary, solid border-color rest).
4. RSVP primary action button. States:
   - Not RSVPed + space available: filled primary "RSVP to this event."
   - RSVPed: secondary outline "You're going · Cancel RSVP" (tapping opens confirmation modal — see §11).
   - Full: disabled "Event is full."
   - Not yet APPROVED/PUBLISHED: hide the button entirely.
5. (If RSVPed) A subtle info banner: "Your gate pass is ready in the My Pass tab."

**Loading**: skeleton hero + skeleton bars.
**Error**: "Couldn't load this event. [Retry]"

**Organizer/Admin extra**: a single "Manage" link in the top bar opening:
- (Organizer-owner) Submit for approval / Cancel.
- (Admin) Approve / Reject / Cancel / Mark Published.

**API:**
- `GET /api/v1/events/:id`
- `POST /api/v1/events/:id/rsvp` / `DELETE /api/v1/events/:id/rsvp`
- `PATCH /api/v1/events/:id/status` (organizer/admin only)

### 7.5 My Events (Student) / Manage Events (Organizer)
Two segmented tabs at the top: **Upcoming** | **Past**.

Each row: status pill · title · date · venue · chevron-right.

**Empty (Upcoming)**: "You haven't RSVPed to anything yet." + button "Browse events" → Home.
**Empty (Past)**: "No past events." (no button).

**Organizer view** has an additional segment **Mine** showing events the organizer created (any status). FAB visible: "+" → Create Event.

**API:**
- Student: derive from `/api/v1/auth/me` + `/api/v1/events?...` (or list endpoint filtered by RSVP — backend can add a `?rsvpedBy=me` filter later; for v1, the frontend reads `user.rsvpedEvents`).
- Organizer-mine: `GET /api/v1/events?organizerId=me` (frontend filters; or list & filter client-side).

### 7.6 Create Event (Organizer / Admin)
Single-screen form, **no multi-step wizard**:

- Title
- Description (textarea)
- Venue (dropdown — list from a venue endpoint; if no venues, disabled with helper "Ask an admin to add a venue")
- Start time (datetime picker)
- End time (datetime picker)
- Capacity (number input)
- Tags (chips input, optional)
- **Target audience** section, collapsed by default. Expanding reveals three multi-select chips fields: Departments, Years, Roles. Empty = "everyone."

Primary button: "Submit for approval."
Secondary button at the bottom: "Save as draft."

**Validation:**
- End must be after start (helper text under End: "Must be after start time").
- Capacity > 0 and ≤ venue capacity (helper text dynamic: "Venue allows up to 300").
- Required fields show per-field error on blur.

**Submit result:**
- 201 → toast "Event submitted for approval." → navigate back.
- 409 venue conflict → inline banner above the form, danger color: "This venue is already booked for this time slot. Choose a different time or venue." (Note: backend allows draft creation even with conflict; conflict only triggers on `APPROVED` transition. But if frontend sees a 409 anywhere in this flow, this is the copy.)
- 400 validation → highlight the offending fields based on `error.details` keys.

**API:** `POST /api/v1/events`.

### 7.7 Create Announcement (Organizer / Admin)
Same form pattern as Create Event but shorter:
- Title, Body, (optional) link to an event, Target audience block.
- Primary: "Publish."

**API:** `POST /api/v1/marketing/announcements`.

### 7.8 My Pass (Student)
The most important screen for non-tech users. Maximum simplicity.

Layout:
- Big card centered.
- Card top: event title + date + venue.
- Card middle: **large QR code** (min 240×240 px on mobile, generated from the JSON in `data.qr` returned by the issue endpoint).
- Card bottom: pass ID (small caption, copyable), expiry time ("Valid until 9:00 PM").
- Below the card: line "Show this at the gate. Don't share it."

If the user has RSVPed to **multiple** upcoming events: show a horizontal carousel — one pass per page, dots indicator.

If the user has RSVPed but the pass hasn't been issued yet: show a button "Generate my pass" that calls `POST /api/v1/logistics/gate-pass`.

**Loading**: skeleton card.
**Empty**: icon + "No active passes. RSVP to an event to get one." + button "Browse events."
**Error**: "Couldn't load your pass. [Retry]"
**Expired pass**: card overlay "Expired" stamp using `--color-text-secondary`, QR rendered at 50% opacity, RSVP button disabled.

**API:**
- `POST /api/v1/logistics/gate-pass` (to issue)
- The QR code's encoded value = `JSON.stringify(data.qr)` from the issue response.

### 7.9 Profile
- Avatar circle with the user's initials in solid primary, white text.
- Full name (h1)
- Email, Department, Year (key-value rows)
- Role(s) — as pills
- Bottom: "Sign out" button (secondary style, danger color text — confirms via modal).

**API:** `GET /api/v1/auth/me`.

### 7.10 Admin · Approvals
Single vertical list of events with status `PENDING_APPROVAL`.

Each row:
- Title
- Organizer name
- Date + venue
- Two actions on the right: **Approve** (small primary) and **Reject** (small ghost-danger).

Tapping Approve:
- Calls `PATCH /events/:id/status { status: 'APPROVED' }`.
- On 409 → toast "Venue conflict — another event already approved for this slot." + row stays.
- On success → row animates out (slide-up + fade, 150 ms) + toast "Event approved."

Tapping Reject opens a confirmation modal "Reject this event? The organizer will need to submit again." with "Cancel" / "Reject" (danger). Reject calls the same endpoint with `CANCELLED`.

**Empty**: icon + "No events waiting for approval. You're all caught up."
**Loading**: 4 skeleton rows.

### 7.11 Admin · Events
Same layout as Student/Organizer event list but with a **status filter** segmented control at the top: All / Approved / Published / Ongoing / Completed / Cancelled.

Tapping a row opens Event Detail with the admin Manage actions enabled.

### 7.12 Admin · Scanner
Most pragmatic v1 design — no camera dependency:

- Header text: "Paste or scan the QR code from the student's pass."
- Textarea (large, monospace) for the JSON QR payload.
- Primary button: "Verify pass."

On submit:
- Calls `POST /api/v1/logistics/gate-pass/verify` with the parsed JSON.
- **Valid result**: full-screen success state — big green checkmark, "Pass is valid," event title, user name (looked up from `pass.userId` via a small `/auth/me`-like lookup or shown as the ID for v1), and a primary button "Mark as used" → calls `/gate-pass/consume`.
- **Invalid result**: full-screen danger state — red X, "Pass is invalid," reason text from `error.message`, and a "Scan another" button to reset.
- **Already consumed**: warning state — amber icon, "This pass has already been used," + scan another.

Keep the success / failure screens **full-bleed and unambiguous** — a gate volunteer reading them in 2 seconds must know whether to let the student in.

### 7.13 (Optional, Admin only) Assets
Listed by category. Each row: name, "12 of 20 available." Tap to open a small sheet: Reserve / Release buttons + quantity stepper. Not on the bottom tab — accessed from Profile → "Manage assets."

### 7.14 Forgot password
Not implemented in backend yet. **Out of scope for v1.** If the designer wants a placeholder link on Login, that's fine — it can route to a "Contact your admin" empty screen.

---

## 8. State Coverage Checklist (every screen)

For each of the 12 screens above, the designer delivers a state matrix:

| State | When it shows | Visual rule |
|---|---|---|
| **Default** | Data loaded, content present. | Standard layout. |
| **Loading** | Initial fetch in flight. | Skeletons matching the final layout — never a centered spinner unless layout is unknowable. |
| **Empty** | Fetch succeeded, but no data. | Single icon + plain-language sentence + (optional) one secondary CTA. |
| **Error** | Fetch failed (5xx, network, timeout). | Inline panel at the top of the would-be content area: icon + "Couldn't load X." + "Retry" button. |
| **Success** (where relevant) | After a write — RSVP, create, approve, etc. | Toast for non-destructive success. Full-screen confirmation only for: Pass verified, Event submitted. |

---

## 9. Error Message Dictionary

The backend returns errors as `{ error: { code, message, details? } }`. **Never show the raw `code` to the user.** Map each code to plain language:

| Backend `code` | User-facing message |
|---|---|
| `UNAUTHENTICATED` | "Your session has expired. Please sign in again." (and auto-route to Login) |
| `FORBIDDEN` | "You don't have permission to do that." |
| `NOT_FOUND` | "We couldn't find that. It may have been removed." |
| `VALIDATION_ERROR` | Use `details` to show per-field inline errors. If no details: "Something in the form isn't right. Please review and try again." |
| `DUPLICATE_RESOURCE` (RSVP) | "You've already RSVPed to this event." |
| `DUPLICATE_RESOURCE` (register) | "An account with this email already exists." |
| `VENUE_CONFLICT` | "This venue is already booked for that time slot." |
| `INVALID_PASS` | "This pass is not valid." + sub-line with the reason ("Signature mismatch" → "It may have been tampered with." / "expired" → "It has expired."). |
| `INTERNAL` | "Something went wrong on our side. Please try again in a moment." |
| Network failure (no response) | "Can't reach the server. Check your internet and try again." |

---

## 10. Loaders & Skeleton Patterns

- **Lists**: 3–4 skeleton rows matching the real row height.
- **Cards**: skeleton with the same outer shape (title bar, two text lines).
- **Buttons during submit**: replace label with a spinner; keep the button width fixed.
- **Full-page transitions**: do NOT use a full-page spinner if the destination has any content shape known in advance — always prefer skeletons.
- **Long operations (>1.5 s)**: add a subtle helper text below the spinner ("Still working…") at the 1.5 s mark, never an indeterminate progress bar.

---

## 11. Confirmation Modals — Exhaustive List

Modals are reserved for these four actions only:

1. **Cancel RSVP** — "Cancel your RSVP? You'll lose your spot and your gate pass." → [Keep RSVP] / [Cancel RSVP] (danger).
2. **Reject event (admin)** — "Reject this event? The organizer will need to submit again." → [Keep pending] / [Reject] (danger).
3. **Cancel event (organizer/admin)** — "Cancel this event? Everyone who RSVPed will be notified." → [Keep event] / [Cancel event] (danger).
4. **Sign out** — "Sign out of CEMS?" → [Stay] / [Sign out] (danger).

**Mark gate pass as used** does NOT need a confirm — it's the scanner's primary action, and the consume operation is the intended one-way step. If the scanner taps it by mistake, the worst case is a student getting waved through twice, which the gate person handles in-person.

---

## 12. Accessibility & Non-Tech-User Guidance

These are not optional — they're how this product earns the "professional, institutional" impression.

- **Tap targets ≥ 44×44 px**, including icon buttons. Even when the icon is 24 px, the hit area is 44.
- **Color is never the only signal.** Status pills always carry a text label. Errors always have an icon + text, not just red coloring.
- **Plain English first.** "Submit for approval" beats "Send for review." "Show this at the gate" beats "Display QR upon entry."
- **Forms remember what the user typed.** A network error never clears the form. Re-submitting just re-sends what's there.
- **Date/time formats** are absolute and friendly: "Tue, 4 Mar · 6:00 PM," never "2026-03-04T18:00:00Z."
- **No nested scrolling.** If a section needs to scroll inside the page, the designer must explicitly call it out and justify it.
- **Focus rings stay visible** on keyboard navigation — 2 px primary-color outline, no removal of `:focus-visible`.
- **One Indian-English convention call** to settle: dates are `Tue, 4 Mar 2026`, times are 12-hour with AM/PM. Use this consistently.

---

## 13. Things to AVOID (do not generate these)

- Gradients of any kind.
- Drop shadows beyond the two tokens in §4.5.
- Glassmorphism, frosted blur effects, neumorphism.
- Bright accent colors outside the palette (no teals, no purples, no coral).
- Custom illustrations or 3D characters for empty states.
- Stylized "fun" fonts. Inter only.
- Emoji in UI copy. (Reserved for content the user types themselves.)
- "Confetti" or celebration animations.
- Multi-step wizards. Every form fits one screen, with optional collapsed sections.
- Modal stacking. Only one modal open at a time.
- Hover-only affordances on mobile. Every interactive element must be discoverable by sight.

---

## 14. Backend Contract Summary (for the designer's reference)

This section lets the designer wire every screen to the right endpoint without re-reading the PRD.

### Auth
- `POST /api/v1/auth/register` → `{ user, accessToken, refreshToken }`
- `POST /api/v1/auth/login` → `{ user, accessToken, refreshToken }`
- `POST /api/v1/auth/refresh` → `{ accessToken, refreshToken }`
- `GET  /api/v1/auth/me` → `{ principal: { userId, roles } }` (front-end should also fetch full user via existing routes when needed)

### Events
- `GET    /api/v1/events?status=&venueId=&from=&to=&limit=&skip=` → `{ items, total, limit, skip }`
- `GET    /api/v1/events/:id`
- `POST   /api/v1/events`                         (ORGANIZER, ADMIN)
- `PATCH  /api/v1/events/:id/status`              (ORGANIZER own / ADMIN any)
- `POST   /api/v1/events/:id/rsvp`
- `DELETE /api/v1/events/:id/rsvp`

### Marketing
- `GET  /api/v1/marketing/feed?limit=&skip=`      (audience-filtered server-side)
- `POST /api/v1/marketing/announcements`          (ORGANIZER, ADMIN)

### Logistics
- `POST /api/v1/logistics/gate-pass` → `{ pass, qr }` (QR payload = exactly what to encode in the QR image)
- `POST /api/v1/logistics/gate-pass/verify`       (ORGANIZER, ADMIN) → `{ valid, reason, pass? }`
- `POST /api/v1/logistics/gate-pass/consume`      (ORGANIZER, ADMIN)
- `GET  /api/v1/logistics/assets`
- `POST /api/v1/logistics/assets`                 (ADMIN)
- `POST /api/v1/logistics/assets/:id/reserve`     (ORGANIZER, ADMIN)
- `POST /api/v1/logistics/assets/:id/release`     (ORGANIZER, ADMIN)

### Response envelope (every endpoint)
```json
{ "success": true|false, "data": <object|null>, "error": null | { "code": "...", "message": "...", "details": {...} } }
```

### Auth token usage
- Send `Authorization: Bearer <accessToken>` on every authenticated request.
- On a `401` response, attempt one silent refresh with the refresh token. On refresh failure, route to Login with a one-time info toast: "Your session has expired. Please sign in again."

---

## 15. Deliverable Checklist for the Designer

Before handing back designs, confirm ALL of the following exist:

- [ ] 12 screens × 5 states (default / loading / empty / error / success-where-applicable) = ≥ 50 frames.
- [ ] Component sheet (Button × 4 variants × 5 states, Input × 4 states, Card, Badge × 7 statuses, Toast × 3 variants, Modal × 1 base, Skeleton × 2 sizes).
- [ ] Mobile (375 px) frames for every screen. Tablet/desktop frames optional in v1.
- [ ] Tap-target audit: every interactive element ≥ 44×44.
- [ ] Color audit: every fill in the design uses a token from §4.1. No off-palette samples.
- [ ] Typography audit: every text node uses a token from §4.2.
- [ ] At least one full role walkthrough rendered as a connected flow: Student (Login → Home → Event Detail → RSVP → My Pass), Organizer (Login → My Events → Create Event → Submitted), Admin (Login → Approvals → Scanner).

---

**End of brief.** When in doubt, default to the more boring, more institutional choice. The goal is for a faculty admin's first reaction to be "this looks like proper software," not "this looks fun."
