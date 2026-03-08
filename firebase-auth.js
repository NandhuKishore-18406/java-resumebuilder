// ============================================================
//  firebase-auth.js  —  Firebase Auth for Resume Builder
//  Uses Firebase compat CDN (loaded via <script> tags in HTML).
//  ALL functions are on window.rbAuth — works with onclick="..."
//
//  ⚠️  ACTION REQUIRED:
//    1. Go to https://console.firebase.google.com
//    2. Your project → Project Settings → General → Your apps
//    3. Copy your firebaseConfig values and paste below.
//    4. Firebase Console → Authentication → Sign-in method:
//       • Enable "Email/Password"  • Enable "Google"
//    5. Authentication → Settings → Authorized domains:
//       • Add localhost + your production domain
// ============================================================
(function () {

    // ─────────────────────────────────────────────
    // ⚠️ PASTE YOUR FIREBASE CONFIG HERE
    // ─────────────────────────────────────────────
    var firebaseConfig = {
    apiKey: "AIzaSyC2DqK012obmKQl3hL0K5-NlnDFLUFT45M",
    authDomain: "javaresumebuilder.firebaseapp.com",
    projectId: "javaresumebuilder",
    storageBucket: "javaresumebuilder.firebasestorage.app",
    messagingSenderId: "43837883923",
    appId: "1:43837883923:web:2deb9b3db3ee68ec5961e6",
    measurementId: "G-R3ESTSQ4C6"

    };
    // ─────────────────────────────────────────────

    if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }

    var auth     = firebase.auth();
    var provider = new firebase.auth.GoogleAuthProvider();

    var TEST_EMAIL    = 'test@demo.com';
    var TEST_PASSWORD = 'test123';
    var TEST_USER = {
        email: TEST_EMAIL, uid: 'test-user-001', id: 'test-user-001',
        displayName: 'Test User',
        user_metadata: { full_name:'Test User', first_name:'Test', last_name:'User' }
    };

    function isTestSession(){ try{ return sessionStorage.getItem('rb_test_session')==='true'; }catch(e){ return false; } }
    function setTestSession(on){ try{ on?sessionStorage.setItem('rb_test_session','true'):sessionStorage.removeItem('rb_test_session'); }catch(e){} }

    function normalizeUser(u){
        if(!u) return null;
        var dn=u.displayName||'';
        return { email:u.email, uid:u.uid, id:u.uid, displayName:dn,
            user_metadata:{ full_name:dn, first_name:dn.split(' ')[0]||'', last_name:dn.split(' ').slice(1).join(' ')||'' }};
    }

    function onAuthChange(cb){
        if(isTestSession()){ cb(TEST_USER); return; }
        auth.onAuthStateChanged(function(u){ cb(u?normalizeUser(u):null); });
    }

    function getCurrentUser(){
        if(isTestSession()) return Promise.resolve(TEST_USER);
        return new Promise(function(res){
            var un=auth.onAuthStateChanged(function(u){ un(); res(u?normalizeUser(u):null); });
        });
    }

    function loginWithEmail(email, password){
        if(email===TEST_EMAIL&&password===TEST_PASSWORD){
            setTestSession(true);
            try{ var s=JSON.parse(sessionStorage.getItem('rb_state')||'{}');
                if(!s.profile)s.profile={};
                if(!s.profile.name)s.profile.name=TEST_USER.displayName;
                if(!s.profile.email)s.profile.email=TEST_EMAIL;
                sessionStorage.setItem('rb_state',JSON.stringify(s)); }catch(e){}
            return Promise.resolve({user:TEST_USER,error:null});
        }
        if(email===TEST_EMAIL) return Promise.resolve({user:null,error:{message:'Wrong password for test account. Use: test123'}});
        return auth.signInWithEmailAndPassword(email,password)
            .then(function(c){return{user:normalizeUser(c.user),error:null};})
            .catch(function(e){return{user:null,error:{message:friendlyError(e.code)}};});
    }

    function signupWithEmail(email, password, firstName, lastName){
        if(email===TEST_EMAIL) return Promise.resolve({user:null,error:{message:'This email is reserved for the test account.'}});
        return auth.createUserWithEmailAndPassword(email,password)
            .then(function(c){
                return c.user.updateProfile({displayName:(firstName+' '+lastName).trim()})
                    .then(function(){return{user:normalizeUser(c.user),error:null};});
            }).catch(function(e){return{user:null,error:{message:friendlyError(e.code)}};});
    }

    function loginWithGoogle(){
        return auth.signInWithPopup(provider)
            .then(function(r){return{user:normalizeUser(r.user),error:null};})
            .catch(function(e){return{user:null,error:{message:friendlyError(e.code)}};});
    }

    function logout(){
        if(isTestSession()){ setTestSession(false); return Promise.resolve({error:null}); }
        return auth.signOut().then(function(){return{error:null};}).catch(function(e){return{error:{message:e.message}};});
    }

    function resetPassword(email){
        return auth.sendPasswordResetEmail(email)
            .then(function(){return{error:null};}).catch(function(e){return{error:{message:friendlyError(e.code)}};});
    }

    function friendlyError(code){
        var m={'auth/user-not-found':'No account found with this email.','auth/wrong-password':'Incorrect password.',
            'auth/invalid-credential':'Invalid email or password.','auth/email-already-in-use':'An account with this email already exists.',
            'auth/weak-password':'Password should be at least 6 characters.','auth/invalid-email':'Please enter a valid email address.',
            'auth/popup-closed-by-user':'Google sign-in was cancelled.','auth/network-request-failed':'Network error. Check your connection.',
            'auth/too-many-requests':'Too many attempts. Please try again later.'};
        return m[code]||'Authentication failed. Please try again.';
    }

    window.rbAuth={ getCurrentUser:getCurrentUser, onAuthChange:onAuthChange, loginWithEmail:loginWithEmail,
        signupWithEmail:signupWithEmail, loginWithGoogle:loginWithGoogle, logout:logout,
        resetPassword:resetPassword, isTestSession:isTestSession, TEST_EMAIL:TEST_EMAIL, TEST_PASSWORD:TEST_PASSWORD };
})();
