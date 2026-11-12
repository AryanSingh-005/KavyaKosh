package com.verse.backend.ai;

/**
 * Abstraction over any LLM provider (OpenAI, Gemini, Anthropic, etc.).
 * Inject this interface — never a concrete provider — in services.
 */
public interface LlmProvider {

    /**
     * Send a system + user prompt to the LLM and return the raw text response.
     *
     * @param systemPrompt Context / persona instructions
     * @param userPrompt   The actual request
     * @return Generated text (poem / rewrite)
     */
    String generate(String systemPrompt, String userPrompt);

    /** Human-readable provider name shown in history records. */
    String getProviderName();
}
