// Marketing — announcements + audience-filtered feed.
import { api } from "./client.js";

export async function feed({ limit, skip } = {}) {
  const data = await api.get("/marketing/feed", { query: { limit, skip } });
  return data; // { items, total, limit, skip }
}

export async function createAnnouncement(payload) {
  return api.post("/marketing/announcements", payload);
}
