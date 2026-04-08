package com.example.demo.auth.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import com.example.demo.auth.service.AuthService;
import com.example.demo.auth.dto.LoginRequest;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {
        String token = service.login(request);
        return Map.of("token", token);
    }
}