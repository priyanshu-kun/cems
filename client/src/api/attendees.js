// Event attendees — organizer/admin add students & guests to an event.
import { api } from "./client.js";

export async function listAttendees(eventId) {
  return api.get(`/events/${eventId}/attendees`); // { items, total, students, guests, checkedIn }
}

export async function addStudent(eventId, userId) {
  return api.post(`/events/${eventId}/attendees/students`, { userId });
}

export async function removeStudent(eventId, userId) {
  return api.del(`/events/${eventId}/attendees/students/${userId}`);
}

export async function addGuest(eventId, guestId) {
  return api.post(`/events/${eventId}/attendees/guests`, { guestId });
}

export async function removeGuest(eventId, guestId) {
  return api.del(`/events/${eventId}/attendees/guests/${guestId}`);
}
