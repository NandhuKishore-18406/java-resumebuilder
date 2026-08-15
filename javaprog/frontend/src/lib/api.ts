import { getAuthHeaders } from "./auth";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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

  if (res.status === 204) {
    return null as unknown as T;
  }

  const text = await res.text();
  if (!text || text.trim() === "") {
    return null as unknown as T;
  }

  return JSON.parse(text);
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