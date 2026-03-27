/*
 * rb-auth.js  —  Client for the Java backend (Main.java)
 * Drop-in replacement for firebase-auth.js.
 * The window.rbAuth API is identical so existing HTML pages need no changes.
 *
 * ⚠️  If your server runs on a different host/port, change API_BASE below.
 */
(function () {

    var API_BASE = 'http://localhost:8080/api'; // ← change if needed
    var FETCH_TIMEOUT_MS = 15000;

    function fetchWithTimeout(url, options) {
        var timeout = FETCH_TIMEOUT_MS;
        return new Promise(function(resolve, reject) {
            var timer = setTimeout(function() {
                reject(new Error('Request timed out. Please check if the server is running.'));
            }, timeout);
            fetch(url, options).then(function(r) {
                clearTimeout(timer);
                resolve(r);
            }).catch(function(e) {
                clearTimeout(timer);
                reject(e);
            });
        });
    }

    // ── Token storage ──
    function getAccess()   { return sessionStorage.getItem('rb_access') || null; }
    function getRefresh()  { return localStorage.getItem('rb_refresh')  || null; }
    function saveTokens(access, refresh) {
        if (access)  sessionStorage.setItem('rb_access',  access);
        if (refresh) localStorage.setItem('rb_refresh',   refresh);
    }
    function clearTokens() {
        sessionStorage.removeItem('rb_access');
        localStorage.removeItem('rb_refresh');
    }

    // ── Low-level fetch with auth header ──
    function authFetch(path, options) {
        options = options || {};
        options.headers = options.headers || {};
        var token = getAccess();
        if (token) options.headers['Authorization'] = 'Bearer ' + token;
        return fetchWithTimeout(API_BASE + path, options);
    }

    // ── Silently attempt token refresh ──
    function refreshTokens() {
        var refresh = getRefresh();
        if (!refresh) return Promise.resolve(false);
        return fetchWithTimeout(API_BASE + '/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refresh })
        }).then(function(r) {
            if (!r.ok) { clearTokens(); return false; }
            return r.json().then(function(d) {
                saveTokens(d.access_token, d.refresh_token);
                return true;
            });
        }).catch(function() { clearTokens(); return false; });
    }

    // ── Normalize server user → shape used by HTML pages ──
    function normalizeUser(u) {
        if (!u) return null;
        u.uid  = String(u.id);
        u.displayName = u.full_name || '';
        u.user_metadata = {
            full_name:  u.full_name  || '',
            first_name: (u.full_name || '').split(' ')[0] || '',
            last_name:  (u.full_name || '').split(' ').slice(1).join(' ') || ''
        };
        return u;
    }

    // ── getCurrentUser ──
    function getCurrentUser() {
        var token = getAccess();
        if (!token) return Promise.resolve(null);
        return authFetch('/auth/me')
            .then(function(r) {
                if (r.ok) return r.json().then(normalizeUser);
                // 401 → try refresh once
                if (r.status === 401) {
                    return refreshTokens().then(function(ok) {
                        if (!ok) return null;
                        return authFetch('/auth/me').then(function(r2) {
                            return r2.ok ? r2.json().then(normalizeUser) : null;
                        });
                    });
                }
                return null;
            })
            .catch(function() { return null; });
    }

    // ── onAuthChange ──
    // Fires once immediately with the current user (or null).
    // For full real-time changes, call this on every page load.
    function onAuthChange(callback) {
        getCurrentUser().then(callback);
    }

    // ── loginWithEmail ──
    function loginWithEmail(email, password) {
        return fetchWithTimeout(API_BASE + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        }).then(function(r) {
            return r.json().then(function(d) {
                if (!r.ok) return { user: null, error: { message: d.error || 'Login failed' } };
                saveTokens(d.access_token, d.refresh_token);
                return { user: normalizeUser(d.user), error: null };
            });
        }).catch(function(e) {
            return { user: null, error: { message: e.message || 'Network error. Please check your connection.' } };
        });
    }

    // ── signupWithEmail ──
    function signupWithEmail(email, password, firstName, lastName) {
        var fullName = (firstName + ' ' + lastName).trim();
        return fetchWithTimeout(API_BASE + '/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password, full_name: fullName })
        }).then(function(r) {
            return r.json().then(function(d) {
                if (!r.ok) return { user: null, error: { message: d.error || 'Registration failed' } };
                saveTokens(d.access_token, d.refresh_token);
                return { user: normalizeUser(d.user), error: null };
            });
        }).catch(function(e) {
            return { user: null, error: { message: e.message || 'Network error. Please check your connection.' } };
        });
    }

    // ── Google login ── (not supported — return a clear error)
    function loginWithGoogle() {
        return Promise.resolve({
            user: null,
            error: { message: 'Google login is not available in self-hosted mode. Use email/password.' }
        });
    }

    // ── logout ──
    function logout() {
        var refresh = getRefresh();
        var access  = getAccess();
        var p;
        if (access) {
            p = fetchWithTimeout(API_BASE + '/auth/logout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + access },
                body: JSON.stringify({ refresh_token: refresh })
            }).catch(function() {});
        } else {
            p = Promise.resolve();
        }
        return p.then(function() {
            clearTokens();
            return { error: null };
        });
    }

    // ── resetPassword ── (stub — implement a /api/auth/forgot-password endpoint if needed)
    function resetPassword(email) {
        return Promise.resolve({ error: { message: 'Password reset not yet implemented on this server.' } });
    }

    // ── isTestSession ──
    function isTestSession() { return false; }

    // ── File helpers (bonus — used by file-manager.html) ──
    function uploadFile(file, onProgress) {
        var fd = new FormData();
        fd.append('file', file);
        var UPLOAD_TIMEOUT_MS = 60000;
        return new Promise(function(resolve) {
            var xhr = new XMLHttpRequest();
            var timer = setTimeout(function() {
                xhr.abort();
                resolve({ error: 'Upload timed out. Please try a smaller file.' });
            }, UPLOAD_TIMEOUT_MS);
            xhr.open('POST', API_BASE + '/files/upload');
            xhr.setRequestHeader('Authorization', 'Bearer ' + (getAccess() || ''));
            if (onProgress) {
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) onProgress(e.loaded / e.total);
                };
            }
            xhr.onload  = function() {
                clearTimeout(timer);
                resolve(JSON.parse(xhr.responseText));
            };
            xhr.onerror = function() {
                clearTimeout(timer);
                resolve({ error: 'Upload failed. Please check your connection.' });
            };
            xhr.ontimeout = function() {
                clearTimeout(timer);
                resolve({ error: 'Upload timed out. Please try a smaller file.' });
            };
            xhr.send(fd);
        });
    }

    function listFiles() {
        return authFetch('/files').then(function(r) { return r.json(); }).catch(function(e) {
            return { error: e.message || 'Failed to load files', files: [] };
        });
    }

    function deleteFile(fileId) {
        return authFetch('/files/' + fileId, { method: 'DELETE' }).then(function(r) { return r.json(); }).catch(function(e) {
            return { error: e.message || 'Failed to delete file' };
        });
    }

    function downloadFileUrl(fileId) {
        // Returns a URL the caller can open or use as href
        // We attach the token as a query param as a convenience
        // (the server currently requires Authorization header — see note in README)
        return API_BASE + '/files/' + fileId + '/download';
    }

    // ── Expose window.rbAuth ──
    window.rbAuth = {
        getCurrentUser:  getCurrentUser,
        onAuthChange:    onAuthChange,
        loginWithEmail:  loginWithEmail,
        signupWithEmail: signupWithEmail,
        loginWithGoogle: loginWithGoogle,
        logout:          logout,
        resetPassword:   resetPassword,
        isTestSession:   isTestSession,
        uploadFile:      uploadFile,
        listFiles:       listFiles,
        deleteFile:      deleteFile,
        downloadFileUrl: downloadFileUrl,
        TEST_EMAIL:    'test@demo.com',
        TEST_PASSWORD: 'test123'
    };

})();
