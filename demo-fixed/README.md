# Resume Builder — Backend Fix

## Root Causes of 403 Forbidden Errors

### Bug 1 — `pom.xml`: Non-existent Spring Boot version & broken dependencies
- `spring-boot-starter-parent` version `4.0.5` **does not exist** (latest is `3.2.x`). Maven fails to download it, so the app can't even build.
- `spring-boot-starter-webmvc` is not a valid standalone starter — correct artifact is `spring-boot-starter-web`.
- Test dependencies like `spring-boot-starter-data-jpa-test` don't exist and break the build.

**Fix:** Changed parent to `3.2.5`, replaced `webmvc` → `web`, cleaned up test deps.

---

### Bug 2 — `SecurityConfig.java`: Missing `@EnableWebSecurity` and no CORS
- Without `@EnableWebSecurity`, the security filter chain may not be fully applied or recognized.
- No `CorsConfigurationSource` bean was wired. Spring Security intercepts all requests **before** they reach controllers. `@CrossOrigin` on controllers does nothing when Security is active. Every browser preflight `OPTIONS` request returned 403.

**Fix:** Added `@EnableWebSecurity`, added `CorsConfigurationSource` bean wired into `HttpSecurity` via `.cors(...)`.

---

### Bug 3 — `JwtService.java`: Token subject was user ID, token had no expiry
- `withSubject(user.getId().toString())` — the subject was a numeric ID string. The filter tried to use this to reload the user, requiring a `findById()` that was never written.
- No `.withExpiresAt(...)` — tokens never expired, which is a security risk and can cause library validation warnings.

**Fix:** Changed subject to `user.getEmail()` (matches `UserRepository.findByEmail()`), added 24-hour expiry.

---

### Bug 4 — `JwtFilter.java`: Authentication set with empty authorities
- `List.of()` was passed as the authorities list. Spring Security treats a principal with no authorities as unauthenticated for role-based checks, causing silent 403s on protected routes.
- The filter never reloaded the User entity from DB, so `@AuthenticationPrincipal User user` injection in controllers always returned `null`.

**Fix:** Loaded `User` from DB using `userRepository.findByEmail(subject)`, set `ROLE_USER` authority.

---

### Bug 5 — `AuthController.java` / `AuthService.java`: No register endpoint
- There was only a `/login` endpoint. No way to create users from the frontend, so every login attempt would fail with "User not found".

**Fix:** Added `POST /api/auth/register` endpoint + `AuthService.register()` method.

---

### Bug 6 — `application.properties`: JWT secret too short
- Default `jwt.secret=dev-secret` is only 10 characters. Auth0's HMAC256 requires the secret to be at least 32 bytes. This throws a `WeakKeyException` at startup, preventing the app from starting at all.

**Fix:** Changed default to a 40-character string. Always override with `JWT_SECRET` env var in production.

---

## Files Changed

| File | Changes |
|------|---------|
| `pom.xml` | Fixed Spring Boot version (`4.0.5` → `3.2.5`), fixed `webmvc` → `web`, removed non-existent test deps |
| `config/SecurityConfig.java` | Added `@EnableWebSecurity`, added `CorsConfigurationSource` bean |
| `auth/jwt/JwtService.java` | Subject changed to email, added 24h token expiry |
| `auth/jwt/JwtFilter.java` | Loads User from DB, sets `ROLE_USER` authority, proper null checks |
| `auth/service/AuthService.java` | Added `register()` method |
| `auth/controller/AuthController.java` | Added `POST /register`, `GET /me` endpoints, proper HTTP status codes |
| `auth/dto/RegisterRequest.java` | **New file** — register request DTO with validation |
| `auth/dto/LoginRequest.java` | Added `@Email`, `@NotBlank` validation |
| `user/entity/User.java` | Added `name` field, `@GeneratedValue(strategy=IDENTITY)`, `@Column` constraints |
| `resources/application.properties` | Fixed JWT secret length, added CORS config, env var overrides |

---

## Authentication Flow

```
POST /api/auth/register
  Body: { "name": "John", "email": "john@example.com", "password": "secret" }
  → AuthController → AuthService.register()
  → Checks email not already taken
  → BCrypt hashes password → saves User to PostgreSQL
  → JwtService.generateToken() — subject = email, expires in 24h
  Response 201: { "token": "eyJ...", "message": "Registration successful" }

POST /api/auth/login
  Body: { "email": "john@example.com", "password": "secret" }
  → AuthController → AuthService.login()
  → Loads user by email → BCrypt.matches(rawPassword, hashedPassword)
  → JwtService.generateToken()
  Response 200: { "token": "eyJ...", "message": "Login successful" }

GET /api/resumes  (or any protected route)
  Header: Authorization: Bearer eyJ...
  → JwtFilter.doFilterInternal()
  → Strips "Bearer ", calls JwtService.validateToken()
  → Extracts subject (email) → UserRepository.findByEmail()
  → Sets UsernamePasswordAuthenticationToken in SecurityContext
  → Request proceeds to controller
  Response 200: your data
```

---

## How to Run

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 14+ with a database named `demo_db`

### 1. Create the database
```sql
CREATE DATABASE demo_db;
CREATE USER javaproj WITH PASSWORD 'Javaproj123';
GRANT ALL PRIVILEGES ON DATABASE demo_db TO javaproj;
```
(JPA with `ddl-auto=update` will auto-create the `users` table on first run.)

### 2. Run
```bash
cd demo
./mvnw clean spring-boot:run
```

Or with custom env vars:
```bash
DB_URL=jdbc:postgresql://localhost:5432/demo_db \
DB_USERNAME=javaproj \
DB_PASSWORD=Javaproj123 \
JWT_SECRET=your-very-long-secret-at-least-32-chars \
CORS_ORIGINS=http://localhost:3000 \
./mvnw spring-boot:run
```

### 3. Test
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"secret123"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'

# Protected route (paste token from above)
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer <token>"
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:postgresql://localhost:5432/demo_db` | PostgreSQL JDBC URL |
| `DB_USERNAME` | `javaproj` | DB username |
| `DB_PASSWORD` | `Javaproj123` | DB password |
| `JWT_SECRET` | `resume-builder-super-secret-key-32chars!` | HMAC256 signing key (≥32 chars) |
| `CORS_ORIGINS` | `http://localhost:3000,...` | Comma-separated frontend origins |

> ⚠️ Always set `JWT_SECRET` to a strong random value in production. Never commit it to Git.
