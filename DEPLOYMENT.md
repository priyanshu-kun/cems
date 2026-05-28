# Deploying CEMS to Render

This guide takes the CEMS backend and frontend from your local machine to live URLs on Render's free tier in about 10 minutes. The MongoDB Atlas cluster you're already using stays as the database — no Render database needed.

## What you'll end up with

```
Frontend (static site)              Backend (Node web service)
https://cems-frontend.onrender.com  →  https://cems-backend.onrender.com/api/v1
              │                                        │
              └────────────── browser ─────────────────┘
                                  │
                          MongoDB Atlas (existing)
```

Both services live on Render's **free tier**. Important caveat: free Node services **sleep after 15 minutes of inactivity** and take ~30 seconds to wake on the next request. Fine for a college demo; not fine for real users.

---

## Prerequisites

| Item | Why |
|---|---|
| A **GitHub account** | Render pulls code from GitHub (or GitLab/Bitbucket). |
| A **Render account** | Free signup at https://render.com — log in with GitHub for the smoothest path. |
| Your **Atlas cluster URL** | Already in `server/.env` as `MONGO_URI`. You'll paste it into Render. |

---

## Step 1 — Get the code on GitHub

Run these from the **project root** (`kasso_major_project/`):

```bash
git init
git add .
git status   # SANITY CHECK — confirm no .env files appear in the list
git commit -m "Initial commit: CEMS backend + frontend"
git branch -M main
```

**Stop here and verify**: run `git ls-files | grep -E '\.env$'`. If the output is empty, you're good. If `.env` appears, your `.gitignore` isn't working and you must NOT push — open the file and check.

Now create the GitHub repo:

1. Go to https://github.com/new
2. Repository name: `cems` (or whatever you like)
3. **Private** (you have an Atlas password in `.env.example` worth keeping out of public eyes)
4. **Don't** initialize with a README, license, or `.gitignore` — yours already exist
5. Click **Create repository**
6. Copy the commands GitHub shows for "push an existing repository," they look like:

```bash
git remote add origin git@github.com:YOUR_USERNAME/cems.git
git push -u origin main
```

Run them. Wait for the push to finish.

---

## Step 2 — Deploy on Render via Blueprint

1. Go to https://dashboard.render.com
2. Click **New** (top right) → **Blueprint**
3. Click **Connect a repository**, find your `cems` repo, click **Connect**
4. Render reads `render.yaml` at the repo root and shows a preview: two services, `cems-backend` and `cems-frontend`
5. Click **Apply**

Render will start provisioning. It'll pause and ask you to fill the secret env vars marked `sync: false`. There are three:

### `cems-backend` → `MONGO_URI`

Paste your Atlas connection string. The same one in `server/.env`:

```
mongodb+srv://kasso:kasso_major_project@cluster0.cbegbyp.mongodb.net/cems_dev?appName=Cluster0&retryWrites=true&w=majority
```

### `cems-backend` → `CORS_ORIGIN`

**You don't know this yet.** Leave it as a placeholder — `https://placeholder.onrender.com` is fine. We'll fix it in Step 4 after both services have URLs.

### `cems-frontend` → `VITE_API_BASE_URL`

Same problem — also unknown yet. Use `https://placeholder.onrender.com/api/v1` as a placeholder; we'll fix it in Step 3.

Click **Deploy** / **Save** for each.

---

## Step 3 — Note the live URLs and update the frontend's API base

Once the backend service finishes its first deploy (3–5 min), Render shows its URL at the top of the service page. It looks like:

```
https://cems-backend.onrender.com
```

Copy it. Now:

1. Go to **cems-frontend** → **Environment**
2. Edit `VITE_API_BASE_URL` to:
   ```
   https://cems-backend.onrender.com/api/v1
   ```
3. Click **Save Changes**. Render will rebuild the static site (1–2 min).

---

## Step 4 — Fix CORS on the backend

Now that the frontend has its URL too, lock down the backend so only the frontend can call it.

