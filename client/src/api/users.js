// Users / student directory — admins manage roles & activation; organizers can view.
import { api } from "./client.js";

export async function listUsers({ role, department, year, search, isActive, limit, skip } = {}) {
  const query = { role, department, year, search, limit, skip };
  if (isActive !== undefined) query.isActive = isActive ? "true" : "false";
  return api.get("/users", { query }); // { items, total, limit, skip }
}

export async function getUser(id) {
  return api.get(`/users/${id}`);
}

export async function setUserRoles(id, roles) {
  return api.patch(`/users/${id}/roles`, { roles });
}

export async function setUserStatus(id, isActive) {
  return api.patch(`/users/${id}/status`, { isActive });
}
