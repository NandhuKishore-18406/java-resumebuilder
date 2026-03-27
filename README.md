# Auth + User + File Management System

Single-file Java backend. No Spring Boot, no Supabase, no Firebase.
Built with the JDK built-in HTTP server, JJWT, JDBC + HikariCP, PostgreSQL, and Gson.

---

## Quick Start

### 1. Prerequisites
- Java 17+
- PostgreSQL running locally (or a remote instance)
- `curl` (for setup.sh to download jars)

### 2. Create the database
```sql
CREATE DATABASE authdb;
```
Tables are created **automatically** on first run.

### 3. Configure Main.java
Open `Main.java` and change the four constants near the top:

```java
private static final String DB_URL      = "jdbc:postgresql://localhost:5432/authdb";
private static final String DB_USER     = "postgres";
private static final String DB_PASSWORD = "your_password";
private static final String JWT_SECRET  = "at_least_32_characters_random_here!!";
```

### 4. Build and run
```bash
chmod +x setup.sh
./setup.sh          # downloads jars, compiles
java -cp 'lib/*:.' Main
```

Server starts on **http://localhost:8080**

Static files are served from `./public/` — put your HTML pages there.

---

## Project Structure

```
.
├── Main.java          ← entire backend (one file)
├── setup.sh           ← download deps + compile
├── lib/               ← jars (auto-downloaded by setup.sh)
├── uploads/           ← uploaded files (auto-created)
└── public/            ← your HTML pages (index.html etc.)
    ├── index.html
    ├── dashboard.html
    └── ...
```

---

## API Reference

All endpoints return JSON. Protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Auth  `/api/auth`

| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | `{email, password, full_name}` | Register new user |
| POST | `/api/auth/login` | `{email, password}` | Login, get tokens |
| POST | `/api/auth/refresh` | `{refresh_token}` | Get new access token |
| POST | `/api/auth/logout` | `{refresh_token?}` | Logout (omit to logout everywhere) |
| GET  | `/api/auth/me` | — | Get current user info |

**Register response:**
```json
{
  "message": "Registration successful",
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": 1, "email": "...", "full_name": "...", "role": "user" }
}
```

**Login response:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "user": { "id": 1, "email": "...", "full_name": "...", "role": "user" }
}
```

---

### Users  `/api/users`  🔒

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET    | `/api/users/profile` | — | Own profile |
| PUT    | `/api/users/profile` | `{full_name?, email?, password?, current_password?}` | Update profile |
| DELETE | `/api/users/profile` | `{password}` | Delete own account |

---

### Files  `/api/files`  🔒

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET    | `/api/files` | — | List own files |
| POST   | `/api/files/upload` | `multipart/form-data` field `file` | Upload file (max 50 MB) |
| GET    | `/api/files/{id}/download` | — | Download file |
| DELETE | `/api/files/{id}` | — | Delete file |

**List files response:**
```json
{
  "files": [
    { "id": 1, "original_name": "doc.pdf", "mime_type": "application/pdf", "file_size": 204800, "created_at": "..." }
  ],
  "count": 1
}
```

---

### Admin  `/api/admin`  🔒🛡 (role=admin only)

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET    | `/api/admin/users` | `?page=1&limit=20` | List all users (paginated) |
| GET    | `/api/admin/users/{id}` | — | Get one user + file count |
| POST   | `/api/admin/users/{id}/ban` | — | Ban user + invalidate tokens |
| POST   | `/api/admin/users/{id}/unban` | — | Unban user |
| PUT    | `/api/admin/users/{id}/role` | `{role: "user"|"admin"}` | Change role |
| DELETE | `/api/admin/users/{id}` | — | Delete user + their files |
| GET    | `/api/admin/files` | `?page=1&limit=20` | List all files with owner |

---

## Integrating with your HTML pages

Replace `firebase-auth.js` with this small JS client:

```javascript
// rb-auth.js  —  client for Main.java backend
const API = 'http://localhost:8080/api';

