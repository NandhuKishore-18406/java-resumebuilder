package com.example.demo.auth.jwt;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.algorithms.Algorithm;

import org.springframework.stereotype.Service;

import com.example.demo.user.entity.User;

import jakarta.annotation.PostConstruct;

import org.springframework.beans.factory.annotation.Value;

@Service
public class JwtService {
    @Value("${jwt.secret}")
    private String SECRET;

    public String generateToken(User user) {
        return JWT.create()
            .withSubject(user.getId().toString())
            .withClaim("email", user.getEmail())
            .sign(Algorithm.HMAC256(SECRET));
    }

    public DecodedJWT validateToken(String token) {
        return JWT.require(Algorithm.HMAC256(SECRET))
            .build()
            .verify(token);
    }

    @PostConstruct
    public void debug() {
        System.out.println("JWT SECRET = " + SECRET);
}   
}