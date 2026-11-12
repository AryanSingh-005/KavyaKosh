package com.verse.backend.controller;

import com.verse.backend.document.CommentDocument;
import com.verse.backend.document.PoemDocument;
import com.verse.backend.document.ReviewRequestDocument;
import com.verse.backend.dto.*;
import com.verse.backend.service.PublishService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/publish")
@RequiredArgsConstructor
public class PublishController {

    private final PublishService publishService;

    @PostMapping
    public ResponseEntity<PoemDocument> createPoem(
            @Valid @RequestBody PublishRequest request,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        PoemDocument poem = publishService.createPoem(request, authentication.getName());
        return ResponseEntity.ok(poem);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PoemDocument> updatePoem(
            @PathVariable String id,
            @Valid @RequestBody PublishRequest request,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        PoemDocument poem = publishService.updatePoem(id, request, authentication.getName());
        return ResponseEntity.ok(poem);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PoemDetailResponse> getPoemDetail(
            @PathVariable String id,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        PoemDetailResponse response = publishService.getPoemDetail(id, username);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePoem(
            @PathVariable String id,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        publishService.deletePoem(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<PoemDetailResponse> toggleLike(
            @PathVariable String id,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        PoemDetailResponse response = publishService.toggleLike(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/save")
    public ResponseEntity<PoemDetailResponse> toggleSave(
            @PathVariable String id,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        PoemDetailResponse response = publishService.toggleSave(id, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentDocument> addComment(
            @PathVariable String id,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        CommentDocument comment = publishService.addComment(id, request, authentication.getName());
        return ResponseEntity.ok(comment);
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<List<CommentDocument>> getComments(@PathVariable String id) {
        List<CommentDocument> comments = publishService.getComments(id);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/request-review")
    public ResponseEntity<ReviewRequestDocument> requestReview(
            @Valid @RequestBody CreateReviewRequestDTO request,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        ReviewRequestDocument review = publishService.requestReview(request, authentication.getName());
        return ResponseEntity.ok(review);
    }

    @GetMapping("/my-poems")
    public ResponseEntity<List<PoemDocument>> getMyPoems(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        List<PoemDocument> poems = publishService.getMyPoems(username);
        return ResponseEntity.ok(poems);
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<ReviewRequestDocument>> getMyReviewRequests(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        List<ReviewRequestDocument> reviews = publishService.getMyReviewRequests(username);
        return ResponseEntity.ok(reviews);
    }
}