const rbAuth = {
  // ── state ──
  getTokens() {
    return {
      access:  sessionStorage.getItem('rb_access'),
      refresh: localStorage.getItem('rb_refresh')
    };
  },
  saveTokens(access, refresh) {
    sessionStorage.setItem('rb_access', access);
    if (refresh) localStorage.setItem('rb_refresh', refresh);
  },
  clearTokens() {
    sessionStorage.removeItem('rb_access');
    localStorage.removeItem('rb_refresh');
  },

  // ── auth guard (call on every protected page) ──
  async requireAuth() {
    let { access } = this.getTokens();
    if (!access) return this._redirectLogin();

    // Try /me — if 401, try refresh
    const r = await fetch(`${API}/auth/me`, {
      headers: { Authorization: 'Bearer ' + access }
    });
    if (r.ok) return await r.json();

    // Attempt token refresh
    const refreshed = await this.refreshTokens();
    if (!refreshed) return this._redirectLogin();

    const r2 = await fetch(`${API}/auth/me`, {
      headers: { Authorization: 'Bearer ' + this.getTokens().access }
    });
    if (r2.ok) return await r2.json();
    return this._redirectLogin();
  },

  async refreshTokens() {
    const { refresh } = this.getTokens();
    if (!refresh) return false;
    const r = await fetch(`${API}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh })
    });
    if (!r.ok) { this.clearTokens(); return false; }
    const d = await r.json();
    this.saveTokens(d.access_token, d.refresh_token);
    return true;
  },

  // ── login / register ──
  async loginWithEmail(email, password) {
    const r = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    if (!r.ok) return { user: null, error: { message: d.error } };
    this.saveTokens(d.access_token, d.refresh_token);
    return { user: d.user, error: null };
  },

  async signupWithEmail(email, password, firstName, lastName) {
    const r = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: `${firstName} ${lastName}`.trim() })
    });
    const d = await r.json();
    if (!r.ok) return { user: null, error: { message: d.error } };
    this.saveTokens(d.access_token, d.refresh_token);
    return { user: d.user, error: null };
  },

  async logout() {
    const { access, refresh } = this.getTokens();
    try {
      await fetch(`${API}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + access },
        body: JSON.stringify({ refresh_token: refresh })
      });
    } catch (e) {}
    this.clearTokens();
    return { error: null };
  },

  // ── user ──
  async getCurrentUser() {
    const { access } = this.getTokens();
    if (!access) return null;
    const r = await fetch(`${API}/auth/me`, {
      headers: { Authorization: 'Bearer ' + access }
    });
    if (!r.ok) return null;
    const user = await r.json();
    // Shape it like the old firebase-auth.js object
    user.uid = String(user.id);
    user.user_metadata = { full_name: user.full_name, first_name: user.full_name?.split(' ')[0] || '', last_name: '' };
    return user;
  },

  onAuthChange(callback) {
    this.getCurrentUser().then(callback);
  },

  // ── files ──
  async uploadFile(file, onProgress) {
    const { access } = this.getTokens();
    const fd = new FormData();
    fd.append('file', file);
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API}/files/upload`);
      xhr.setRequestHeader('Authorization', 'Bearer ' + access);
      if (onProgress) xhr.upload.onprogress = e => onProgress(e.loaded / e.total);
      xhr.onload = () => resolve(JSON.parse(xhr.responseText));
      xhr.onerror = () => resolve({ error: 'Upload failed' });
      xhr.send(fd);
    });
  },

  async listFiles() {
    const { access } = this.getTokens();
    const r = await fetch(`${API}/files`, { headers: { Authorization: 'Bearer ' + access } });
    return r.json();
  },

  downloadFileUrl(fileId) {
    const { access } = this.getTokens();
    // Returns a URL you can set as href or call fetch on
    return `${API}/files/${fileId}/download?token=${access}`;
  },

  async deleteFile(fileId) {
    const { access } = this.getTokens();
    const r = await fetch(`${API}/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + access }
    });
    return r.json();
  },

  isTestSession() { return false; },
  TEST_EMAIL:    'test@demo.com',
  TEST_PASSWORD: 'test123',

  _redirectLogin() { window.location.href = 'index.html'; return null; }
};
```

Then in each HTML page, replace:
```html
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
<script src="firebase-auth.js"></script>
```
with:
```html
<script src="rb-auth.js"></script>
```

The `rbAuth` API is identical — `loginWithEmail`, `signupWithEmail`, `logout`, `getCurrentUser`, `onAuthChange` — so your existing HTML pages need **zero other changes**.

---

## Making the First Admin

After running the server and registering, promote yourself manually in psql:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Token Strategy

| Token | Lifetime | Stored | Purpose |
|-------|----------|--------|---------|
| Access | 15 min | sessionStorage | API requests |
| Refresh | 7 days | localStorage | Get new access token |

Refresh tokens are rotated on each use (old one deleted, new one issued).
Banning a user immediately deletes all their refresh tokens.

---

## Security Notes

- Passwords are SHA-256 + random salt. To upgrade to BCrypt, add `bcrypt-5.1.1.jar` and replace the `Password` class.
- JWT secret must be 32+ characters. Use a random generator, not a word.
- `UPLOAD_DIR` defaults to `./uploads/` — change to an absolute path in production.
- The static handler rejects any path containing `..` to prevent path traversal.
- CORS is open (`*`) for development. Restrict to your domain in production by changing `corsHeaders()`.
