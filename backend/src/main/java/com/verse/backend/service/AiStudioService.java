package com.verse.backend.service;

import com.verse.backend.ai.LlmProvider;
import com.verse.backend.document.AiGenerationHistory;
import com.verse.backend.dto.AiGenerationResponse;
import com.verse.backend.dto.GeneratePoemRequest;
import com.verse.backend.dto.RewritePoemRequest;
import com.verse.backend.repository.AiGenerationHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

import com.verse.backend.config.AiProperties;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiStudioService {

    private final LlmProvider llmProvider;
    private final AiProperties aiProperties;
    private final AiGenerationHistoryRepository historyRepository;
    private final SubscriptionService subscriptionService;

    public AiGenerationResponse generatePoem(GeneratePoemRequest request, String username) {
        // Enforce per-tier daily generation limit (server-side paywall)
        if (username != null && !username.equalsIgnoreCase("anonymous")) {
            subscriptionService.enforceAiDailyLimit(username);
        }
        log.info("Generating poem for user: {}, topic: {}, emotion: {}", username, request.getPrompt(), request.getEmotion());

        String systemPrompt = buildSystemPromptForGeneration(request);
        String userPrompt = String.format(
                "Topic / Core Idea: %s\nPoetic Form: %s\nEmotion: %s\nLanguage: %s\nTheme: %s\nStanzas / Shers: %d",
                request.getPrompt(),
                request.getForm() != null ? request.getForm() : "FREE_VERSE",
                request.getEmotion() != null ? request.getEmotion() : "ROMANTIC",
                request.getLanguage() != null ? request.getLanguage() : "HINDI",
                request.getTheme() != null ? request.getTheme() : "LOVE",
                request.getStanzaCount() != null ? request.getStanzaCount() : 3
        );

        String resultText = llmProvider.generate(systemPrompt, userPrompt);

        AiGenerationHistory history = AiGenerationHistory.builder()
                .username(username != null ? username : "anonymous")
                .type("GENERATE")
                .prompt(request.getPrompt())
                .emotion(request.getEmotion())
                .language(request.getLanguage())
                .theme(request.getTheme())
                .style(request.getForm())
                .resultText(resultText)
                .providerUsed(llmProvider.getProviderName())
                .createdAt(Instant.now())
                .build();

        history = historyRepository.save(history);

        return AiGenerationResponse.builder()
                .historyId(history.getId())
                .type("GENERATE")
                .generatedText(resultText)
                .form(request.getForm())
                .emotion(request.getEmotion())
                .language(request.getLanguage())
                .theme(request.getTheme())
                .prompt(request.getPrompt())
                .createdAt(history.getCreatedAt())
                .build();
    }

    public AiGenerationResponse rewritePoem(RewritePoemRequest request, String username) {
        // Enforce per-tier daily generation limit (rewrites count toward the same quota)
        if (username != null && !username.equalsIgnoreCase("anonymous")) {
            subscriptionService.enforceAiDailyLimit(username);
        }
        log.info("Rewriting poem for user: {}, instruction: {}", username, request.getInstruction());

        String systemPrompt = """
            You are a master poet and literary editor specializing in South Asian and world poetry (Hindi, Urdu Ghazals, Nazms, English Sonnets, etc.).
            Your task is to refine, rewrite, or transform the user's poem according to their instructions while preserving emotional authenticity and meter/rhyme if applicable.
            Only return the polished poem text.
            """;

        String userPrompt = String.format("""
            Original Poem:
            %s
            
            Instruction: %s
            Target Emotion: %s
            Target Language: %s
            Target Style: %s
            """,
                request.getOriginalText(),
                request.getInstruction() != null ? request.getInstruction() : "Elevate style and imagery",
                request.getTargetEmotion() != null ? request.getTargetEmotion() : "Preserve original",
                request.getTargetLanguage() != null ? request.getTargetLanguage() : "Preserve original",
                request.getTargetStyle() != null ? request.getTargetStyle() : "POETIC"
        );

        String resultText = llmProvider.generate(systemPrompt, userPrompt);

        AiGenerationHistory history = AiGenerationHistory.builder()
                .username(username != null ? username : "anonymous")
                .type("REWRITE")
                .prompt(request.getInstruction())
                .emotion(request.getTargetEmotion())
                .language(request.getTargetLanguage())
                .style(request.getTargetStyle())
                .resultText(resultText)
                .providerUsed(llmProvider.getProviderName())
                .createdAt(Instant.now())
                .build();

        history = historyRepository.save(history);

        return AiGenerationResponse.builder()
                .historyId(history.getId())
                .type("REWRITE")
                .generatedText(resultText)
                .emotion(request.getTargetEmotion())
                .language(request.getTargetLanguage())
                .prompt(request.getInstruction())
                .createdAt(history.getCreatedAt())
                .build();
    }

    public Page<AiGenerationHistory> getUserHistory(String username, Pageable pageable) {
        return historyRepository.findByUsernameOrderByCreatedAtDesc(username, pageable);
    }

    public List<AiGenerationHistory> getRecentUserHistory(String username) {
        return historyRepository.findTop20ByUsernameOrderByCreatedAtDesc(username);
    }

    public void deleteHistoryEntry(String id, String username) {
        historyRepository.deleteByIdAndUsername(id, username);
    }

    private String buildSystemPromptForGeneration(GeneratePoemRequest req) {
        String form = req.getForm() != null ? req.getForm().toUpperCase() : "FREE_VERSE";
        String lang = req.getLanguage() != null ? req.getLanguage() : "HINDI";
        String emotion = req.getEmotion() != null ? req.getEmotion() : "ROMANTIC";
        String theme = req.getTheme() != null ? req.getTheme() : "LOVE";
        int stanzas = req.getStanzaCount() != null ? req.getStanzaCount() : 3;

        String formInstructions = switch (form) {
            case "SHAYARI" -> """
                Write authentic Sher-o-Shayari. Each sher (couplet) must be exactly 2 lines (misra-e-ula and misra-e-sani) that are metrically balanced and emotionally complete.
                Write %d shers. Each sher must stand alone as a complete thought.
                Use rich Urdu/Hindi imagery: dil, aankhein, raat, chaand, dard, mohabbat, zindagi.
                End with a powerful maqta (closing sher) that lands with emotional weight.
                Output ONLY the shers, separated by a blank line. No titles, no explanations.""".formatted(stanzas);
            case "GHAZAL" -> """
                Write a proper Ghazal with %d ashaar (couplets).
                Rules: (1) Every sher ends with the same radif (refrain word/phrase). (2) The second line of every sher carries the rhyme (qafia) before the radif. (3) The final sher (maqta) must contain the poet's pen name or a self-reference.
                The ghazal must feel like a unified emotional journey — longing, love, mysticism.
                Output ONLY the ghazal couplets separated by blank lines. No explanations.""".formatted(stanzas);
            case "NAZM" -> """
                Write a free-flowing Nazm (narrative poem) with %d stanzas.
                A Nazm tells a story or explores a single idea with emotional depth and progression.
                Use vivid imagery, metaphor, and a clear emotional arc from opening to closing.
                Output ONLY the poem. No titles or explanations.""".formatted(stanzas);
            case "DOHA" -> """
                Write %d Dohas in the classical style of Kabir, Rahim, or Tulsidas.
                Each Doha is exactly 2 lines with a strict 13+11 = 24 matra (syllable weight) structure per line.
                Each Doha must contain a complete philosophical or moral insight.
                Write in pure Hindi (Devanagari). Output ONLY the dohas, one per stanza.""".formatted(stanzas);
            case "RUBAAI" -> """
                Write %d Rubaais in the tradition of Omar Khayyam and Mirza Ghalib.
                Each Rubaai is a 4-line stanza (AABA rhyme scheme) — the third line breaks the rhyme for dramatic effect.
                Each Rubaai must be a complete philosophical meditation on life, love, fate, or mortality.
                Output ONLY the rubaais separated by blank lines.""".formatted(stanzas);
            case "QAWWALI" -> """
                Write a Qawwali-style devotional poem with %d stanzas.
                Include a repeating refrain (mukhda) after each stanza that builds in intensity.
                The language should be ecstatic, Sufi, and filled with divine longing (ishq-e-haqiqi).
                Use imagery of wine (sharaab as metaphor), the beloved (as God), the tavern (khanqah).
                Output ONLY the poem with the refrain clearly marked by repetition.""".formatted(stanzas);
            case "HAIKU" -> """
                Write %d Haikus. Each Haiku is exactly 3 lines: 5 syllables, 7 syllables, 5 syllables.
                Each must capture a single moment in nature or emotion with Zen-like clarity.
                Output ONLY the haikus separated by blank lines.""".formatted(stanzas);
            case "SONNET" -> """
                Write a Shakespearean Sonnet: 14 lines, ABAB CDCD EFEF GG rhyme scheme.
                The volta (turn) must occur at line 9. End with a powerful rhyming couplet.
                Output ONLY the sonnet.""".formatted(stanzas);
            default -> """
                Write a deeply evocative free verse poem with %d stanzas.
                Use rich imagery, metaphor, and emotional authenticity. No forced rhyme.
                Output ONLY the poem.""".formatted(stanzas);
        };

        String langInstruction = switch (lang.toUpperCase()) {
            case "URDU" -> "Write entirely in Urdu script (Nastaliq). Use classical Urdu diction.";
            case "HINDUSTANI" -> "Write in Hindustani — a natural blend of Hindi and Urdu, using Devanagari script. Mix Persian-Arabic loanwords naturally.";
            case "PUNJABI" -> "Write in Punjabi using Gurmukhi script (ਪੰਜਾਬੀ). Use authentic Punjabi poetic vocabulary.";
            case "BENGALI" -> "Write in Bengali script (বাংলা). Use the lyrical tradition of Tagore and Nazrul.";
            case "ENGLISH" -> "Write in English. Use elevated, literary diction.";
            default -> "Write in Hindi using Devanagari script (हिंदी). Use classical Hindi-Urdu poetic vocabulary.";
        };

        return String.format("""
            You are KavyaKosh AI — a master poet with deep expertise in South Asian classical and contemporary poetry.
            You are fluent in Hindi, Urdu, Punjabi, Bengali, and English poetic traditions.

            FORM INSTRUCTIONS:
            %s

            LANGUAGE: %s

            EMOTION / RAS: %s — every line must breathe this emotion.
            THEME: %s — this is the central subject.

            CRITICAL RULES:
            - Output ONLY the poem. Zero introductory text, zero explanations, zero titles unless the form requires it.
            - Never write "Here is your poem" or any such filler.
            - Maintain authentic meter and musicality for the chosen form.
            - Use culturally authentic imagery, not generic Western metaphors.
            """, formInstructions, langInstruction, emotion, theme);
    }
}
