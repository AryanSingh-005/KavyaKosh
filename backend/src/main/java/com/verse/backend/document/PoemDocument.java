package com.verse.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.TextIndexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

/**
 * MongoDB document for the Explore feed.
 * Separate from the JPA Poem entity; allows flexible querying and full-text search.
 */
@Document(collection = "explore_poems")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PoemDocument {

    @Id
    private String id;

    @TextIndexed(weight = 3)
    private String title;

    @TextIndexed(weight = 2)
    private String excerpt;

    @TextIndexed
    private String content;

    /** e.g. Ghazal, Haiku, Nazm, Sonnet, Free Verse, Doha */
    @Indexed
    private String category;

    /** e.g. Romance, Melancholy, Devotion, Nature, Philosophy, Rebellion, Joy */
    @Indexed
    private String mood;

    /** e.g. Love, Loss, Spirituality, Freedom, Identity, Seasons, Patriotism */
    @Indexed
    private String theme;

    /** e.g. Hindi, Urdu, English, Punjabi, Bengali, Tamil */
    @Indexed
    private String language;

    /** Searchable tags e.g. ["monsoon", "separation", "ghazal"] */
    @TextIndexed
    private List<String> tags;

    /** Embedded author snapshot (denormalized for performance) */
    private AuthorSnapshot author;

    @Builder.Default
    private Integer likesCount = 0;

    @Builder.Default
    private Integer viewsCount = 0;

    @Builder.Default
    private Integer commentsCount = 0;

    /** Composite trending score (higher = more trending) */
    @Indexed
    @Builder.Default
    private Double trendingScore = 0.0;

    @Builder.Default
    private Boolean published = true;

    @Builder.Default
    private Boolean featured = false;

    private LocalDateTime createdAt;

    /** Lightweight author snapshot embedded in each poem document */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthorSnapshot {
        private Long userId;
        private String username;
        private String avatarUrl;
        private String bio;
    }
}
