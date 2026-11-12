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

@Document(collection = "poem_review_requests")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestDocument {

    @Id
    private String id;

    @Indexed
    private String poemId;

    private String poemTitle;
    private String poemContent;

    @Indexed
    private String authorUsername;

    private String targetReviewer; // e.g. EDITORIAL_BOARD, SENIOR_POET

    private String authorNotes;

    /** Set to true for LITE/PRO subscribers — sorts to top of the review queue */
    @Builder.Default
    private boolean isPriority = false;

    @Builder.Default
    private String status = "PENDING"; // PENDING, IN_REVIEW, COMPLETED

    // ── 5-Category Scores (1-10) ──
    private Integer emotionScore;
    private Integer creativityScore;
    private Integer rhythmScore;
    private Integer imageryScore;
    private Integer symbolismScore;
    private Double overallScore;

    // ── AI First-Pass Analysis ──
    private Integer aiEmotionScore;
    private Integer aiCreativityScore;
    private Integer aiRhythmScore;
    private Integer aiImageryScore;
    private Integer aiSymbolismScore;
    private List<String> aiStrengths;
    private List<String> aiImprovements;
    private String aiSummary;

    // ── Human Reviewer Feedback ──
    private String reviewerUsername;
    private String reviewerFeedback;
    private List<LineSuggestion> lineSuggestions;

    @Builder.Default
    private Instant createdAt = Instant.now();

    private Instant reviewedAt;
    private Instant updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LineSuggestion {
        private Integer lineIndex;
        private String originalLine;
        private String suggestedLine;
        private String comment;
    }
}
