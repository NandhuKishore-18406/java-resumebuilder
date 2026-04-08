// ── DEMO CREDENTIALS (hardcoded for testing) ─────────────────────────────────
export const DEMO_USER = {
  email: "demo@resumebuilder.com",
  password: "demo123",
  name: "Demo User",
  id: "demo-user-001",
};

export type AuthUser = { email: string; name: string; id: string };

export function getSessionUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem("rb_auth_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function setSessionUser(user: AuthUser) {
  sessionStorage.setItem("rb_auth_user", JSON.stringify(user));
}
export function clearSessionUser() {
  sessionStorage.removeItem("rb_auth_user");
}
export function demoLogin(
  email: string,
  password: string
): { user: AuthUser | null; error: string | null } {
  if (
    email.trim().toLowerCase() === DEMO_USER.email &&
    password === DEMO_USER.password
  ) {
    const user: AuthUser = {
      email: DEMO_USER.email,
      name: DEMO_USER.name,
      id: DEMO_USER.id,
    };
    setSessionUser(user);
    return { user, error: null };
  }
  return { user: null, error: "Invalid email or password." };
}
export function demoLogout() {
  clearSessionUser();
}

/*
 * ── JAVA BACKEND INTEGRATION (uncomment when ready) ──────────────────────────
 *
 * POST /api/auth/login
 *   Body: { email, password }
 *   Returns: { token: string, user: { id, email, name } }
 *   JWT signed with java-jwt (com.auth0:java-jwt).
 *   Store token in sessionStorage as "rb_jwt_token".
 *
 * export async function backendLogin(email: string, password: string) {
 *   const res = await fetch("/api/auth/login", {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify({ email, password }),
 *   });
 *   const data = await res.json();
 *   if (!res.ok) return { user: null, error: data.message };
 *   sessionStorage.setItem("rb_jwt_token", data.token);
 *   setSessionUser(data.user);
 *   return { user: data.user, error: null };
 * }
 *
 * export function getAuthHeaders() {
 *   const token = sessionStorage.getItem("rb_jwt_token");
 *   return token ? { Authorization: `Bearer ${token}` } : {};
 * }
 *
 * export async function backendLogout() {
 *   await fetch("/api/auth/logout", {
 *     method: "POST",
 *     headers: getAuthHeaders(),
 *   });
 *   clearSessionUser();
 *   sessionStorage.removeItem("rb_jwt_token");
 * }
 * ─────────────────────────────────────────────────────────────────────────────
 */