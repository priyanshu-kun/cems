// Assets — inventory + reserve/release.
import { api } from "./client.js";

export async function listAssets() {
  const data = await api.get("/logistics/assets");
  return data.items || [];
}

export async function createAsset(payload) {
  return api.post("/logistics/assets", payload);
}

export async function reserveAsset(id, quantity) {
  return api.post(`/logistics/assets/${id}/reserve`, { quantity });
}

export async function releaseAsset(id, quantity) {
  return api.post(`/logistics/assets/${id}/release`, { quantity });
}
