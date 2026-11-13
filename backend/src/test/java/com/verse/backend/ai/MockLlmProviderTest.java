package com.verse.backend.ai;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MockLlmProviderTest {

    private MockLlmProvider provider;

    @BeforeEach
    void setUp() {
        provider = new MockLlmProvider();
    }

    @Test
    void testHindiShayariGeneration() {
        String sysPrompt = "You are a poet. Output only the poem.";
        String userPrompt = "Topic / Core Idea: baarish aur tanhai\nPoetic Form: SHAYARI\nEmotion: ROMANTIC\nLanguage: HINDI\nStanzas / Shers: 2";
        String poem = provider.generate(sysPrompt, userPrompt);

        assertNotNull(poem);
        assertTrue(poem.contains("baarish aur tanhai"), "Poem should dynamically weave in the topic");
        assertEquals("mock", provider.getProviderName());
    }

    @Test
    void testEnglishSonnetGeneration() {
        String sysPrompt = "Write a Shakespearean Sonnet.";
        String userPrompt = "Topic / Core Idea: eternal love\nPoetic Form: SONNET\nLanguage: ENGLISH\nStanzas / Shers: 3";
        String poem = provider.generate(sysPrompt, userPrompt);

        assertNotNull(poem);
        assertTrue(poem.contains("eternal love"), "Sonnet should contain topic keyword");
    }

    @Test
    void testUrduGhazalGeneration() {
        String sysPrompt = "Write a Ghazal.";
        String userPrompt = "Topic / Core Idea: ishq\nPoetic Form: GHAZAL\nLanguage: URDU\nStanzas / Shers: 3";
        String poem = provider.generate(sysPrompt, userPrompt);

        assertNotNull(poem);
        assertTrue(poem.contains("ishq"), "Urdu ghazal should contain user topic");
    }

    @Test
    void testPunjabiGeneration() {
        String sysPrompt = "Write a Punjabi poem.";
        String userPrompt = "Topic / Core Idea: chann\nLanguage: PUNJABI\nStanzas / Shers: 2";
        String poem = provider.generate(sysPrompt, userPrompt);

        assertNotNull(poem);
        assertTrue(poem.contains("chann"));
    }

    @Test
    void testBengaliGeneration() {
        String sysPrompt = "Write a Bengali poem.";
        String userPrompt = "Topic / Core Idea: bristi\nLanguage: BENGALI\nStanzas / Shers: 2";
        String poem = provider.generate(sysPrompt, userPrompt);

        assertNotNull(poem);
        assertTrue(poem.contains("bristi"));
    }

    @Test
    void testRewriteMode() {
        String sysPrompt = "You are an editor. Polish the poem.";
        String userPrompt = "Original Poem:\nchandni raat me hum mile\nInstruction: Elevate vocabulary";
        String poem = provider.generate(sysPrompt, userPrompt);

        assertNotNull(poem);
        assertTrue(poem.contains("chandni raat me hum mile"));
    }
}

