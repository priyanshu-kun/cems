// Per-user local cache of RSVPs and gate passes.
// The backend exposes /events/{id}/rsvp (POST/DELETE) and /logistics/gate-pass (POST)
// but no list-mine endpoints, so we mirror what we know on the client.

import { useCallback, useEffect, useState } from "react";
import config from "../config.js";
import { useAuth } from "../context/AuthContext.jsx";

function key(base, userId) { return `${base}.${userId || "anon"}`; }

function readJSON(k, fallback) {
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : fallback; }
  catch { return fallback; }
}
function writeJSON(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

export function useRsvps() {
  const { user } = useAuth();
  const k = key(config.rsvpsKey, user?._id);
  const [set, setSet] = useState(() => new Set(readJSON(k, [])));

  useEffect(() => {
    setSet(new Set(readJSON(k, [])));
  }, [k]);

  const persist = useCallback((s) => { writeJSON(k, Array.from(s)); }, [k]);

  const has = useCallback((eventId) => set.has(eventId), [set]);
  const add = useCallback((eventId) => {
    setSet((prev) => { const n = new Set(prev); n.add(eventId); persist(n); return n; });
  }, [persist]);
  const remove = useCallback((eventId) => {
    setSet((prev) => { const n = new Set(prev); n.delete(eventId); persist(n); return n; });
  }, [persist]);

  return { ids: Array.from(set), has, add, remove };
}

export function usePasses() {
  const { user } = useAuth();
  const k = key(config.passesKey, user?._id);
  const [map, setMap] = useState(() => readJSON(k, {}));

  useEffect(() => { setMap(readJSON(k, {})); }, [k]);

  const persist = useCallback((m) => { writeJSON(k, m); }, [k]);

  const put = useCallback((eventId, payload) => {
    setMap((prev) => { const n = { ...prev, [eventId]: payload }; persist(n); return n; });
  }, [persist]);
  const remove = useCallback((eventId) => {
    setMap((prev) => { const n = { ...prev }; delete n[eventId]; persist(n); return n; });
  }, [persist]);

  return { byEventId: map, put, remove };
}
