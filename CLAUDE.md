# CLAUDE.md — Full-Stack Integration Spec
## Next.js 16 Frontend ↔ Spring Boot Backend ↔ GLM-4 Cloud AI

---

## Project Overview

This document guides Claude Code in integrating the existing Next.js 16+ (App Router) frontend with the Spring Boot backend. The backend handles JWT authentication, Spring Data JPA/PostgreSQL operations, and all GLM-4 AI API calls. The frontend communicates exclusively through REST endpoints.

**Current state:** The frontend has a working demo-mode auth (`src/lib/auth.ts`) with commented stubs for the Java backend. The integration task is to wire those stubs to the real backend.

---

## Architecture

```
Browser (Next.js 16 App Router — src/app/)
        │
        │  HTTP + Bearer JWT
        ▼
Spring Boot REST API (demo-fixed/)
        │
        ├── JWT Auth (Auth0 java-jwt 4.4.0)
        ├── Spring Data JPA / PostgreSQL (NOT JDBI)
        └── GLM-4 Cloud API (open.bigmodel.cn)
```

**Rule:** GLM API calls are made **only** from Spring Boot. Never call GLM from Next.js API routes or client components.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16.2.1, App Router, TypeScript, shadcn/ui, pnpm |
| Backend | Spring Boot 3.2.5, Java 17+ |
| Auth | **Auth0 java-jwt 4.4.0**, BCrypt password hashing |
| Database | **Spring Data JPA** + HikariCP + PostgreSQL |
| AI | GLM-4 via ZhipuAI Cloud REST API |
| Package manager | **pnpm only** — never npm or yarn |

---

## Directory Structure (actual)

```
project-root/
├── frontend/                          # javaprog/frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/                 # Protected route group
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── profile/page.tsx
│   │   │   │   ├── resume-builder/page.tsx
│   │   │   │   ├── certificates/page.tsx
│   │   │   │   ├── seminars/page.tsx
│   │   │   │   ├── file-manager/page.tsx
│   │   │   │   └── layout.tsx         # AppLayout wrapper
│   │   │   ├── page.tsx               # Login page
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx
│   │   │   │   ├── AppHeader.tsx
│   │   │   │   └── AppSidebar.tsx
│   │   │   └── ui/                    # shadcn/ui components (already installed)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useAppState.ts
│   │   └── lib/
│   │       ├── auth.ts                # ← WIRE THIS to backend
│   │       ├── storage.ts             # ← MIGRATE from sessionStorage to API calls
│   │       ├── demoFiles.ts           # ← MIGRATE to API
│   │       ├── resumeHistory.ts       # ← MIGRATE to API
│   │       └── utils.ts
│   ├── package.json
│   └── pnpm-lock.yaml
│
└── demo-fixed/                        # Spring Boot backend
    └── src/main/java/com/example/demo/
        ├── DemoApplication.java
        ├── TestController.java
        ├── auth/
        │   ├── controller/AuthController.java
        │   ├── dto/LoginRequest.java
        │   ├── dto/RegisterRequest.java
        │   ├── jwt/JwtFilter.java
        │   ├── jwt/JwtService.java
        │   └── service/AuthService.java
        ├── config/SecurityConfig.java
        └── user/
            ├── entity/User.java
            └── repository/UserRepository.java
```

---

## Environment Variables

### Backend — `application.properties`

```properties
spring.application.name=demo

# PostgreSQL
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/demo_db}
spring.datasource.username=${DB_USERNAME:javaproj}
spring.datasource.password=${DB_PASSWORD:Javaproj123}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA (Spring Data JPA — NOT JDBI)
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# JWT (Auth0 java-jwt — must be ≥32 chars for HMAC256)
jwt.secret=${JWT_SECRET:resume-builder-super-secret-key-32chars!}

# CORS
cors.allowed-origins=${CORS_ORIGINS:http://localhost:3000,http://localhost:5173}

# GLM-4 Cloud
glm.api-key=${GLM_API_KEY:your_zhipuai_api_key}
glm.model=glm-4
glm.api-url=https://open.bigmodel.cn/api/paas/v4/chat/completions

server.port=8080
```

### Frontend — `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

Never put `GLM_API_KEY` or DB credentials in frontend env vars.

---

## What Already Exists in the Backend

