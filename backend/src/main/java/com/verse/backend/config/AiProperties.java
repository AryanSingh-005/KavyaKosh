package com.verse.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "ai")
public class AiProperties {

    /** Provider name: "openai" or "mock" */
    private String provider = "openai";

    /** OpenAI / LLM provider API Key (loaded from ${AI_API_KEY}) */
    private String apiKey;

    /** Base URL for LLM API (loaded from ${AI_BASE_URL:https://api.openai.com/v1}) */
    private String baseUrl = "https://api.openai.com/v1";

    /** Model identifier (loaded from ${AI_MODEL:gpt-4o-mini}) */
    private String model = "gpt-4o-mini";

    /** Maximum tokens for completions */
    private int maxTokens = 600;

    /** Temperature for creativity */
    private double temperature = 0.9;

    /** Generation limits */
    private Limits limits = new Limits();

    @Data
    public static class Limits {
        private int maxDailyGenerations = 20;
        private int maxPoemLength = 2000;
    }
}
