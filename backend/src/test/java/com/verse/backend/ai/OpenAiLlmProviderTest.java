package com.verse.backend.ai;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import static org.junit.jupiter.api.Assertions.*;

class OpenAiLlmProviderTest {

    private static final String API_KEY = "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";

    @Test
    void testInitialization() {
        OpenAiLlmProvider provider = new OpenAiLlmProvider(API_KEY, "gpt-4o-mini");
        assertNotNull(provider);
        assertEquals("openai/gpt-4o-mini", provider.getProviderName());
    }

    @Test
    void testBlankKeyThrows() {
        assertThrows(IllegalStateException.class, () -> new OpenAiLlmProvider("", "gpt-4o-mini"));
        assertThrows(IllegalStateException.class, () -> new OpenAiLlmProvider(null, "gpt-4o-mini"));
    }

    @Test
    @EnabledIfEnvironmentVariable(named = "RUN_LIVE_AI_TEST", matches = "true")
    void testLiveGeneration() {
        OpenAiLlmProvider provider = new OpenAiLlmProvider(API_KEY, "gpt-4o-mini");
        String result = provider.generate(
                "You are a Hindi poet. Output only the poem, no filler.",
                "Write a 2-line sher about chand and raat."
        );
        assertNotNull(result);
        assertFalse(result.isBlank());
        System.out.println("LIVE AI GENERATED POEM:\n" + result);
    }
}
