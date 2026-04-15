import { getAuthHeaders } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL;

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? err.message ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  get:    <T>(path: string) =>
    apiFetch<T>(path),
  post:   <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put:    <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "PUT",  body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: "DELETE" }),
};