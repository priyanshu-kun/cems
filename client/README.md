# CEMS — Frontend

React frontend for the **College Event Management System**. Built with Vite + React 18 + React Router. Talks to the CEMS REST API (OpenAPI 3.1).

> A clickable preview of the UI lives in **`preview.html`** — open it directly in your browser to see the design with mocked data. The real app is in `src/` and connects to your backend.

---

## Features

- 🔑 **Auth** — register, login, refresh token rotation, `/auth/me` session bootstrap, role-aware routing (STUDENT · ORGANIZER · ADMIN).
- 📅 **Events** — list with status filters, detail view with capacity meter, RSVP and cancel (FCFS-aware), organizer & admin lifecycle controls (`DRAFT → PENDING_APPROVAL → APPROVED → PUBLISHED → ONGOING → COMPLETED` plus `CANCELLED`).
- 🎟 **Gate pass** — issue a pass on RSVP, view the QR code, scanner verifies + consumes passes against the backend (`success: false` with `INVALID_PASS` handled gracefully).
- 📣 **Marketing** — audience-filtered notice-board feed, organizer/admin can post announcements with department/year/role targeting.
- 📦 **Assets** — list, create, atomically reserve and release units. Admin-only create.
- 🛡 **Approvals** — admin queue for pending events with approve/reject.
- 💻 **Desktop-first** — sidebar nav + 1240px content column on wide screens; bottom tab bar + collapsible sidebar on phones.

---

## Setup

```bash
# 1. Install deps
npm install

# 2. Configure environment
cp .env.example .env
# edit .env — at minimum set VITE_API_BASE_URL to your backend

# 3. Run dev server
npm run dev
# → http://localhost:5173
```

### Build for production

```bash
npm run build      # outputs to ./dist
npm run preview    # serves the built bundle locally
```

`dist/` is a static folder — drop it on any host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront, nginx, etc.). No SSR; React Router uses the History API, so configure your host to fall back to `index.html` on 404.

#### nginx fallback
```nginx
location / {
  try_files $uri /index.html;
}
```

#### Vercel / Netlify
Both detect Vite automatically. For Netlify, add a `_redirects` file with `/* /index.html 200`. For Vercel, no extra config needed.

---

## Environment variables

All runtime config lives in `.env`. Every key is documented in `.env.example`. Highlights:

| Key | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend URL, **including** the version prefix (e.g. `/api/v1`) |
| `VITE_APP_NAME` | Display name in the header and titles |
| `VITE_COLLEGE_NAME` | Subtitle next to the brand mark |
| `VITE_BRAND_INITIAL` | Single character for the brand mark glyph |
| `VITE_ACCESS_TOKEN_KEY` / `VITE_REFRESH_TOKEN_KEY` | localStorage keys for tokens |
| `VITE_USER_KEY` | localStorage key for the cached user object |
| `VITE_RSVPS_KEY` / `VITE_PASSES_KEY` | Per-user local mirror of RSVPs & gate passes |
| `VITE_REQUEST_TIMEOUT_MS` | Abort fetch after this many ms |
| `VITE_PAGE_SIZE` | Default page size for list endpoints |
| `VITE_DEPARTMENTS`, `VITE_YEARS`, `VITE_ASSET_CATEGORIES` | Comma-separated UI vocab |
| `VITE_VENUES` | `id\|name` pairs, comma-separated. Provides a dropdown when creating events. Empty = free-form ObjectId input |

Nothing is hardcoded. Change the brand or backend without touching code.

---

## Architecture

```
src/
├── api/          # One module per resource. Wraps fetch + envelope unwrap.
│   ├── client.js     # request(), requestEnvelope(), token storage, refresh logic
│   ├── auth.js       # /auth/register, /auth/login, /auth/refresh, /auth/me
│   ├── events.js     # /events CRUD + status transitions + RSVP
│   ├── marketing.js  # /marketing/feed, /marketing/announcements
│   ├── gatePass.js   # /logistics/gate-pass issue/verify/consume
│   └── assets.js     # /logistics/assets list/create/reserve/release
├── context/      # AuthProvider, ToastProvider, ModalProvider
├── hooks/        # useRsvps + usePasses — per-user local mirror of state
│                 # the backend can't list back to us today
├── components/   # Icon, Button, Form (Field/Input/…), Card, Pill,
│                 # Banner, Skeleton, Empty, EventCard, Layout, QR
├── pages/        # One file per route (Login, Home, EventDetail, …)
├── styles/
│   └── index.css     # design tokens + every component class
├── utils/        # Date/status formatters, error message extraction
├── App.jsx       # Routes + provider stack
├── main.jsx      # ReactDOM root
└── config.js     # Reads import.meta.env into a typed object
```

### API envelope

All backend responses follow `{ success, data, error }`. The client unwraps `data` on success and throws an `ApiError` on failure. For the gate-pass verify endpoint (where `success:false` is meaningful), `requestEnvelope()` returns the raw envelope instead.

### Token refresh

`client.js` runs a single in-flight refresh promise. On a 401 the request is retried once with the new access token. If refresh fails, both tokens are cleared and the user is bounced to `/login` by the auth context.

### Mirroring RSVPs / passes locally

The OpenAPI spec lets you POST an RSVP and POST/issue a gate pass, but doesn't expose `GET /me/rsvps` or `GET /me/passes`. Until those land, `useRsvps` and `usePasses` keep a per-user mirror in `localStorage` so "My events" and "My pass" work end-to-end. Swap them for real list endpoints whenever the backend adds them — just replace the two hooks.

---

## Routes

| Path | Roles | Page |
| --- | --- | --- |
| `/login`, `/register` | public | Auth |
| `/home` | any | Dashboard (announcements + upcoming) |
| `/events` | any | Browse with filters |
| `/events/:id` | any | Detail + lifecycle / RSVP actions |
| `/my-events` | any | RSVPed (+ mine, for organizers) |
| `/my-pass` | any | Issued gate passes with QR |
| `/profile` | any | Account + quick links |
| `/create-event` | ORGANIZER, ADMIN | New event form |
| `/create-announcement` | ORGANIZER, ADMIN | New announcement form |
| `/approvals` | ADMIN | Pending-approval queue |
| `/scanner` | ORGANIZER, ADMIN | Verify + consume passes |
| `/assets` | ORGANIZER, ADMIN | Reserve/release inventory |

---

## License

Private — internal college project.
