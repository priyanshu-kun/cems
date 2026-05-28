// Guests — college-wide registry of external attendees (admin + organizer).
import { api } from "./client.js";

export async function listGuests({ search, limit, skip } = {}) {
  return api.get("/guests", { query: { search, limit, skip } }); // { items, total, limit, skip }
}

export async function createGuest(payload) {
  return api.post("/guests", payload);
}

export async function updateGuest(id, payload) {
  return api.patch(`/guests/${id}`, payload);
}

export async function deleteGuest(id) {
  return api.del(`/guests/${id}`);
}
