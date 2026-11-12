package com.verse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerationResponse {
    private String historyId;
    private String type; // GENERATE, REWRITE
    private String generatedText;
    private String form;
    private String emotion;
    private String language;
    private String theme;
    private String prompt;
    private Instant createdAt;
}
