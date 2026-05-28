// Venues — read by everyone (event-create dropdown), managed by admins.
import { api } from "./client.js";

export async function listVenues({ includeInactive = false } = {}) {
  const data = await api.get("/venues", {
    query: includeInactive ? { includeInactive: "true" } : {},
  });
  return data.items || [];
}

export async function createVenue(payload) {
  return api.post("/venues", payload);
}

export async function updateVenue(id, payload) {
  return api.patch(`/venues/${id}`, payload);
}

export async function deactivateVenue(id) {
  return api.del(`/venues/${id}`);
}
