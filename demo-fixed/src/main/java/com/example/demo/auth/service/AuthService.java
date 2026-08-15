package com.example.demo.auth.service;

import com.example.demo.auth.dto.GoogleLoginRequest;
import com.example.demo.auth.dto.LoginRequest;
import com.example.demo.auth.dto.RegisterRequest;
import com.example.demo.auth.jwt.JwtService;
import com.example.demo.user.entity.User;
import com.example.demo.user.repository.UserRepository;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder encoder;

    @Value("${google.client.id:}")
    private String googleClientId;

    public String normalizeEmail(String email) {
        if (email == null) return null;
        return email.trim().toLowerCase();
    }

    public String register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (repo.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("Email already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(normalizedEmail);
        user.setPassword(encoder.encode(request.getPassword()));

        repo.save(user);

        return jwtService.generateToken(user);
    }

    public String login(LoginRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = repo.findByEmail(normalizedEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getPassword() == null || !encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtService.generateToken(user);
    }

    public String googleLogin(GoogleLoginRequest request) {
        String idTokenString = request.getIdToken();
        if (idTokenString == null || idTokenString.trim().isEmpty()) {
            throw new RuntimeException("Google token is required");
        }

        NetHttpTransport transport = new NetHttpTransport();
        GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

        GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(transport, jsonFactory);
        if (googleClientId != null && !googleClientId.trim().isEmpty()) {
            verifierBuilder.setAudience(Collections.singletonList(googleClientId.trim()));
        }
        GoogleIdTokenVerifier verifier = verifierBuilder.build();

        GoogleIdToken idToken;
        try {
            idToken = verifier.verify(idTokenString);
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed");
        }

        if (idToken == null) {
            throw new RuntimeException("Google authentication failed");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        Boolean emailVerified = payload.getEmailVerified();
        if (emailVerified == null || !emailVerified) {
            throw new RuntimeException("Google email not verified");
        }

        String rawEmail = payload.getEmail();
        if (rawEmail == null || rawEmail.trim().isEmpty()) {
            throw new RuntimeException("Google email is missing");
        }
        String normalizedEmail = normalizeEmail(rawEmail);
        String googleId = payload.getSubject();
        String name = (String) payload.get("name");
        if (name == null || name.trim().isEmpty()) {
            name = normalizedEmail.split("@")[0];
        }

        Optional<User> existingUserOpt = repo.findByEmail(normalizedEmail);
        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (user.getGoogleId() == null && googleId != null) {
                user.setGoogleId(googleId);
                repo.save(user);
            }
        } else {
            user = new User();
            user.setEmail(normalizedEmail);
            user.setName(name);
            user.setGoogleId(googleId);
            user.setPassword(null);
            repo.save(user);
        }

        return jwtService.generateToken(user);
    }
}