1. Go to **cems-frontend** → top of page → copy the live URL (e.g. `https://cems-frontend.onrender.com`).
2. Go to **cems-backend** → **Environment**.
3. Edit `CORS_ORIGIN` to the frontend URL exactly — **no trailing slash**.
4. Click **Save Changes**. Render restarts the backend (~30 s).

---

## Step 5 — Allow Render's IPs through Atlas (only if blocked)

Open https://cloud.mongodb.com → your cluster → **Network Access**.

If you see `0.0.0.0/0 (Allow access from anywhere)`, you're done — skip this step.

Otherwise:
1. Click **Add IP Address**
2. Click **Allow access from anywhere** (`0.0.0.0/0`)
3. Comment: "Render free tier — no static IPs"
4. Click **Confirm**

Atlas needs ~1 minute to apply the change.

> Render's free tier doesn't expose static outbound IPs, so this open-CIDR approach is the only viable option without paying for a static IP add-on. The Atlas username/password remain the actual access control.

---

## Step 6 — Verify

Open the frontend URL in a browser. You should see the login screen. Try:

- Register a new account → land on Home
- Login as a seeded user — except **the seed never ran on the live Atlas cluster from Render**, so the seeded `kashish@glauniversity.in` only exists if you already ran `npm run seed` locally against the same Atlas cluster (you did, earlier). So those creds still work.

If you want a fresh seed against this production setup, run from your local machine:

```bash
cd server
npm run seed
```

It hits the same Atlas cluster, so the data is immediately visible from the deployed frontend.

---

## Updating after the first deploy

Both services have `autoDeploy: true`. Push to the `main` branch → Render redeploys automatically. No further clicks needed.

```bash
git add .
git commit -m "Whatever you changed"
git push
```

Watch the deploy log on Render's dashboard if you're nervous.

---

## Common gotchas

| Symptom | Cause | Fix |
|---|---|---|
| Backend 503 right after a request | Free tier was asleep, woke on demand | Hit `/api/v1/health` once and wait ~30 s before using the UI |
| Browser console shows CORS error | `CORS_ORIGIN` doesn't match the live frontend URL | Re-check Step 4. Watch for `https` vs `http`, trailing slash, www vs apex |
| Login works but no events load | `VITE_API_BASE_URL` was wrong **at build time** — env vars are baked into the static bundle | Edit it in Render, click **Manual Deploy** → **Clear build cache and deploy** |
| Mongoose timeout / connection error | Atlas network rules blocking Render | See Step 5 |
| `npm ci` fails on Render | `package-lock.json` not in repo | `git add server/package-lock.json client/package-lock.json && git push` |

---

## Going production-grade later (optional)

These were intentionally not built for the college demo, but here's what you'd add for real traffic:

- Move to Render **Starter** tier ($7/mo per service) → no sleeping
- Buy a custom domain → add it to both services in Render's **Custom Domains** UI; Render auto-provisions a TLS cert
- Set up Render's PostHog/Sentry integrations for error tracking
- Add a paid Atlas tier with VPC peering or a dedicated static-IP Render plan, then narrow the Atlas network allowlist to Render's IP only

---

## TL;DR — the whole flow in one block

```bash
# 1. git
cd /home/priyanshu/Desktop/dev/kasso_major_project
git init
git add .
git ls-files | grep -E '\.env$' && echo "STOP — .env is being committed" || echo "ok, no .env files"
git commit -m "Initial commit"
git branch -M main
git remote add origin git@github.com:YOUR_USERNAME/cems.git
git push -u origin main

# 2. Render — UI only
#    Blueprint → Connect repo → Apply
#    Paste MONGO_URI from server/.env
#    Leave CORS_ORIGIN and VITE_API_BASE_URL as placeholders for now

# 3. After backend deploys
#    cems-frontend → Environment → VITE_API_BASE_URL = https://cems-backend.onrender.com/api/v1

# 4. After frontend deploys
#    cems-backend  → Environment → CORS_ORIGIN       = https://cems-frontend.onrender.com

# 5. Atlas Network Access → 0.0.0.0/0 (if not already)

# 6. Open the frontend URL, log in.
```
