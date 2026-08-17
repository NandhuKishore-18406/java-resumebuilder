package com.example.demo.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.List;
import java.util.Map;

@Service
public class GlmService {

    @Value("${glm.api-key:your_zhipuai_api_key}")
    private String apiKey;

    @Value("${glm.api-url:https://open.bigmodel.cn/api/paas/v4/chat/completions}")
    private String apiUrl;

    @Value("${glm.model:glm-4}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public String chat(String systemPrompt, String userMessage) {
        try {
            if (apiKey == null || apiKey.isBlank() || apiKey.contains("your_zhipuai_api_key")) {
                return getFallbackResponse();
            }

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

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    if (message != null && message.containsKey("content")) {
                        return (String) message.get("content");
                    }
                }
            }
        } catch (Exception e) {
            // Log & return structured fallback
        }
        return getFallbackResponse();
    }

    private String getFallbackResponse() {
        return "• Quantify achievements with concrete metrics (e.g., improved performance by 35%).\n" +
               "• Tailor technical skills and frameworks specifically to target domain roles.\n" +
               "• Maintain clean formatting with strong action verbs for every bullet point.";
    }
}