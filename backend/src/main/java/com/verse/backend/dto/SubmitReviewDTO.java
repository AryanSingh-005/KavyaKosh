package com.verse.backend.dto;

import com.verse.backend.document.ReviewRequestDocument.LineSuggestion;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.List;

@Data
public class SubmitReviewDTO {

    @Min(value = 1, message = "Emotion score must be between 1 and 10")
    @Max(value = 10, message = "Emotion score must be between 1 and 10")
    private Integer emotionScore;

    @Min(value = 1, message = "Creativity score must be between 1 and 10")
    @Max(value = 10, message = "Creativity score must be between 1 and 10")
    private Integer creativityScore;

    @Min(value = 1, message = "Rhythm score must be between 1 and 10")
    @Max(value = 10, message = "Rhythm score must be between 1 and 10")
    private Integer rhythmScore;

    @Min(value = 1, message = "Imagery score must be between 1 and 10")
    @Max(value = 10, message = "Imagery score must be between 1 and 10")
    private Integer imageryScore;

    @Min(value = 1, message = "Symbolism score must be between 1 and 10")
    @Max(value = 10, message = "Symbolism score must be between 1 and 10")
    private Integer symbolismScore;

    private String reviewerFeedback;
    private List<LineSuggestion> lineSuggestions;
}
