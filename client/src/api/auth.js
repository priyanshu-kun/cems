// Auth endpoints — mapped to /auth/* per the OpenAPI spec.
import { api, setTokens, clearTokens } from "./client.js";

export async function login({ email, password }) {
  const data = await api.post("/auth/login", { email, password }, { auth: false });
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
}

export async function register({ fullName, email, password, department, year, roles }) {
  const body = { fullName, email, password };
  if (department) body.department = department;
  if (year !== undefined && year !== null && year !== "") body.year = Number(year);
  if (roles && roles.length) body.roles = roles;
  const data = await api.post("/auth/register", body, { auth: false });
  setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
  return data.user;
}

export async function me() {
  const data = await api.get("/auth/me");
  return data.principal;
}

export function logout() {
  clearTokens();
}
