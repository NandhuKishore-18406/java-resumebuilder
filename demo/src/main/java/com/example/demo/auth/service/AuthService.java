package com.example.demo.auth.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.demo.user.repository.UserRepository;
import com.example.demo.user.entity.User;
import com.example.demo.auth.jwt.JwtService;
import com.example.demo.auth.dto.LoginRequest;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder encoder;

    public String login(LoginRequest request) {
        User user = repo.findByEmail(request.getEmail())
            .orElseThrow();

        if (!encoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtService.generateToken(user);
    }
}
