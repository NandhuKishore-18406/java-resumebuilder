package com.example.demo.portfolio.controller;

import com.example.demo.portfolio.service.PortfolioService;
import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @PostMapping("/download")
    public ResponseEntity<byte[]> downloadPortfolioZip(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> payload) throws IOException {

        String html = payload.getOrDefault("html", "");
        String css = payload.getOrDefault("css", "");
        String js = payload.getOrDefault("js", "");

        byte[] zipBytes = portfolioService.generatePortfolioZip(user.getId(), html, css, js);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"portfolio.zip\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(zipBytes);
    }
}
