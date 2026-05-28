// Fetch wrapper for the CEMS backend.
// - Adds Authorization header from localStorage
// - Unwraps the { success, data, error } envelope
// - Transparently refreshes the access token on a 401 once per request
// - Throws ApiError with .code/.message/.status/.details for the UI to display

import config from "../config.js";

export class ApiError extends Error {
  constructor({ code, message, status, details }) {
    super(message || code || "Request failed");
    this.name = "ApiError";
    this.code = code || "INTERNAL";
    this.status = status || 0;
    this.details = details || null;
  }
}

// ---- token storage ----------------------------------------------------------
const tokenStore = {
  get access() { return localStorage.getItem(config.accessTokenKey) || null; },
  set access(v) {
    if (v) localStorage.setItem(config.accessTokenKey, v);
    else localStorage.removeItem(config.accessTokenKey);
  },
  get refresh() { return localStorage.getItem(config.refreshTokenKey) || null; },
  set refresh(v) {
    if (v) localStorage.setItem(config.refreshTokenKey, v);
    else localStorage.removeItem(config.refreshTokenKey);
  },
  clear() {
    localStorage.removeItem(config.accessTokenKey);
    localStorage.removeItem(config.refreshTokenKey);
  },
};

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken !== undefined) tokenStore.access = accessToken;
  if (refreshToken !== undefined) tokenStore.refresh = refreshToken;
}
export function clearTokens() { tokenStore.clear(); }
export function getAccessToken() { return tokenStore.access; }

// ---- refresh coordination ---------------------------------------------------
let refreshPromise = null;
async function refreshAccessToken() {
  if (!tokenStore.refresh) throw new ApiError({ code: "UNAUTHENTICATED", message: "No refresh token", status: 401 });
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const r = await rawFetch("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: tokenStore.refresh }),
        headers: { "Content-Type": "application/json" },
      }, /* withAuth */ false);
      const body = await readEnvelope(r);
      tokenStore.access = body.accessToken;
      tokenStore.refresh = body.refreshToken;
      return body.accessToken;
    })().catch((e) => {
      tokenStore.clear();
      throw e;
    }).finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

// ---- low-level fetch --------------------------------------------------------
async function rawFetch(path, opts = {}, withAuth = true) {
  const url = config.apiBaseUrl + path;
  const headers = new Headers(opts.headers || {});
  if (opts.body && !headers.has("Content-Type") && typeof opts.body === "string") {
    headers.set("Content-Type", "application/json");
  }
  headers.set("Accept", "application/json");
  if (withAuth) {
    const token = tokenStore.access;
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), config.requestTimeoutMs);
  let res;
  try {
    res = await fetch(url, { ...opts, headers, signal: ctrl.signal });
  } catch (e) {
    if (e.name === "AbortError") {
      throw new ApiError({ code: "TIMEOUT", message: "Request timed out", status: 0 });
    }
    throw new ApiError({ code: "NETWORK", message: "Network error — is the backend running?", status: 0 });
  } finally {
    clearTimeout(timer);
  }
  return res;
}

async function readEnvelope(res) {
  let body = null;
  try { body = await res.json(); } catch { /* non-json */ }
  if (!body || typeof body !== "object") {
    throw new ApiError({ code: "INTERNAL", message: `Unexpected response (HTTP ${res.status})`, status: res.status });
  }
  if (body.success === false || body.error) {
    const err = body.error || {};
    throw new ApiError({
      code: err.code || "INTERNAL",
      message: err.message || `Request failed (HTTP ${res.status})`,
      status: res.status,
      details: err.details || null,
    });
  }
  return body.data;
}

// ---- public request helper --------------------------------------------------
export async function request(path, { method = "GET", body, query, auth = true } = {}) {
  let qs = "";
  if (query) {
    const usp = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) v.forEach((x) => usp.append(k, String(x)));
      else usp.set(k, String(v));
    });
    const s = usp.toString();
    if (s) qs = "?" + s;
  }
  const init = {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  };

  let res = await rawFetch(path + qs, init, auth);

  // One-shot refresh on 401
  if (res.status === 401 && auth && tokenStore.refresh && path !== "/auth/refresh") {
    try {
      await refreshAccessToken();
      res = await rawFetch(path + qs, init, true);
    } catch {
      // fall through to throw with original 401 below
    }
  }

  return readEnvelope(res);
}

// Like request(), but returns the full { success, data, error } envelope
// without throwing on success:false. Used for endpoints where success:false
// carries meaningful data (e.g. POST /logistics/gate-pass/verify).
export async function requestEnvelope(path, opts = {}) {
  const { method = "GET", body, query, auth = true } = opts;
  let qs = "";
  if (query) {
    const usp = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) v.forEach((x) => usp.append(k, String(x)));
      else usp.set(k, String(v));
    });
    const s = usp.toString();
    if (s) qs = "?" + s;
  }
  const init = { method, body: body === undefined ? undefined : JSON.stringify(body) };
  let res = await rawFetch(path + qs, init, auth);
  if (res.status === 401 && auth && tokenStore.refresh && path !== "/auth/refresh") {
    try { await refreshAccessToken(); res = await rawFetch(path + qs, init, true); }
    catch { /* fall through */ }
  }
  let envelope = null;
  try { envelope = await res.json(); } catch { /* ignore */ }
  if (!envelope || typeof envelope !== "object") {
    throw new ApiError({ code: "INTERNAL", message: `Unexpected response (HTTP ${res.status})`, status: res.status });
  }
  // Only the "verify" semantics: 2xx with success:false + data populated is OK.
  // Real 4xx/5xx still throws.
  if (res.status >= 400 && (envelope.error || envelope.success === false)) {
    const err = envelope.error || {};
    throw new ApiError({
      code: err.code || "INTERNAL",
      message: err.message || `Request failed (HTTP ${res.status})`,
      status: res.status,
      details: err.details || null,
    });
  }
  return envelope;
}

// ---- convenience verbs ------------------------------------------------------
export const api = {
  get: (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
  patch: (path, body, opts) => request(path, { ...opts, method: "PATCH", body }),
  put: (path, body, opts) => request(path, { ...opts, method: "PUT", body }),
  del: (path, opts) => request(path, { ...opts, method: "DELETE" }),
};
