/*
 * ═══════════════════════════════════════════════════════════════════
 *  Main.java  —  Auth + User + File Management System
 *  Single-file Java backend. No Spring, no Supabase, no Firebase.
 *
 *  Stack:
 *    • JDK built-in com.sun.net.httpserver  (HTTP server)
 *    • JJWT 0.12.x                          (JWT sign / verify)
 *    • PostgreSQL JDBC driver               (database)
 *    • HikariCP                             (connection pool)
 *    • Gson                                 (JSON)
 *
 *  ⚠️  ACTION REQUIRED — update the four constants below:
 *      DB_URL, DB_USER, DB_PASSWORD, JWT_SECRET
 *
 *  Build & run (after placing jars in ./lib/):
 *    javac -cp "lib/*" Main.java
 *    java  -cp "lib/*:." Main
 *
 *  Required jars (download once, put in ./lib/):
 *    postgresql-42.7.3.jar
 *    HikariCP-5.1.0.jar
 *    slf4j-api-2.0.13.jar      (HikariCP logging)
 *    slf4j-simple-2.0.13.jar
 *    jjwt-api-0.12.6.jar
 *    jjwt-impl-0.12.6.jar
 *    jjwt-jackson-0.12.6.jar   (JJWT uses jackson internally)
 *    jackson-databind-2.17.1.jar
 *    jackson-core-2.17.1.jar
 *    jackson-annotations-2.17.1.jar
 *    gson-2.11.0.jar
 *
 *  Database tables are created automatically on first run.
 * ═══════════════════════════════════════════════════════════════════
 */

import com.google.gson.*;
import com.sun.net.httpserver.*;
import com.zaxxer.hikari.*;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.sql.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;
import javax.crypto.SecretKey;
 
public class Main {

    // ────────────────────────────────────────────────────────────
    // ⚠️  CONFIGURATION — change these before running
    // ────────────────────────────────────────────────────────────
    private static final int    PORT         = 8080;
    private static final String DB_URL       = "jdbc:postgresql://localhost:5432/authdb"; // ← YOUR DB
    private static final String DB_USER      = "postgres";                                 // ← YOUR USER
    private static final String DB_PASSWORD  = "Nandhu1218";                                 // ← YOUR PASSWORD
    private static final String JWT_SECRET   = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_KEY_MIN32CHARS"; // ← 32+ chars
    private static final long   JWT_ACCESS_EXPIRY_MINUTES  = 15;
    private static final long   JWT_REFRESH_EXPIRY_DAYS    = 7;
    private static final String UPLOAD_DIR   = "./uploads";
    private static final long   MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
    // ────────────────────────────────────────────────────────────

    // Singletons shared across all handlers
    static HikariDataSource pool;
    static JwtUtil          jwt;
    static Gson             gson = new GsonBuilder().setPrettyPrinting().create();

    public static void main(String[] args) throws Exception {
        // 1. Create upload directory
        Files.createDirectories(Paths.get(UPLOAD_DIR));

        // 2. Init connection pool
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl(DB_URL);
        cfg.setUsername(DB_USER);
        cfg.setPassword(DB_PASSWORD);
        cfg.setMaximumPoolSize(10);
        cfg.setMinimumIdle(2);
        cfg.setConnectionTimeout(30_000);
        cfg.setIdleTimeout(600_000);
        pool = new HikariDataSource(cfg);

        // 3. Init JWT util
        jwt = new JwtUtil(JWT_SECRET, JWT_ACCESS_EXPIRY_MINUTES, JWT_REFRESH_EXPIRY_DAYS);

        // 4. Create tables
        Schema.createTables(pool);

        // 5. Start HTTP server
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/api/auth",    new AuthHandler());
        server.createContext("/api/users",   new UserHandler());
        server.createContext("/api/files",   new FileHandler());
        server.createContext("/api/admin",   new AdminHandler());
        // Serve static HTML files from ./public/
        server.createContext("/", new StaticHandler());
        server.setExecutor(Executors.newFixedThreadPool(20));
        server.start();
        System.out.println("✓ Server running on http://localhost:" + PORT);
        System.out.println("  Uploads directory : " + Paths.get(UPLOAD_DIR).toAbsolutePath());
    }

