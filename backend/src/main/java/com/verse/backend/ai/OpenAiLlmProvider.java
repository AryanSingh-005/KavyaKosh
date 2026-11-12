package com.verse.backend.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * LLM provider implementation that calls the OpenAI Chat Completions API.
 * Activated when ai.provider=openai in application.yml.
 */
@Slf4j
public class OpenAiLlmProvider implements LlmProvider {

    private final RestClient restClient;
    private final String model;
    private final int maxTokens;
    private final double temperature;

    public OpenAiLlmProvider(String apiKey, String model) {
        this(apiKey, "https://api.openai.com/v1", model, 600, 0.9);
    }

    public OpenAiLlmProvider(
            String apiKey,
            String baseUrl,
            String model,
            int maxTokens,
            double temperature
    ) {
        this.model = model;
        this.maxTokens = maxTokens;
        this.temperature = temperature;

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("AI_API_KEY is blank — check your .env file.");
        }
        // Trim any accidental whitespace/newline that can corrupt the key
        String cleanKey = apiKey.strip();
        log.info("OpenAI provider initialised: model={}, baseUrl={}, keyPrefix={}",
                model, baseUrl, cleanKey.substring(0, Math.min(12, cleanKey.length())) + "...");

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + cleanKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        log.info("OpenAI request: model={}, system_len={}, user_len={}", model, systemPrompt.length(), userPrompt.length());

        Map<String, Object> body = Map.of(
            "model", model,
            "max_tokens", maxTokens,
            "temperature", temperature,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user",   "content", userPrompt)
            )
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri("/chat/completions")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null) throw new RuntimeException("Empty response from OpenAI");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            @SuppressWarnings("unchecked")
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return ((String) message.get("content")).trim();

        } catch (Exception e) {
            log.error("OpenAI request failed: {}", e.getMessage());
            throw new RuntimeException("AI generation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() { return "openai/" + model; }
}
