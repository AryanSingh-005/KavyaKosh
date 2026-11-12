package com.verse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GeneratePoemRequest {
    @NotBlank(message = "Prompt or topic is required")
    private String prompt;

    private String emotion;   // ROMANTIC, MELANCHOLY, JOYFUL, MYSTICAL, DEVOTIONAL, PATRIOTIC, INSPIRATIONAL
    private String language;  // HINDI, URDU, ENGLISH, PUNJABI, BENGALI, MARATHI, GUJARATI, TAMIL
    private String theme;     // NATURE, LOVE, SPIRITUALITY, REBELLION, SOLITUDE, NOSTALGIA
    private String form;      // GHAZAL, NAZM, FREE_VERSE, SONNET, HAIKU, RUBA'I, SHAYARI
    private Integer stanzaCount = 3;
}
