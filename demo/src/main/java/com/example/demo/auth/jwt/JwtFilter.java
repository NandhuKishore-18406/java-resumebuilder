package com.example.demo.auth.jwt;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import com.auth0.jwt.interfaces.DecodedJWT;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        // IMPORTANT: allow requests without token
        if (header == null || !header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String token = header.substring("Bearer ".length());

            DecodedJWT jwt = jwtService.validateToken(token);

            UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                    jwt.getSubject(),
                    null,
                    List.of()
                );

            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
                SecurityContextHolder.clearContext();
                filterChain.doFilter(request, response);
                return;
        }

        filterChain.doFilter(request, response);
    }
}