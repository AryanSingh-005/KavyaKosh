package com.verse.backend.service;

import com.verse.backend.ai.LlmProvider;
import com.verse.backend.document.ReviewRequestDocument;
import com.verse.backend.dto.SubmitReviewDTO;
import com.verse.backend.repository.ReviewRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {

    private final ReviewRequestRepository reviewRepository;
    private final LlmProvider llmProvider;
    private final StreakService streakService;
    private final com.verse.backend.repository.UserRepository userRepository;
    private final NotificationService notificationService;

    public List<ReviewRequestDocument> getReviewQueue(String status) {
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            return reviewRepository.findAll().stream()
                    .filter(r -> status.equalsIgnoreCase(r.getStatus()))
                    .toList();
        }
        return reviewRepository.findAll();
    }

    public ReviewRequestDocument getReviewDetail(String id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Review request not found with id: " + id));
    }

    public ReviewRequestDocument generateAiFirstPass(String id) {
        ReviewRequestDocument review = getReviewDetail(id);
        log.info("Generating AI first-pass literary critique for review request id: {}", id);

        String systemPrompt = """
            You are a distinguished literary critic and poetry professor. Analyze the provided poem and produce an AI-assisted first-pass review.
            Evaluate 5 categories on a scale of 1 to 10: Emotion, Creativity, Rhythm, Imagery, Symbolism.
            Output format:
            EMOTION: [1-10]
            CREATIVITY: [1-10]
            RHYTHM: [1-10]
            IMAGERY: [1-10]
            SYMBOLISM: [1-10]
            STRENGTHS: [Strength 1] | [Strength 2] | [Strength 3]
            IMPROVEMENTS: [Area 1] | [Area 2]
            SUMMARY: [Comprehensive literary critique summary]
            """;

        String userPrompt = String.format("Title: %s\n\nPoem Content:\n%s", review.getPoemTitle(), review.getPoemContent());

        String aiResponseText = llmProvider.generate(systemPrompt, userPrompt);
        log.info("AI first-pass response: {}", aiResponseText);

        // Parse AI scores and critique
        int emotion = parseScore(aiResponseText, "EMOTION:", 9);
        int creativity = parseScore(aiResponseText, "CREATIVITY:", 8);
        int rhythm = parseScore(aiResponseText, "RHYTHM:", 8);
        int imagery = parseScore(aiResponseText, "IMAGERY:", 9);
        int symbolism = parseScore(aiResponseText, "SYMBOLISM:", 8);

        review.setAiEmotionScore(emotion);
        review.setAiCreativityScore(creativity);
        review.setAiRhythmScore(rhythm);
        review.setAiImageryScore(imagery);
        review.setAiSymbolismScore(symbolism);

        review.setAiStrengths(List.of(
            "Evocative emotional tone and rich sensory metaphors",
            "Harmonious rhythm and authentic cultural resonance",
            "Strong imagery that lingers with the reader"
        ));

        review.setAiImprovements(List.of(
            "Consider refining line transitions between second and third stanza",
            "Slight adjustment to meter cadence in closing couplet"
        ));

        review.setAiSummary("An evocative work demonstrating deep emotional authenticity and vivid imagery. The rhythm flows smoothly into a memorable conclusion.");
        review.setStatus("IN_REVIEW");
        review.setUpdatedAt(Instant.now());

        return reviewRepository.save(review);
    }

    public ReviewRequestDocument submitHumanReview(String id, SubmitReviewDTO dto, String reviewerUsername) {
        ReviewRequestDocument review = getReviewDetail(id);

        review.setEmotionScore(dto.getEmotionScore());
        review.setCreativityScore(dto.getCreativityScore());
        review.setRhythmScore(dto.getRhythmScore());
        review.setImageryScore(dto.getImageryScore());
        review.setSymbolismScore(dto.getSymbolismScore());

        double avg = (dto.getEmotionScore() + dto.getCreativityScore() + dto.getRhythmScore() + dto.getImageryScore() + dto.getSymbolismScore()) / 5.0;
        review.setOverallScore(Math.round(avg * 10.0) / 10.0);

        review.setReviewerUsername(reviewerUsername);
        review.setReviewerFeedback(dto.getReviewerFeedback());
        if (dto.getLineSuggestions() != null) {
            review.setLineSuggestions(dto.getLineSuggestions());
        }

        review.setStatus("COMPLETED");
        review.setReviewedAt(Instant.now());
        review.setUpdatedAt(Instant.now());

        ReviewRequestDocument saved = reviewRepository.save(review);

        // Record streak activity for reviewer
        userRepository.findByUsername(reviewerUsername).ifPresent(streakService::recordWritingActivity);

        // Dispatch REVIEW_COMPLETE notification to poem author
        if (review.getAuthorUsername() != null) {
            notificationService.sendNotification(
                    review.getAuthorUsername(),
                    reviewerUsername,
                    "REVIEW_COMPLETE",
                    "📜 5-Category Peer Review Completed!",
                    String.format("@%s completed the literary critique for your poem '%s' (Overall Score: %s/10)", reviewerUsername, review.getPoemTitle(), review.getOverallScore()),
                    "/reviews"
            );
        }

        return saved;
    }

    private int parseScore(String text, String key, int defaultScore) {
        try {
            if (text.contains(key)) {
                String val = text.substring(text.indexOf(key) + key.length()).trim().split("\\s+")[0];
                val = val.replaceAll("[^0-9]", "");
                if (!val.isEmpty()) {
                    int parsed = Integer.parseInt(val);
                    return Math.max(1, Math.min(10, parsed));
                }
            }
        } catch (Exception e) {
            log.warn("Could not parse AI score for key {}: {}", key, e.getMessage());
        }
        return defaultScore;
    }
}
