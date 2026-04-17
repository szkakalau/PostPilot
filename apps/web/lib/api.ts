const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("postpilot_token");
}

export function setToken(token: string) {
  localStorage.setItem("postpilot_token", token);
}

export function clearToken() {
  localStorage.removeItem("postpilot_token");
}

export async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.error === "string" ? data.error : res.statusText;
    throw new Error(msg || "Request failed");
  }
  return data;
}

export { API };
