package com.verse.backend.config;

import com.verse.backend.ai.LlmProvider;
import com.verse.backend.ai.MockLlmProvider;
import com.verse.backend.ai.OpenAiLlmProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class LlmConfig {

    private final AiProperties aiProperties;

    @Bean
    public LlmProvider llmProvider() {
        String provider = aiProperties.getProvider();
        String apiKey = aiProperties.getApiKey() != null ? aiProperties.getApiKey().strip() : null;

        if ("openai".equalsIgnoreCase(provider) && apiKey != null && !apiKey.isBlank()) {
            log.info("Initializing OpenAI LLM Provider with model {} and base URL {}", 
                    aiProperties.getModel(), aiProperties.getBaseUrl());
            return new OpenAiLlmProvider(
                    apiKey,
                    aiProperties.getBaseUrl(),
                    aiProperties.getModel(),
                    aiProperties.getMaxTokens(),
                    aiProperties.getTemperature()
            );
        }
        log.info("Initializing Mock LLM Provider (provider setting: {})", provider);
        return new MockLlmProvider();
    }
}
