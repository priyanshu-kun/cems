// Guests — external attendees managed per event by the organizer or an admin.
import { api } from "./client.js";

export async function listGuests(eventId) {
  return api.get(`/events/${eventId}/guests`); // { items, total, checkedIn }
}

export async function addGuest(eventId, payload) {
  return api.post(`/events/${eventId}/guests`, payload);
}

export async function updateGuest(eventId, guestId, payload) {
  return api.patch(`/events/${eventId}/guests/${guestId}`, payload);
}

export async function checkInGuest(eventId, guestId) {
  return api.patch(`/events/${eventId}/guests/${guestId}`, { status: "CHECKED_IN" });
}

export async function removeGuest(eventId, guestId) {
  return api.del(`/events/${eventId}/guests/${guestId}`);
}