    // ════════════════════════════════════════════════════════════
    //  SCHEMA
    // ════════════════════════════════════════════════════════════
    static class Schema {
        static void createTables(HikariDataSource pool) throws Exception {
            try (Connection c = pool.getConnection(); Statement s = c.createStatement()) {
                s.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        id           SERIAL PRIMARY KEY,
                        email        VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name    VARCHAR(255),
                        role         VARCHAR(20) NOT NULL DEFAULT 'user',
                        is_banned    BOOLEAN NOT NULL DEFAULT false,
                        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                """);
                s.execute("""
                    CREATE TABLE IF NOT EXISTS refresh_tokens (
                        id         SERIAL PRIMARY KEY,
                        user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        token_hash VARCHAR(255) UNIQUE NOT NULL,
                        expires_at TIMESTAMPTZ NOT NULL,
                        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                """);
                s.execute("""
                    CREATE TABLE IF NOT EXISTS files (
                        id            SERIAL PRIMARY KEY,
                        user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                        original_name VARCHAR(500) NOT NULL,
                        stored_name   VARCHAR(500) UNIQUE NOT NULL,
                        mime_type     VARCHAR(200),
                        file_size     BIGINT,
                        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
                    )
                """);
                System.out.println("✓ Database tables ready");
            }
        }
    }

    // ════════════════════════════════════════════════════════════
    //  JWT UTIL
    // ════════════════════════════════════════════════════════════
    static class JwtUtil {
        private final SecretKey key;
        private final long accessMinutes;
        private final long refreshDays;

        JwtUtil(String secret, long accessMinutes, long refreshDays) {
            byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < 32) throw new IllegalArgumentException("JWT_SECRET must be at least 32 characters");
            this.key           = Keys.hmacShaKeyFor(bytes);
            this.accessMinutes = accessMinutes;
            this.refreshDays   = refreshDays;
        }

        String createAccessToken(int userId, String email, String role) {
            return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .claim("type", "access")
                .issuedAt(new java.util.Date())
                .expiration(java.util.Date.from(Instant.now().plusSeconds(accessMinutes * 60)))
                .signWith(key)
                .compact();
        }

        String createRefreshToken(int userId) {
            return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("type", "refresh")
                .issuedAt(new java.util.Date())
                .expiration(java.util.Date.from(Instant.now().plusSeconds(refreshDays * 86400)))
                .signWith(key)
                .compact();
        }

        Claims verify(String token) {
            return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
        }

        // Returns null if invalid / expired
        Claims verifyQuiet(String token) {
            try { return verify(token); }
            catch (Exception e) { return null; }
        }

        int getUserId(Claims c) { return Integer.parseInt(c.getSubject()); }
        String getRole(Claims c) { return c.get("role", String.class); }
        String getType(Claims c) { return c.get("type", String.class); }
    }

    // ════════════════════════════════════════════════════════════
    //  PASSWORD HASHING (SHA-256 + salt — or swap for BCrypt)
    // ════════════════════════════════════════════════════════════
    static class Password {
        static String hash(String plain) throws Exception {
            String salt = UUID.randomUUID().toString().replace("-", "");
            String salted = salt + plain;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(salted.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return salt + "$" + sb; // stored as "salt$hash"
        }

        static boolean verify(String plain, String stored) throws Exception {
            String[] parts = stored.split("\\$", 2);
            if (parts.length != 2) return false;
            String salt   = parts[0];
            String expect = parts[1];
            String salted = salt + plain;
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(salted.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString().equals(expect);
        }
    }

    // ════════════════════════════════════════════════════════════
    //  HTTP HELPERS
    // ════════════════════════════════════════════════════════════
    static class Http {

        /** Read the full body of a request as a String */
        static String readBody(HttpExchange ex) throws IOException {
            try (InputStream is = ex.getRequestBody()) {
                return new String(is.readAllBytes(), StandardCharsets.UTF_8);
            }
        }

        /** Write a JSON response */
        static void json(HttpExchange ex, int status, Object data) throws IOException {
            String body = gson.toJson(data);
            byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
            corsHeaders(ex);
            ex.sendResponseHeaders(status, bytes.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(bytes); }
        }

        /** Write a raw binary / download response */
        static void binary(HttpExchange ex, int status, byte[] data, String mimeType, String filename) throws IOException {
            ex.getResponseHeaders().set("Content-Type", mimeType);
            ex.getResponseHeaders().set("Content-Disposition", "attachment; filename=\"" + filename + "\"");
            corsHeaders(ex);
            ex.sendResponseHeaders(status, data.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(data); }
        }

        static void error(HttpExchange ex, int status, String message) throws IOException {
            Map<String, String> m = new LinkedHashMap<>();
            m.put("error", message);
            json(ex, status, m);
        }

        static void corsHeaders(HttpExchange ex) {
            Headers h = ex.getResponseHeaders();
            h.set("Access-Control-Allow-Origin",  "*");
            h.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            h.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        }

        static void handleOptions(HttpExchange ex) throws IOException {
            corsHeaders(ex);
            ex.sendResponseHeaders(204, -1);
        }

        /** Extract "Bearer TOKEN" from Authorization header → null if missing */
        static String bearerToken(HttpExchange ex) {
            String auth = ex.getRequestHeaders().getFirst("Authorization");
            if (auth == null || !auth.startsWith("Bearer ")) return null;
            return auth.substring(7).trim();
        }

        /** Require a valid access JWT. Returns Claims or sends 401 and returns null. */
        static Claims requireAuth(HttpExchange ex) throws IOException {
            String token = bearerToken(ex);
            if (token == null) { error(ex, 401, "Missing Authorization header"); return null; }
            Claims c = jwt.verifyQuiet(token);
            if (c == null) { error(ex, 401, "Invalid or expired token"); return null; }
            if (!"access".equals(jwt.getType(c))) { error(ex, 401, "Not an access token"); return null; }
            return c;
        }

        /** Require admin role. Returns Claims or sends 403 and returns null. */
        static Claims requireAdmin(HttpExchange ex) throws IOException {
            Claims c = requireAuth(ex);
            if (c == null) return null;
            if (!"admin".equals(jwt.getRole(c))) { error(ex, 403, "Admin access required"); return null; }
            return c;
        }

        /** Parse path segments after the context root. e.g. /api/files/42/download → ["42","download"] */
        static String[] pathSegments(HttpExchange ex, String contextRoot) {
            String path = ex.getRequestURI().getPath();
            String rest = path.substring(contextRoot.length());
            if (rest.startsWith("/")) rest = rest.substring(1);
            if (rest.isEmpty()) return new String[0];
            return rest.split("/");
        }

        /** Parse query params into a Map */
        static Map<String, String> queryParams(HttpExchange ex) {
            Map<String, String> out = new LinkedHashMap<>();
            String query = ex.getRequestURI().getQuery();
            if (query == null) return out;
            for (String pair : query.split("&")) {
                String[] kv = pair.split("=", 2);
                if (kv.length == 2) out.put(URLDecoder.decode(kv[0], StandardCharsets.UTF_8),
                                             URLDecoder.decode(kv[1], StandardCharsets.UTF_8));
                else if (kv.length == 1) out.put(URLDecoder.decode(kv[0], StandardCharsets.UTF_8), "");
            }
            return out;
        }
    }

    // ════════════════════════════════════════════════════════════
    //  AUTH HANDLER  /api/auth
    //    POST /api/auth/register
    //    POST /api/auth/login
    //    POST /api/auth/refresh
    //    POST /api/auth/logout
    //    GET  /api/auth/me
    // ════════════════════════════════════════════════════════════
    static class AuthHandler implements HttpHandler {
        @Override public void handle(HttpExchange ex) throws IOException {
            if ("OPTIONS".equals(ex.getRequestMethod())) { Http.handleOptions(ex); return; }
            String[] seg = Http.pathSegments(ex, "/api/auth");
            String action = seg.length > 0 ? seg[0] : "";
            try {
                switch (action) {
                    case "register" -> register(ex);
                    case "login"    -> login(ex);
                    case "refresh"  -> refresh(ex);
                    case "logout"   -> logout(ex);
                    case "me"       -> me(ex);
                    default -> Http.error(ex, 404, "Unknown auth endpoint");
                }
            } catch (Exception e) {
                e.printStackTrace();
                Http.error(ex, 500, "Internal server error");
            }
        }

        void register(HttpExchange ex) throws Exception {
            if (!"POST".equals(ex.getRequestMethod())) { Http.error(ex, 405, "POST required"); return; }
            JsonObject body = gson.fromJson(Http.readBody(ex), JsonObject.class);
            String email    = getString(body, "email");
            String password = getString(body, "password");
            String fullName = getString(body, "full_name");

            if (email == null || email.isBlank())    { Http.error(ex, 400, "email is required"); return; }
            if (password == null || password.length() < 6) { Http.error(ex, 400, "password must be at least 6 characters"); return; }
            if (!email.matches("^[^@]+@[^@]+\\.[^@]+$")) { Http.error(ex, 400, "Invalid email format"); return; }

            String passwordHash = Password.hash(password);

            try (Connection c = pool.getConnection()) {
                // Check email taken
                PreparedStatement chk = c.prepareStatement("SELECT id FROM users WHERE email = ?");
                chk.setString(1, email.toLowerCase());
                if (chk.executeQuery().next()) { Http.error(ex, 409, "Email already registered"); return; }

                PreparedStatement ins = c.prepareStatement(
                    "INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?) RETURNING id",
                    Statement.RETURN_GENERATED_KEYS);
                ins.setString(1, email.toLowerCase());
                ins.setString(2, passwordHash);
                ins.setString(3, fullName != null ? fullName.trim() : "");
                ResultSet rs = ins.executeQuery();
                rs.next();
                int userId = rs.getInt("id");

                String accessToken  = jwt.createAccessToken(userId, email.toLowerCase(), "user");
                String refreshToken = jwt.createRefreshToken(userId);
                storeRefreshToken(c, userId, refreshToken);

                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("message", "Registration successful");
                resp.put("access_token", accessToken);
                resp.put("refresh_token", refreshToken);
                resp.put("user", userMap(userId, email.toLowerCase(), fullName, "user", c));
                Http.json(ex, 201, resp);
            }
        }

        void login(HttpExchange ex) throws Exception {
            if (!"POST".equals(ex.getRequestMethod())) { Http.error(ex, 405, "POST required"); return; }
            JsonObject body = gson.fromJson(Http.readBody(ex), JsonObject.class);
            String email    = getString(body, "email");
            String password = getString(body, "password");
            if (email == null || password == null) { Http.error(ex, 400, "email and password required"); return; }

            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "SELECT id, password_hash, full_name, role, is_banned FROM users WHERE email = ?");
                ps.setString(1, email.toLowerCase());
                ResultSet rs = ps.executeQuery();
                if (!rs.next()) { Http.error(ex, 401, "Invalid email or password"); return; }

                int     userId       = rs.getInt("id");
                String  storedHash   = rs.getString("password_hash");
                String  fullName     = rs.getString("full_name");
                String  role         = rs.getString("role");
                boolean banned       = rs.getBoolean("is_banned");

                if (banned) { Http.error(ex, 403, "Account is banned"); return; }
                if (!Password.verify(password, storedHash)) { Http.error(ex, 401, "Invalid email or password"); return; }

                // Clean up old refresh tokens for this user
                cleanOldRefreshTokens(c, userId);

                String accessToken  = jwt.createAccessToken(userId, email.toLowerCase(), role);
                String refreshToken = jwt.createRefreshToken(userId);
                storeRefreshToken(c, userId, refreshToken);

                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("access_token", accessToken);
                resp.put("refresh_token", refreshToken);
                resp.put("user", userMap(userId, email.toLowerCase(), fullName, role, c));
                Http.json(ex, 200, resp);
            }
        }

        void refresh(HttpExchange ex) throws Exception {
            if (!"POST".equals(ex.getRequestMethod())) { Http.error(ex, 405, "POST required"); return; }
            JsonObject body = gson.fromJson(Http.readBody(ex), JsonObject.class);
            String refreshToken = getString(body, "refresh_token");
            if (refreshToken == null) { Http.error(ex, 400, "refresh_token required"); return; }

            Claims claims = jwt.verifyQuiet(refreshToken);
            if (claims == null || !"refresh".equals(jwt.getType(claims))) {
                Http.error(ex, 401, "Invalid or expired refresh token"); return;
            }
            int userId = jwt.getUserId(claims);

            try (Connection c = pool.getConnection()) {
                String tokenHash = sha256(refreshToken);
                PreparedStatement ps = c.prepareStatement(
                    "SELECT id FROM refresh_tokens WHERE user_id = ? AND token_hash = ? AND expires_at > NOW()");
                ps.setInt(1, userId);
                ps.setString(2, tokenHash);
                if (!ps.executeQuery().next()) { Http.error(ex, 401, "Refresh token not found or expired"); return; }

                PreparedStatement uq = c.prepareStatement(
                    "SELECT email, role FROM users WHERE id = ? AND is_banned = false");
                uq.setInt(1, userId);
                ResultSet rs = uq.executeQuery();
                if (!rs.next()) { Http.error(ex, 401, "User not found or banned"); return; }
                String email = rs.getString("email");
                String role  = rs.getString("role");

                // Rotate: delete old, issue new
                PreparedStatement del = c.prepareStatement(
                    "DELETE FROM refresh_tokens WHERE user_id = ? AND token_hash = ?");
                del.setInt(1, userId); del.setString(2, tokenHash); del.executeUpdate();

                String newAccess  = jwt.createAccessToken(userId, email, role);
                String newRefresh = jwt.createRefreshToken(userId);
                storeRefreshToken(c, userId, newRefresh);

                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("access_token", newAccess);
                resp.put("refresh_token", newRefresh);
                Http.json(ex, 200, resp);
            }
        }

        void logout(HttpExchange ex) throws Exception {
            if (!"POST".equals(ex.getRequestMethod())) { Http.error(ex, 405, "POST required"); return; }
            Claims c = Http.requireAuth(ex);
            if (c == null) return;
            int userId = jwt.getUserId(c);

            JsonObject body = gson.fromJson(Http.readBody(ex), JsonObject.class);
            String refreshToken = getString(body, "refresh_token");

            try (Connection conn = pool.getConnection()) {
                if (refreshToken != null) {
                    String hash = sha256(refreshToken);
                    PreparedStatement ps = conn.prepareStatement(
                        "DELETE FROM refresh_tokens WHERE user_id = ? AND token_hash = ?");
                    ps.setInt(1, userId); ps.setString(2, hash); ps.executeUpdate();
                } else {
                    // Logout everywhere
                    PreparedStatement ps = conn.prepareStatement(
                        "DELETE FROM refresh_tokens WHERE user_id = ?");
                    ps.setInt(1, userId); ps.executeUpdate();
                }
            }
            Map<String, String> resp = new LinkedHashMap<>();
            resp.put("message", "Logged out successfully");
            Http.json(ex, 200, resp);
        }

        void me(HttpExchange ex) throws Exception {
            if (!"GET".equals(ex.getRequestMethod())) { Http.error(ex, 405, "GET required"); return; }
            Claims claims = Http.requireAuth(ex);
            if (claims == null) return;
            int userId = jwt.getUserId(claims);

            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "SELECT id, email, full_name, role, created_at FROM users WHERE id = ?");
                ps.setInt(1, userId);
                ResultSet rs = ps.executeQuery();
                if (!rs.next()) { Http.error(ex, 404, "User not found"); return; }
                Map<String, Object> user = new LinkedHashMap<>();
                user.put("id",         rs.getInt("id"));
                user.put("email",      rs.getString("email"));
                user.put("full_name",  rs.getString("full_name"));
                user.put("role",       rs.getString("role"));
                user.put("created_at", rs.getString("created_at"));
                Http.json(ex, 200, user);
            }
        }

        // ── helpers ──

        void storeRefreshToken(Connection c, int userId, String token) throws Exception {
            String hash = sha256(token);
            PreparedStatement ps = c.prepareStatement(
                "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)");
            ps.setInt(1, userId);
            ps.setString(2, hash);
            ps.setTimestamp(3, Timestamp.from(Instant.now().plusSeconds(JWT_REFRESH_EXPIRY_DAYS * 86400)));
            ps.executeUpdate();
        }

        void cleanOldRefreshTokens(Connection c, int userId) throws Exception {
            PreparedStatement ps = c.prepareStatement(
                "DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < NOW()");
            ps.setInt(1, userId);
            ps.executeUpdate();
        }

        Map<String, Object> userMap(int id, String email, String fullName, String role, Connection c) throws Exception {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", id); m.put("email", email); m.put("full_name", fullName); m.put("role", role);
            return m;
        }
    }

    // ════════════════════════════════════════════════════════════
    //  USER HANDLER  /api/users
    //    GET    /api/users/profile          → own profile
    //    PUT    /api/users/profile          → update name/email/password
    //    DELETE /api/users/profile          → delete own account
    // ════════════════════════════════════════════════════════════
    static class UserHandler implements HttpHandler {
        @Override public void handle(HttpExchange ex) throws IOException {
            if ("OPTIONS".equals(ex.getRequestMethod())) { Http.handleOptions(ex); return; }
            String[] seg = Http.pathSegments(ex, "/api/users");
            String action = seg.length > 0 ? seg[0] : "";
            try {
                switch (action) {
                    case "profile" -> profile(ex);
                    default -> Http.error(ex, 404, "Unknown users endpoint");
                }
            } catch (Exception e) {
                e.printStackTrace();
                Http.error(ex, 500, "Internal server error");
            }
        }

        void profile(HttpExchange ex) throws Exception {
            Claims claims = Http.requireAuth(ex);
            if (claims == null) return;
            int userId = jwt.getUserId(claims);

            if ("GET".equals(ex.getRequestMethod())) {
                try (Connection c = pool.getConnection()) {
                    PreparedStatement ps = c.prepareStatement(
                        "SELECT id, email, full_name, role, created_at, updated_at FROM users WHERE id = ?");
                    ps.setInt(1, userId);
                    ResultSet rs = ps.executeQuery();
                    if (!rs.next()) { Http.error(ex, 404, "User not found"); return; }
                    Map<String, Object> u = new LinkedHashMap<>();
                    u.put("id",         rs.getInt("id"));
                    u.put("email",      rs.getString("email"));
                    u.put("full_name",  rs.getString("full_name"));
                    u.put("role",       rs.getString("role"));
                    u.put("created_at", rs.getString("created_at"));
                    u.put("updated_at", rs.getString("updated_at"));
                    Http.json(ex, 200, u);
                }

            } else if ("PUT".equals(ex.getRequestMethod())) {
                JsonObject body = gson.fromJson(Http.readBody(ex), JsonObject.class);
                try (Connection c = pool.getConnection()) {
                    // Build SET clause dynamically based on what was provided
                    List<String> sets  = new ArrayList<>();
                    List<Object> vals  = new ArrayList<>();

                    String newName  = getString(body, "full_name");
                    String newEmail = getString(body, "email");
                    String newPass  = getString(body, "password");
                    String oldPass  = getString(body, "current_password");

                    if (newName  != null) { sets.add("full_name = ?");     vals.add(newName.trim()); }
                    if (newEmail != null) {
                        if (!newEmail.matches("^[^@]+@[^@]+\\.[^@]+$")) { Http.error(ex, 400, "Invalid email"); return; }
                        // Check not taken by someone else
                        PreparedStatement chk = c.prepareStatement("SELECT id FROM users WHERE email = ? AND id != ?");
                        chk.setString(1, newEmail.toLowerCase()); chk.setInt(2, userId);
                        if (chk.executeQuery().next()) { Http.error(ex, 409, "Email already taken"); return; }
                        sets.add("email = ?"); vals.add(newEmail.toLowerCase());
                    }
                    if (newPass != null) {
                        if (newPass.length() < 6) { Http.error(ex, 400, "New password must be at least 6 characters"); return; }
                        if (oldPass == null) { Http.error(ex, 400, "current_password required to change password"); return; }
                        // Verify current password
                        PreparedStatement cp = c.prepareStatement("SELECT password_hash FROM users WHERE id = ?");
                        cp.setInt(1, userId);
                        ResultSet rs = cp.executeQuery();
                        rs.next();
                        if (!Password.verify(oldPass, rs.getString("password_hash"))) {
                            Http.error(ex, 401, "current_password is incorrect"); return;
                        }
                        sets.add("password_hash = ?"); vals.add(Password.hash(newPass));
                    }

                    if (sets.isEmpty()) { Http.error(ex, 400, "No fields to update"); return; }
                    sets.add("updated_at = NOW()");

                    String sql = "UPDATE users SET " + String.join(", ", sets) + " WHERE id = ?";
                    PreparedStatement ps = c.prepareStatement(sql);
                    for (int i = 0; i < vals.size(); i++) ps.setObject(i + 1, vals.get(i));
                    ps.setInt(vals.size() + 1, userId);
                    ps.executeUpdate();

                    Map<String, String> resp = new LinkedHashMap<>();
                    resp.put("message", "Profile updated successfully");
                    Http.json(ex, 200, resp);
                }

            } else if ("DELETE".equals(ex.getRequestMethod())) {
                JsonObject body = gson.fromJson(Http.readBody(ex), JsonObject.class);
                String password = getString(body, "password");
                if (password == null) { Http.error(ex, 400, "password required to delete account"); return; }
                try (Connection c = pool.getConnection()) {
                    PreparedStatement ps = c.prepareStatement("SELECT password_hash FROM users WHERE id = ?");
                    ps.setInt(1, userId);
                    ResultSet rs = ps.executeQuery();
                    if (!rs.next() || !Password.verify(password, rs.getString("password_hash"))) {
                        Http.error(ex, 401, "Incorrect password"); return;
                    }
                    // Delete uploaded files from disk too
                    PreparedStatement fq = c.prepareStatement("SELECT stored_name FROM files WHERE user_id = ?");
                    fq.setInt(1, userId);
                    ResultSet fr = fq.executeQuery();
                    while (fr.next()) {
                        try { Files.deleteIfExists(Paths.get(UPLOAD_DIR, fr.getString("stored_name"))); } catch (Exception ignore) {}
                    }
                    PreparedStatement del = c.prepareStatement("DELETE FROM users WHERE id = ?");
                    del.setInt(1, userId); del.executeUpdate();
                    Map<String, String> resp = new LinkedHashMap<>();
                    resp.put("message", "Account deleted");
                    Http.json(ex, 200, resp);
                }
            } else {
                Http.error(ex, 405, "Method not allowed");
            }
        }
    }

    // ════════════════════════════════════════════════════════════
    //  FILE HANDLER  /api/files
    //    POST   /api/files/upload            → upload a file
    //    GET    /api/files                   → list own files
    //    GET    /api/files/{id}/download     → download a file
    //    DELETE /api/files/{id}              → delete a file
    // ════════════════════════════════════════════════════════════
    static class FileHandler implements HttpHandler {
        @Override public void handle(HttpExchange ex) throws IOException {
            if ("OPTIONS".equals(ex.getRequestMethod())) { Http.handleOptions(ex); return; }
            String[] seg    = Http.pathSegments(ex, "/api/files");
            String method   = ex.getRequestMethod();
            try {
                if (seg.length == 0 && "GET".equals(method)) {
                    listFiles(ex);
                } else if (seg.length == 1 && "upload".equals(seg[0]) && "POST".equals(method)) {
                    uploadFile(ex);
                } else if (seg.length == 2 && "download".equals(seg[1]) && "GET".equals(method)) {
                    downloadFile(ex, Integer.parseInt(seg[0]));
                } else if (seg.length == 1 && "DELETE".equals(method)) {
                    deleteFile(ex, Integer.parseInt(seg[0]));
                } else {
                    Http.error(ex, 404, "Unknown files endpoint");
                }
            } catch (NumberFormatException e) {
                Http.error(ex, 400, "Invalid file id");
            } catch (Exception e) {
                e.printStackTrace();
                Http.error(ex, 500, "Internal server error");
            }
        }

        void listFiles(HttpExchange ex) throws Exception {
            Claims claims = Http.requireAuth(ex);
            if (claims == null) return;
            int userId = jwt.getUserId(claims);

            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "SELECT id, original_name, mime_type, file_size, created_at FROM files WHERE user_id = ? ORDER BY created_at DESC");
                ps.setInt(1, userId);
                ResultSet rs = ps.executeQuery();
                List<Map<String, Object>> files = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> f = new LinkedHashMap<>();
                    f.put("id",            rs.getInt("id"));
                    f.put("original_name", rs.getString("original_name"));
                    f.put("mime_type",     rs.getString("mime_type"));
                    f.put("file_size",     rs.getLong("file_size"));
                    f.put("created_at",    rs.getString("created_at"));
                    files.add(f);
                }
                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("files", files);
                resp.put("count", files.size());
                Http.json(ex, 200, resp);
            }
        }

        /*
         * Upload uses a simple multipart/form-data parser.
         * The HTML form must POST with enctype="multipart/form-data"
         * and one field named "file".
         */
        void uploadFile(HttpExchange ex) throws Exception {
            Claims claims = Http.requireAuth(ex);
            if (claims == null) return;
            int userId = jwt.getUserId(claims);

            String contentType = ex.getRequestHeaders().getFirst("Content-Type");
            if (contentType == null || !contentType.contains("multipart/form-data")) {
                Http.error(ex, 400, "multipart/form-data required"); return;
            }

            // Extract boundary
            String boundary = null;
            for (String part : contentType.split(";")) {
                part = part.trim();
                if (part.startsWith("boundary=")) { boundary = part.substring(9).trim(); break; }
            }
            if (boundary == null) { Http.error(ex, 400, "Missing multipart boundary"); return; }

            byte[] body = ex.getRequestBody().readAllBytes();
            if (body.length > MAX_FILE_SIZE_BYTES) {
                Http.error(ex, 413, "File too large. Max " + (MAX_FILE_SIZE_BYTES / 1_048_576) + " MB"); return;
            }

            // Parse multipart
            MultipartFile mpf = parseMultipart(body, boundary);
            if (mpf == null) { Http.error(ex, 400, "Could not parse file from request"); return; }

            String originalName = sanitizeFilename(mpf.filename);
            String storedName   = UUID.randomUUID() + "_" + originalName;
            Path   dest         = Paths.get(UPLOAD_DIR, storedName);
            Files.write(dest, mpf.data);

            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "INSERT INTO files (user_id, original_name, stored_name, mime_type, file_size) VALUES (?, ?, ?, ?, ?) RETURNING id");
                ps.setInt(1, userId);
                ps.setString(2, originalName);
                ps.setString(3, storedName);
                ps.setString(4, mpf.contentType != null ? mpf.contentType : "application/octet-stream");
                ps.setLong(5, mpf.data.length);
                ResultSet rs = ps.executeQuery();
                rs.next();
                int fileId = rs.getInt("id");

                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("message",       "File uploaded successfully");
                resp.put("id",            fileId);
                resp.put("original_name", originalName);
                resp.put("file_size",     mpf.data.length);
                Http.json(ex, 201, resp);
            }
        }

        void downloadFile(HttpExchange ex, int fileId) throws Exception {
            Claims claims = Http.requireAuth(ex);
            if (claims == null) return;
            int userId = jwt.getUserId(claims);

            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "SELECT original_name, stored_name, mime_type, user_id FROM files WHERE id = ?");
                ps.setInt(1, fileId);
                ResultSet rs = ps.executeQuery();
                if (!rs.next()) { Http.error(ex, 404, "File not found"); return; }

                int ownerUserId = rs.getInt("user_id");
                // Allow download by owner OR admin
                String role = jwt.getRole(claims);
                if (ownerUserId != userId && !"admin".equals(role)) {
                    Http.error(ex, 403, "Access denied"); return;
                }

                String originalName = rs.getString("original_name");
                String storedName   = rs.getString("stored_name");
                String mimeType     = rs.getString("mime_type");

                Path path = Paths.get(UPLOAD_DIR, storedName);
                if (!Files.exists(path)) { Http.error(ex, 404, "File not found on disk"); return; }

                byte[] data = Files.readAllBytes(path);
                Http.binary(ex, 200, data, mimeType != null ? mimeType : "application/octet-stream", originalName);
            }
        }

        void deleteFile(HttpExchange ex, int fileId) throws Exception {
            Claims claims = Http.requireAuth(ex);
            if (claims == null) return;
            int userId = jwt.getUserId(claims);

            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "SELECT stored_name, user_id FROM files WHERE id = ?");
                ps.setInt(1, fileId);
                ResultSet rs = ps.executeQuery();
                if (!rs.next()) { Http.error(ex, 404, "File not found"); return; }

                int ownerUserId = rs.getInt("user_id");
                String role = jwt.getRole(claims);
                if (ownerUserId != userId && !"admin".equals(role)) {
                    Http.error(ex, 403, "Access denied"); return;
                }

                String storedName = rs.getString("stored_name");
                PreparedStatement del = c.prepareStatement("DELETE FROM files WHERE id = ?");
                del.setInt(1, fileId); del.executeUpdate();
                try { Files.deleteIfExists(Paths.get(UPLOAD_DIR, storedName)); } catch (Exception ignore) {}

                Map<String, String> resp = new LinkedHashMap<>();
                resp.put("message", "File deleted");
                Http.json(ex, 200, resp);
            }
        }
    }

    // ════════════════════════════════════════════════════════════
    //  ADMIN HANDLER  /api/admin   (role = "admin" required)
    //    GET    /api/admin/users             → list all users
    //    GET    /api/admin/users/{id}        → get one user
    //    POST   /api/admin/users/{id}/ban    → ban user
    //    POST   /api/admin/users/{id}/unban  → unban user
    //    PUT    /api/admin/users/{id}/role   → change role
    //    DELETE /api/admin/users/{id}        → delete any user
    //    GET    /api/admin/files             → list all files
    // ════════════════════════════════════════════════════════════
    static class AdminHandler implements HttpHandler {
        @Override public void handle(HttpExchange ex) throws IOException {
            if ("OPTIONS".equals(ex.getRequestMethod())) { Http.handleOptions(ex); return; }
            String[] seg  = Http.pathSegments(ex, "/api/admin");
            String method = ex.getRequestMethod();
            try {
                if (seg.length == 0) { Http.error(ex, 404, "Specify a resource"); return; }
                switch (seg[0]) {
                    case "users" -> {
                        if (seg.length == 1 && "GET".equals(method))                              listUsers(ex);
                        else if (seg.length == 2 && "GET".equals(method))                         getUser(ex, Integer.parseInt(seg[1]));
                        else if (seg.length == 3 && "ban".equals(seg[2]) && "POST".equals(method)) banUser(ex, Integer.parseInt(seg[1]), true);
                        else if (seg.length == 3 && "unban".equals(seg[2]) && "POST".equals(method)) banUser(ex, Integer.parseInt(seg[1]), false);
                        else if (seg.length == 3 && "role".equals(seg[2]) && "PUT".equals(method)) changeRole(ex, Integer.parseInt(seg[1]));
                        else if (seg.length == 2 && "DELETE".equals(method))                      deleteUser(ex, Integer.parseInt(seg[1]));
                        else Http.error(ex, 404, "Unknown admin/users endpoint");
                    }
                    case "files" -> {
                        if (seg.length == 1 && "GET".equals(method)) listAllFiles(ex);
                        else Http.error(ex, 404, "Unknown admin/files endpoint");
                    }
                    default -> Http.error(ex, 404, "Unknown admin resource");
                }
            } catch (NumberFormatException e) {
                Http.error(ex, 400, "Invalid id");
            } catch (Exception e) {
                e.printStackTrace();
                Http.error(ex, 500, "Internal server error");
            }
        }

        void listUsers(HttpExchange ex) throws Exception {
            if (Http.requireAdmin(ex) == null) return;
            Map<String, String> q = Http.queryParams(ex);
            int page  = Integer.parseInt(q.getOrDefault("page",  "1"));
            int limit = Integer.parseInt(q.getOrDefault("limit", "20"));
            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 20;
            int offset = (page - 1) * limit;

            try (Connection c = pool.getConnection()) {
                PreparedStatement count = c.prepareStatement("SELECT COUNT(*) FROM users");
                ResultSet cr = count.executeQuery(); cr.next();
                int total = cr.getInt(1);

                PreparedStatement ps = c.prepareStatement(
                    "SELECT id, email, full_name, role, is_banned, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?");
                ps.setInt(1, limit); ps.setInt(2, offset);
                ResultSet rs = ps.executeQuery();
                List<Map<String, Object>> users = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> u = new LinkedHashMap<>();
                    u.put("id",         rs.getInt("id"));
                    u.put("email",      rs.getString("email"));
                    u.put("full_name",  rs.getString("full_name"));
                    u.put("role",       rs.getString("role"));
                    u.put("is_banned",  rs.getBoolean("is_banned"));
                    u.put("created_at", rs.getString("created_at"));
                    users.add(u);
                }
                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("users", users);
                resp.put("total", total);
                resp.put("page",  page);
                resp.put("limit", limit);
                Http.json(ex, 200, resp);
            }
        }

        void getUser(HttpExchange ex, int userId) throws Exception {
            if (Http.requireAdmin(ex) == null) return;
            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "SELECT id, email, full_name, role, is_banned, created_at, updated_at FROM users WHERE id = ?");
                ps.setInt(1, userId);
                ResultSet rs = ps.executeQuery();
                if (!rs.next()) { Http.error(ex, 404, "User not found"); return; }
                Map<String, Object> u = new LinkedHashMap<>();
                u.put("id",         rs.getInt("id"));
                u.put("email",      rs.getString("email"));
                u.put("full_name",  rs.getString("full_name"));
                u.put("role",       rs.getString("role"));
                u.put("is_banned",  rs.getBoolean("is_banned"));
                u.put("created_at", rs.getString("created_at"));
                u.put("updated_at", rs.getString("updated_at"));

                // File count
                PreparedStatement fc = c.prepareStatement("SELECT COUNT(*) FROM files WHERE user_id = ?");
                fc.setInt(1, userId);
                ResultSet fcr = fc.executeQuery(); fcr.next();
                u.put("file_count", fcr.getInt(1));
                Http.json(ex, 200, u);
            }
        }

        void banUser(HttpExchange ex, int userId, boolean ban) throws Exception {
            if (Http.requireAdmin(ex) == null) return;
            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "UPDATE users SET is_banned = ?, updated_at = NOW() WHERE id = ?");
                ps.setBoolean(1, ban); ps.setInt(2, userId);
                int rows = ps.executeUpdate();
                if (rows == 0) { Http.error(ex, 404, "User not found"); return; }
                // Invalidate all refresh tokens on ban
                if (ban) {
                    PreparedStatement del = c.prepareStatement("DELETE FROM refresh_tokens WHERE user_id = ?");
                    del.setInt(1, userId); del.executeUpdate();
                }
                Map<String, String> resp = new LinkedHashMap<>();
                resp.put("message", ban ? "User banned" : "User unbanned");
                Http.json(ex, 200, resp);
            }
        }

        void changeRole(HttpExchange ex, int userId) throws Exception {
            if (Http.requireAdmin(ex) == null) return;
            JsonObject body = gson.fromJson(Http.readBody(ex), JsonObject.class);
            String role = getString(body, "role");
            if (role == null || (!role.equals("user") && !role.equals("admin"))) {
                Http.error(ex, 400, "role must be 'user' or 'admin'"); return;
            }
            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "UPDATE users SET role = ?, updated_at = NOW() WHERE id = ?");
                ps.setString(1, role); ps.setInt(2, userId);
                int rows = ps.executeUpdate();
                if (rows == 0) { Http.error(ex, 404, "User not found"); return; }
                Map<String, String> resp = new LinkedHashMap<>();
                resp.put("message", "Role updated to " + role);
                Http.json(ex, 200, resp);
            }
        }

        void deleteUser(HttpExchange ex, int userId) throws Exception {
            Claims claims = Http.requireAdmin(ex);
            if (claims == null) return;
            if (jwt.getUserId(claims) == userId) { Http.error(ex, 400, "Cannot delete your own account via admin"); return; }
            try (Connection c = pool.getConnection()) {
                // Delete files from disk
                PreparedStatement fq = c.prepareStatement("SELECT stored_name FROM files WHERE user_id = ?");
                fq.setInt(1, userId);
                ResultSet fr = fq.executeQuery();
                while (fr.next()) {
                    try { Files.deleteIfExists(Paths.get(UPLOAD_DIR, fr.getString("stored_name"))); } catch (Exception ignore) {}
                }
                PreparedStatement del = c.prepareStatement("DELETE FROM users WHERE id = ?");
                del.setInt(1, userId);
                int rows = del.executeUpdate();
                if (rows == 0) { Http.error(ex, 404, "User not found"); return; }
                Map<String, String> resp = new LinkedHashMap<>();
                resp.put("message", "User deleted");
                Http.json(ex, 200, resp);
            }
        }

        void listAllFiles(HttpExchange ex) throws Exception {
            if (Http.requireAdmin(ex) == null) return;
            Map<String, String> q = Http.queryParams(ex);
            int page  = Integer.parseInt(q.getOrDefault("page",  "1"));
            int limit = Integer.parseInt(q.getOrDefault("limit", "20"));
            if (page < 1) page = 1;
            if (limit < 1 || limit > 100) limit = 20;
            int offset = (page - 1) * limit;

            try (Connection c = pool.getConnection()) {
                PreparedStatement ps = c.prepareStatement(
                    "SELECT f.id, f.original_name, f.mime_type, f.file_size, f.created_at, u.email AS owner " +
                    "FROM files f JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC LIMIT ? OFFSET ?");
                ps.setInt(1, limit); ps.setInt(2, offset);
                ResultSet rs = ps.executeQuery();
                List<Map<String, Object>> files = new ArrayList<>();
                while (rs.next()) {
                    Map<String, Object> f = new LinkedHashMap<>();
                    f.put("id",            rs.getInt("id"));
                    f.put("original_name", rs.getString("original_name"));
                    f.put("mime_type",     rs.getString("mime_type"));
                    f.put("file_size",     rs.getLong("file_size"));
                    f.put("created_at",    rs.getString("created_at"));
                    f.put("owner_email",   rs.getString("owner"));
                    files.add(f);
                }
                Map<String, Object> resp = new LinkedHashMap<>();
                resp.put("files", files);
                Http.json(ex, 200, resp);
            }
        }
    }

    // ════════════════════════════════════════════════════════════
    //  STATIC FILE HANDLER  /  → serves ./public/
    // ════════════════════════════════════════════════════════════
    static class StaticHandler implements HttpHandler {
        private static final Map<String, String> MIME = Map.of(
            ".html", "text/html; charset=UTF-8",
            ".css",  "text/css",
            ".js",   "application/javascript",
            ".json", "application/json",
            ".png",  "image/png",
            ".jpg",  "image/jpeg",
            ".svg",  "image/svg+xml",
            ".ico",  "image/x-icon"
        );

        @Override public void handle(HttpExchange ex) throws IOException {
            String uriPath = ex.getRequestURI().getPath();
            if (uriPath.equals("/")) uriPath = "/index.html";
            // Security: prevent path traversal
            if (uriPath.contains("..")) { Http.error(ex, 403, "Forbidden"); return; }

            Path file = Paths.get("./public" + uriPath);
            if (!Files.exists(file) || Files.isDirectory(file)) {
                Http.error(ex, 404, "Not found"); return;
            }
            String ext  = uriPath.contains(".") ? uriPath.substring(uriPath.lastIndexOf('.')) : "";
            String mime = MIME.getOrDefault(ext, "application/octet-stream");
            byte[] data = Files.readAllBytes(file);
            Http.corsHeaders(ex);
            ex.getResponseHeaders().set("Content-Type", mime);
            ex.sendResponseHeaders(200, data.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(data); }
        }
    }

    // ════════════════════════════════════════════════════════════
    //  MULTIPART PARSER
    // ════════════════════════════════════════════════════════════
    static class MultipartFile {
        String filename;
        String contentType;
        byte[] data;
    }

    static MultipartFile parseMultipart(byte[] body, String boundary) {
        byte[] delim = ("\r\n--" + boundary).getBytes(StandardCharsets.ISO_8859_1);
        byte[] start = ("--" + boundary + "\r\n").getBytes(StandardCharsets.ISO_8859_1);

        // Find first part start
        int partStart = indexOf(body, start, 0);
        if (partStart < 0) return null;
        partStart += start.length;

        // Find headers end (\r\n\r\n)
        byte[] headerEnd = "\r\n\r\n".getBytes(StandardCharsets.ISO_8859_1);
        int hEnd = indexOf(body, headerEnd, partStart);
        if (hEnd < 0) return null;

        String headers = new String(body, partStart, hEnd - partStart, StandardCharsets.ISO_8859_1);
        MultipartFile mf = new MultipartFile();

        // Parse Content-Disposition
        for (String line : headers.split("\r\n")) {
            if (line.toLowerCase().startsWith("content-disposition:")) {
                for (String token : line.split(";")) {
                    token = token.trim();
                    if (token.startsWith("filename=")) {
                        mf.filename = token.substring(9).replace("\"", "").trim();
                    }
                }
            } else if (line.toLowerCase().startsWith("content-type:")) {
                mf.contentType = line.substring(13).trim();
            }
        }

        // Data starts after \r\n\r\n
        int dataStart = hEnd + headerEnd.length;
        // Data ends at next boundary
        int dataEnd = indexOf(body, delim, dataStart);
        if (dataEnd < 0) dataEnd = body.length;

        mf.data = Arrays.copyOfRange(body, dataStart, dataEnd);
        if (mf.filename == null) mf.filename = "upload";
        return mf;
    }

    static int indexOf(byte[] haystack, byte[] needle, int from) {
        outer:
        for (int i = from; i <= haystack.length - needle.length; i++) {
            for (int j = 0; j < needle.length; j++) {
                if (haystack[i + j] != needle[j]) continue outer;
            }
            return i;
        }
        return -1;
    }

    // ════════════════════════════════════════════════════════════
    //  UTILITY METHODS
    // ════════════════════════════════════════════════════════════

    static String sha256(String input) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] digest = md.digest(input.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : digest) sb.append(String.format("%02x", b));
        return sb.toString();
    }

    static String getString(JsonObject obj, String key) {
        if (obj == null || !obj.has(key) || obj.get(key).isJsonNull()) return null;
        String v = obj.get(key).getAsString().trim();
        return v.isEmpty() ? null : v;
    }

    static String sanitizeFilename(String name) {
        if (name == null || name.isBlank()) return "upload";
        // Keep only safe characters
        return name.replaceAll("[^a-zA-Z0-9._\\-]", "_").replaceAll("_{2,}", "_");
    }
}
