package com.verse.backend.controller;

import com.verse.backend.document.ReviewRequestDocument;
import com.verse.backend.dto.SubmitReviewDTO;
import com.verse.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/queue")
    public ResponseEntity<List<ReviewRequestDocument>> getReviewQueue(
            @RequestParam(required = false) String status
    ) {
        List<ReviewRequestDocument> queue = reviewService.getReviewQueue(status);
        return ResponseEntity.ok(queue);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReviewRequestDocument> getReviewDetail(@PathVariable String id) {
        ReviewRequestDocument review = reviewService.getReviewDetail(id);
        return ResponseEntity.ok(review);
    }

    @PostMapping("/{id}/ai-analyze")
    public ResponseEntity<ReviewRequestDocument> triggerAiFirstPass(@PathVariable String id) {
        ReviewRequestDocument response = reviewService.generateAiFirstPass(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ReviewRequestDocument> submitHumanReview(
            @PathVariable String id,
            @Valid @RequestBody SubmitReviewDTO dto,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        ReviewRequestDocument response = reviewService.submitHumanReview(id, dto, authentication.getName());
        return ResponseEntity.ok(response);
    }
}