The following files are **already implemented** in `demo-fixed/`. Do NOT rewrite them — only extend them:

| File | Status | Notes |
|---|---|---|
| `SecurityConfig.java` | ✅ Done | CORS, CSRF disabled, JWT filter wired, `@EnableWebSecurity` |
| `JwtService.java` | ✅ Done | Auth0 java-jwt, subject = email, 24h expiry |
| `JwtFilter.java` | ✅ Done | Bearer extraction, loads User from DB, sets ROLE_USER |
| `AuthService.java` | ✅ Done | register + login with BCrypt |
| `AuthController.java` | ✅ Done | POST /register, POST /login, GET /me |
| `User.java` | ✅ Done | `@Entity`, id (BIGSERIAL), email, password, name |
| `UserRepository.java` | ✅ Done | `JpaRepository<User, Long>` + `findByEmail` |
| `pom.xml` | ✅ Done | Spring Boot 3.2.5, `com.auth0:java-jwt:4.4.0`, Spring Data JPA |

---

## What Needs to Be Built

### Backend — New Files to Add

#### 1. GLM Service (`ai/GlmService.java`)

```java
package com.example.demo.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class GlmService {

    @Value("${glm.api-key}")
    private String apiKey;

    @Value("${glm.api-url}")
    private String apiUrl;

    @Value("${glm.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user",   "content", userMessage)
            ),
            "temperature", 0.7,
            "max_tokens", 1024
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> choices =
            (List<Map<String, Object>>) response.getBody().get("choices");
        @SuppressWarnings("unchecked")
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }
}
```

#### 2. AI Controller (`ai/AiController.java`)

```java
package com.example.demo.ai;

import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private GlmService glmService;

    /**
     * POST /api/ai/profile-feedback
     * Returns AI suggestions to improve profile completeness.
     */
    @PostMapping("/profile-feedback")
    public ResponseEntity<Map<String, String>> profileFeedback(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, Object> profileData) {

        String systemPrompt =
            "You are a helpful assistant for an academic resume builder platform. " +
            "Provide concise, actionable suggestions.";

        String userMsg = String.format(
            "User: '%s' (%s). Profile data: %s. " +
            "Give 3 short bullet-point suggestions to improve their academic resume profile.",
            user.getName(), user.getEmail(),
            profileData != null ? profileData.toString() : "not provided"
        );

        String feedback = glmService.chat(systemPrompt, userMsg);
        return ResponseEntity.ok(Map.of("feedback", feedback));
    }

    /**
     * POST /api/ai/resume-tips
     * Returns AI tips for a specific resume section.
     */
    @PostMapping("/resume-tips")
    public ResponseEntity<Map<String, String>> resumeTips(
            @RequestBody Map<String, String> request) {

        String section = request.getOrDefault("section", "general");
        String content = request.getOrDefault("content", "");

        String tips = glmService.chat(
            "You are an expert academic resume coach.",
            String.format("Review this '%s' section: %s. Give 3 concise improvement tips.", section, content)
        );
        return ResponseEntity.ok(Map.of("tips", tips));
    }
}
```

---

## Frontend Integration — Wiring `src/lib/auth.ts`

The file already has backend stubs commented out. Replace the demo functions with real backend calls:

```typescript
// src/lib/auth.ts — backend-wired version

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
```

Then update `src/hooks/useAuth.ts`:
- Replace `demoLogin` → `backendLogin`
- Replace `demoLogout` → `backendLogout`

---

## Frontend — API Client (`src/lib/api.ts`) — CREATE THIS FILE

```typescript
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
```

---

## REST API Contract

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | ❌ | Register — returns `{ token, message }` |
| POST | `/api/auth/login` | ❌ | Login — returns `{ token, message }` |
| GET | `/api/auth/me` | ✅ Bearer | Returns `{ id, name, email }` |
| POST | `/api/ai/profile-feedback` | ✅ Bearer | GLM-4 profile completeness suggestions |
| POST | `/api/ai/resume-tips` | ✅ Bearer | GLM-4 per-section resume tips |

**Auth response shape:**
```json
{ "token": "eyJ...", "message": "Login successful" }
```

**Error response shape:**
```json
{ "error": "Invalid email or password" }
```

---

## GLM-4 Request Format Reference

