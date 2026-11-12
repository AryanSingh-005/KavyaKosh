package com.verse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class PublishRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Poem content is required")
    private String content;

    private String excerpt;
    private String category;  // GHAZAL, NAZM, SONNET, FREE_VERSE, SHAYARI, HAIKU
    private String mood;      // ROMANTIC, MELANCHOLY, MYSTICAL, JOYFUL, DEVOTIONAL, INSPIRATIONAL
    private String theme;     // LOVE, SOLITUDE, NATURE, NOSTALGIA, SPIRITUALITY, REBELLION
    private String language;  // HINDI, URDU, ENGLISH, PUNJABI, BENGALI
    private List<String> tags;
    private Boolean published = true;
}
