package com.example.demo.auth.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.algorithms.Algorithm;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import com.example.demo.user.entity.User;

import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    // 24 hours in milliseconds
    private static final long EXPIRATION_MS = 1000L * 60 * 60 * 24;

    /**
     * Generate a JWT using the user's email as subject (not ID).
     * This makes it easy to reload the user from DB on every request.
     */
    public String generateToken(User user) {
        return JWT.create()
            .withSubject(user.getEmail())           // email as subject — findByEmail() works directly
            .withClaim("name", user.getName())
            .withIssuedAt(new Date())
            .withExpiresAt(new Date(System.currentTimeMillis() + EXPIRATION_MS))
            .sign(Algorithm.HMAC256(secret));
    }

    public DecodedJWT validateToken(String token) {
        return JWT.require(Algorithm.HMAC256(secret))
            .build()
            .verify(token);
    }
}