GLM-4 is OpenAI-compatible. Model string is `glm-4`:

```
POST https://open.bigmodel.cn/api/paas/v4/chat/completions
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "model": "glm-4",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant." },
    { "role": "user",   "content": "User message here" }
  ],
  "temperature": 0.7,
  "max_tokens": 1024
}
```

Response path to content: `choices[0].message.content`

---

## Integration Checklist for Claude Code

### Phase 1 — Backend: Add GLM Layer
- [ ] Add `glm.api-key`, `glm.model`, `glm.api-url` to `application.properties`
- [ ] Create `src/main/java/com/example/demo/ai/GlmService.java`
- [ ] Create `src/main/java/com/example/demo/ai/AiController.java`
- [ ] Confirm `GET /api/auth/me` returns `{ id, name, email }` (already in `AuthController.java`)
- [ ] Run `./mvnw spring-boot:run` and test all endpoints with curl before touching frontend

### Phase 2 — Frontend: Wire Auth
- [ ] Create `src/lib/api.ts`
- [ ] Update `src/lib/auth.ts` — replace demo functions with backend functions
- [ ] Update `src/hooks/useAuth.ts` — call `backendLogin` / `backendLogout`
- [ ] Update `src/app/page.tsx` login form to use `backendLogin`
- [ ] Test full login → dashboard → token persists in `sessionStorage` as `rb_jwt_token`

### Phase 3 — Frontend: Wire AI Features
- [ ] In `src/app/(app)/dashboard/page.tsx`, add "Get AI Feedback" button
- [ ] Call `api.post('/api/ai/profile-feedback', state.profile)` on click
- [ ] Display feedback result in a card or dialog
- [ ] Optionally add `api.post('/api/ai/resume-tips', { section, content })` in resume builder

### Phase 4 — Validation
- [ ] Register → Login → Dashboard works end-to-end
- [ ] Expired/invalid JWT returns 401 → frontend clears session and redirects to `/`
- [ ] GLM-4 feedback displays correctly
- [ ] No CORS errors in browser DevTools Network tab
- [ ] `pnpm dev` (frontend) + `./mvnw spring-boot:run` (backend) both run simultaneously

---

## Common Pitfalls — Avoid These

| Problem | Fix |
|---|---|
| Confusing Auth0 `java-jwt` with JJWT | Use `JWT.create()` / `JWT.require()` — already correct in `JwtService.java` |
| Using JDBI patterns | This backend uses **Spring Data JPA** — use `@Entity`, `JpaRepository`, not `Jdbi` |
| GLM API key in frontend `.env.local` | All GLM calls must go through Spring Boot |
| CORS errors | Already configured in `SecurityConfig.java` — verify `cors.allowed-origins` includes `http://localhost:3000` |
| `localStorage` in Next.js SSR | The codebase uses `sessionStorage` — guard with `typeof window !== "undefined"` |
| Running `npm install` or `yarn` | **Always `pnpm add <package>`** in the frontend directory |
| Calling old demo auth functions | `demoLogin` → `backendLogin`, `demoLogout` → `backendLogout` |
| `@AuthenticationPrincipal User user` is null | `JwtFilter.java` already loads the full `User` entity via `userRepository.findByEmail()` — check filter is registered in `SecurityConfig` |
| Profile / resume data still in sessionStorage | Phase 2 only wires auth. Migrating `storage.ts` to API calls is a separate phase |

---

## Notes

- **Package manager:** `pnpm` exclusively. Never `npm` or `yarn`.
- **ORM:** Spring Data JPA (not JDBI). Entities in `user/entity/`, repositories in `user/repository/`.
- **JWT library:** Auth0 `java-jwt` 4.4.0 — `JWT.create()`, `Algorithm.HMAC256(secret)`.
- **GLM model string in properties:** `glm.model=glm-4`
- All new Spring Boot classes go in `src/main/java/com/example/demo/<feature>/`.
- All new frontend API calls go through `src/lib/api.ts` using `getAuthHeaders()`.
- When adding new AI features, always route through `GlmService` — never inline `RestTemplate` calls in controllers.
- The vanilla HTML pages in `javaprog/` (dashboard.html, profile.html, etc.) are the old frontend — ignore them. The active frontend is `javaprog/frontend/src/`.
