package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "ai_generation_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiGenerationHistory {

    @Id
    private String id;

    @Indexed
    private String username;

    private String type; // GENERATE, REWRITE, EXPAND, RHYME_ASSIST

    private String prompt;
    private String emotion;
    private String language;
    private String theme;
    private String style;

    private String resultText;
    private List<String> keywordsUsed;

    private String providerUsed;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
