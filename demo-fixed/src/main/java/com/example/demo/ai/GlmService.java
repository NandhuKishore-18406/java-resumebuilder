package com.example.demo.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class GlmService {

    @Value("${glm.api-key}")
    private String apiKey;

    @Value("${glm.api-url}")
    private String apiUrl;

    @Value("${glm.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(String systemPrompt, String userMessage) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user",   "content", userMessage)
            ),
            "temperature", 0.7,
            "max_tokens", 1024
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, request, Map.class);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> choices =
            (List<Map<String, Object>>) response.getBody().get("choices");
        @SuppressWarnings("unchecked")
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }
}