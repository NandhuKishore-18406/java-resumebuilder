package com.example.demo.ai;

import com.example.demo.user.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private GlmService glmService;

    @PostMapping("/profile-feedback")
    public ResponseEntity<Map<String, String>> profileFeedback(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, Object> profileData) {

        String systemPrompt =
            "You are a helpful assistant for an academic resume builder platform. " +
            "Provide concise, actionable suggestions.";

        String userMsg = String.format(
            "User: '%s' (%s). Profile data: %s. " +
            "Give 3 short bullet-point suggestions to improve their academic resume profile.",
            user.getName(), user.getEmail(),
            profileData != null ? profileData.toString() : "not provided"
        );

        String feedback = glmService.chat(systemPrompt, userMsg);
        return ResponseEntity.ok(Map.of("feedback", feedback));
    }

    @PostMapping("/resume-tips")
    public ResponseEntity<Map<String, String>> resumeTips(
            @RequestBody Map<String, String> request) {

        String section = request.getOrDefault("section", "general");
        String content = request.getOrDefault("content", "");

        String tips = glmService.chat(
            "You are an expert academic resume coach.",
            String.format("Review this '%s' section: %s. Give 3 concise improvement tips.", section, content)
        );
        return ResponseEntity.ok(Map.of("tips", tips));
    }
}