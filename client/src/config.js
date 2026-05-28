// Reads VITE_* env vars and normalizes them for use throughout the app.
// Anything the user can change without touching code lives here.

const env = import.meta.env;

function csv(value, fallback = []) {
  if (!value) return fallback;
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const config = {
  apiBaseUrl: (env.VITE_API_BASE_URL || "http://localhost:4000/api/v1").replace(/\/$/, ""),
  appName: env.VITE_APP_NAME || "CEMS",
  appTagline: env.VITE_APP_TAGLINE || "College Event Management System",
  collegeName: env.VITE_COLLEGE_NAME || "Your College",
  brandInitial: env.VITE_BRAND_INITIAL || "C",

  accessTokenKey: env.VITE_ACCESS_TOKEN_KEY || "cems.access_token",
  refreshTokenKey: env.VITE_REFRESH_TOKEN_KEY || "cems.refresh_token",
  userKey: env.VITE_USER_KEY || "cems.user",
  rsvpsKey: env.VITE_RSVPS_KEY || "cems.rsvps",
  passesKey: env.VITE_PASSES_KEY || "cems.passes",

  requestTimeoutMs: Number(env.VITE_REQUEST_TIMEOUT_MS || 15000),
  pageSize: Number(env.VITE_PAGE_SIZE || 20),

  departments: csv(env.VITE_DEPARTMENTS, ["CSE", "ECE", "ME", "CE", "EEE", "IT", "AIML", "MBA"]),
  years: csv(env.VITE_YEARS, ["1", "2", "3", "4", "5"]),
  assetCategories: csv(env.VITE_ASSET_CATEGORIES, [
    "PROJECTOR", "MICROPHONE", "SPEAKER", "CHAIR", "TABLE", "OTHER",
  ]),
  // Venues are no longer configured here — they are fetched live from
  // GET /venues (see src/api/venues.js).
};

export default config;
