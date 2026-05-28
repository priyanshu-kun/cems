// Events + RSVP endpoints.
import { api } from "./client.js";

export async function listEvents({ status, venueId, from, to, limit, skip } = {}) {
  const data = await api.get("/events", { query: { status, venueId, from, to, limit, skip } });
  return data; // { items, total, limit, skip }
}

export async function getEvent(id) {
  return api.get(`/events/${id}`);
}

export async function createEvent(payload) {
  return api.post("/events", payload);
}

export async function setEventStatus(id, status) {
  return api.patch(`/events/${id}/status`, { status });
}

export async function rsvp(eventId) {
  return api.post(`/events/${eventId}/rsvp`);
}

export async function cancelRsvp(eventId) {
  return api.del(`/events/${eventId}/rsvp`);
}
