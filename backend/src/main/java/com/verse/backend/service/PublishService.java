package com.verse.backend.service;

import com.verse.backend.document.CommentDocument;
import com.verse.backend.document.PoemDocument;
import com.verse.backend.document.PoemInteractionDocument;
import com.verse.backend.document.ReviewRequestDocument;
import com.verse.backend.dto.*;
import com.verse.backend.repository.CommentDocumentRepository;
import com.verse.backend.repository.PoemDocumentRepository;
import com.verse.backend.repository.PoemInteractionRepository;
import com.verse.backend.repository.ReviewRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PublishService {

    private final PoemDocumentRepository poemRepository;
    private final PoemInteractionRepository interactionRepository;
    private final CommentDocumentRepository commentRepository;
    private final ReviewRequestRepository reviewRequestRepository;
    private final StreakService streakService;
    private final com.verse.backend.repository.UserRepository userRepository;
    private final NotificationService notificationService;

    public PoemDocument createPoem(PublishRequest request, String username) {
        log.info("Creating new poem for user: {}, title: {}", username, request.getTitle());

        String excerpt = request.getExcerpt();
        if (excerpt == null || excerpt.isBlank()) {
            String content = request.getContent();
            excerpt = content.length() > 150 ? content.substring(0, 150) + "..." : content;
        }

        PoemDocument poem = PoemDocument.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .excerpt(excerpt)
                .category(request.getCategory() != null ? request.getCategory() : "Free Verse")
                .mood(request.getMood() != null ? request.getMood() : "ROMANTIC")
                .theme(request.getTheme() != null ? request.getTheme() : "LOVE")
                .language(request.getLanguage() != null ? request.getLanguage() : "HINDI")
                .tags(request.getTags() != null ? request.getTags() : List.of())
                .published(request.getPublished() != null ? request.getPublished() : true)
                .author(PoemDocument.AuthorSnapshot.builder()
                        .userId(1L)
                        .username(username)
                        .avatarUrl(null)
                        .bio("KavyaKosh Poet")
                        .build())
                .likesCount(0)
                .viewsCount(0)
                .commentsCount(0)
                .trendingScore(50.0)
                .createdAt(LocalDateTime.now())
                .build();

        PoemDocument savedPoem = poemRepository.save(poem);

        // Record writing activity to increment/maintain writing streak
        userRepository.findByUsername(username).ifPresent(streakService::recordWritingActivity);

        return savedPoem;
    }

    public PoemDocument updatePoem(String poemId, PublishRequest request, String username) {
        PoemDocument poem = poemRepository.findById(poemId)
                .orElseThrow(() -> new RuntimeException("Poem not found with id: " + poemId));

        if (!poem.getAuthor().getUsername().equalsIgnoreCase(username)) {
            throw new RuntimeException("Unauthorized to edit this poem");
        }

        poem.setTitle(request.getTitle());
        poem.setContent(request.getContent());
        if (request.getExcerpt() != null && !request.getExcerpt().isBlank()) {
            poem.setExcerpt(request.getExcerpt());
        }
        if (request.getCategory() != null) poem.setCategory(request.getCategory());
        if (request.getMood() != null) poem.setMood(request.getMood());
        if (request.getTheme() != null) poem.setTheme(request.getTheme());
        if (request.getLanguage() != null) poem.setLanguage(request.getLanguage());
        if (request.getTags() != null) poem.setTags(request.getTags());
        if (request.getPublished() != null) poem.setPublished(request.getPublished());

        return poemRepository.save(poem);
    }

    public PoemDetailResponse getPoemDetail(String poemId, String username) {
        PoemDocument poem = poemRepository.findById(poemId)
                .orElseThrow(() -> new RuntimeException("Poem not found with id: " + poemId));

        // Increment view count
        poem.setViewsCount((poem.getViewsCount() != null ? poem.getViewsCount() : 0) + 1);
        poemRepository.save(poem);

        boolean isLiked = false;
        boolean isSaved = false;

        if (username != null && !username.equalsIgnoreCase("anonymous")) {
            var interactionOpt = interactionRepository.findByUsernameAndPoemId(username, poemId);
            if (interactionOpt.isPresent()) {
                isLiked = interactionOpt.get().isLiked();
                isSaved = interactionOpt.get().isSaved();
            }
        }

        List<CommentDocument> comments = commentRepository.findByPoemIdOrderByCreatedAtDesc(poemId);
        List<ReviewRequestDocument> reviews = reviewRequestRepository.findByPoemId(poemId);

        boolean isReviewRequested = !reviews.isEmpty();
        String reviewStatus = isReviewRequested ? reviews.get(0).getStatus() : null;

        return PoemDetailResponse.builder()
                .poem(poem)
                .isLiked(isLiked)
                .isSaved(isSaved)
                .isReviewRequested(isReviewRequested)
                .reviewStatus(reviewStatus)
                .comments(comments)
                .build();
    }

    public PoemDetailResponse toggleLike(String poemId, String username) {
        PoemDocument poem = poemRepository.findById(poemId)
                .orElseThrow(() -> new RuntimeException("Poem not found with id: " + poemId));

        PoemInteractionDocument interaction = interactionRepository.findByUsernameAndPoemId(username, poemId)
                .orElseGet(() -> PoemInteractionDocument.builder()
                        .username(username)
                        .poemId(poemId)
                        .liked(false)
                        .saved(false)
                        .build());

        boolean newLikedState = !interaction.isLiked();
        interaction.setLiked(newLikedState);
        interaction.setUpdatedAt(Instant.now());
        interactionRepository.save(interaction);

        // Update persisted likesCount on poem document
        int currentLikes = poem.getLikesCount() != null ? poem.getLikesCount() : 0;
        int updatedLikes = newLikedState ? currentLikes + 1 : Math.max(0, currentLikes - 1);
        poem.setLikesCount(updatedLikes);

        // Update trending score
        poem.setTrendingScore(updatedLikes * 10.0 + (poem.getCommentsCount() != null ? poem.getCommentsCount() : 0) * 5.0);
        poemRepository.save(poem);

        // Dispatch LIKE notification to author if newly liked
        if (newLikedState && poem.getAuthor() != null && poem.getAuthor().getUsername() != null) {
            notificationService.sendNotification(
                    poem.getAuthor().getUsername(),
                    username,
                    "LIKE",
                    "❤️ New Like on your poem!",
                    String.format("@%s liked your poem '%s'", username, poem.getTitle()),
                    "/poems/" + poemId
            );
        }

        return getPoemDetail(poemId, username);
    }

    public PoemDetailResponse toggleSave(String poemId, String username) {
        PoemDocument poem = poemRepository.findById(poemId)
                .orElseThrow(() -> new RuntimeException("Poem not found with id: " + poemId));

        PoemInteractionDocument interaction = interactionRepository.findByUsernameAndPoemId(username, poemId)
                .orElseGet(() -> PoemInteractionDocument.builder()
                        .username(username)
                        .poemId(poemId)
                        .liked(false)
                        .saved(false)
                        .build());

        boolean newSavedState = !interaction.isSaved();
        interaction.setSaved(newSavedState);
        interaction.setUpdatedAt(Instant.now());
        interactionRepository.save(interaction);

        return getPoemDetail(poemId, username);
    }

    public CommentDocument addComment(String poemId, CommentRequest request, String username) {
        PoemDocument poem = poemRepository.findById(poemId)
                .orElseThrow(() -> new RuntimeException("Poem not found with id: " + poemId));

        CommentDocument comment = CommentDocument.builder()
                .poemId(poemId)
                .username(username)
                .userAvatarUrl(null)
                .content(request.getContent())
                .createdAt(Instant.now())
                .build();

        comment = commentRepository.save(comment);

        // Increment comment count on poem
        int currentComments = poem.getCommentsCount() != null ? poem.getCommentsCount() : 0;
        poem.setCommentsCount(currentComments + 1);
        poem.setTrendingScore((poem.getLikesCount() != null ? poem.getLikesCount() : 0) * 10.0 + (currentComments + 1) * 5.0);
        poemRepository.save(poem);

        // Dispatch COMMENT notification to author
        if (poem.getAuthor() != null && poem.getAuthor().getUsername() != null) {
            notificationService.sendNotification(
                    poem.getAuthor().getUsername(),
                    username,
                    "COMMENT",
                    "💬 New Comment on your poem!",
                    String.format("@%s commented: '%s'", username, request.getContent().length() > 60 ? request.getContent().substring(0, 60) + "..." : request.getContent()),
                    "/poems/" + poemId
            );
        }

        return comment;
    }

    public List<CommentDocument> getComments(String poemId) {
        return commentRepository.findByPoemIdOrderByCreatedAtDesc(poemId);
    }

    public ReviewRequestDocument requestReview(CreateReviewRequestDTO request, String username) {
        PoemDocument poem = poemRepository.findById(request.getPoemId())
                .orElseThrow(() -> new RuntimeException("Poem not found with id: " + request.getPoemId()));

        ReviewRequestDocument reviewReq = ReviewRequestDocument.builder()
                .poemId(poem.getId())
                .poemTitle(poem.getTitle())
                .poemContent(poem.getContent())
                .authorUsername(username)
                .targetReviewer(request.getTargetReviewer() != null ? request.getTargetReviewer() : "EDITORIAL_BOARD")
                .authorNotes(request.getAuthorNotes())
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        return reviewRequestRepository.save(reviewReq);
    }

    public List<PoemDocument> getMyPoems(String username) {
        return poemRepository.findByAuthorUsername(username);
    }

    public List<ReviewRequestDocument> getMyReviewRequests(String username) {
        return reviewRequestRepository.findByAuthorUsernameOrderByCreatedAtDesc(username);
    }

    public void deletePoem(String poemId, String username) {
        PoemDocument poem = poemRepository.findById(poemId)
                .orElseThrow(() -> new RuntimeException("Poem not found with id: " + poemId));

        if (!poem.getAuthor().getUsername().equalsIgnoreCase(username)) {
            throw new RuntimeException("Unauthorized to delete this poem");
        }

        poemRepository.deleteById(poemId);
    }
}
