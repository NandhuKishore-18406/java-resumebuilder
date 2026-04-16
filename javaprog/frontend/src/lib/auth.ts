const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

export type AuthUser = { email: string; name: string; id: string };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("rb_jwt_token");
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function getSessionUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem("rb_auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export async function backendLogin(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { user: null, error: data.error || "Login failed" };

    sessionStorage.setItem("rb_jwt_token", data.token);
    const user: AuthUser = { email, name: email.split("@")[0], id: email };
    sessionStorage.setItem("rb_auth_user", JSON.stringify(user));
    return { user, error: null };
  } catch {
    return { user: null, error: "Network error — is the backend running on port 8080?" };
  }
}

export async function backendRegister(
  email: string,
  password: string,
  name: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const res = await fetch(`${API_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) return { user: null, error: data.error || "Registration failed" };

    sessionStorage.setItem("rb_jwt_token", data.token);
    const user: AuthUser = { email, name, id: email };
    sessionStorage.setItem("rb_auth_user", JSON.stringify(user));
    return { user, error: null };
  } catch {
    return { user: null, error: "Network error — is the backend running on port 8080?" };
  }
}

export function backendLogout(): void {
  sessionStorage.removeItem("rb_jwt_token");
  sessionStorage.removeItem("rb_auth_user");
}