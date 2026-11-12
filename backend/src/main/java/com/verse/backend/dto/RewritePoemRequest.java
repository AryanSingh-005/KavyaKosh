package com.verse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RewritePoemRequest {
    @NotBlank(message = "Original poem text is required")
    private String originalText;

    private String instruction; // e.g. "Make it more poetic", "Add rhyming couplets", "Translate to Hindi", "Change tone to melancholic"
    private String targetEmotion;
    private String targetLanguage;
    private String targetStyle; // CLASSICAL, MODERN, METAPHORIC, MINIMALIST
}
