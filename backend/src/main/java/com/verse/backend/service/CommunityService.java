package com.verse.backend.service;

import com.verse.backend.document.DiscussionReplyDocument;
import com.verse.backend.document.DiscussionThreadDocument;
import com.verse.backend.document.PoemDocument;
import com.verse.backend.document.UserFollowDocument;
import com.verse.backend.dto.CreateDiscussionReplyRequest;
import com.verse.backend.dto.CreateDiscussionRequest;
import com.verse.backend.dto.UserProfileResponse;
import com.verse.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CommunityService {

    private final UserFollowRepository followRepository;
    private final DiscussionThreadRepository threadRepository;
    private final DiscussionReplyRepository replyRepository;
    private final PoemDocumentRepository poemRepository;

    public boolean toggleFollow(String targetUsername, String followerUsername) {
        if (targetUsername.equalsIgnoreCase(followerUsername)) {
            throw new RuntimeException("You cannot follow yourself");
        }

        var existingOpt = followRepository.findByFollowerUsernameAndFollowingUsername(followerUsername, targetUsername);
        if (existingOpt.isPresent()) {
            followRepository.delete(existingOpt.get());
            log.info("User {} unfollowed {}", followerUsername, targetUsername);
            return false; // Now unfollowed
        } else {
            UserFollowDocument follow = UserFollowDocument.builder()
                    .followerUsername(followerUsername)
                    .followingUsername(targetUsername)
                    .createdAt(Instant.now())
                    .build();
            followRepository.save(follow);
            log.info("User {} followed {}", followerUsername, targetUsername);
            return true; // Now following
        }
    }

    public UserProfileResponse getUserProfile(String targetUsername, String currentUsername) {
        long followersCount = followRepository.countByFollowingUsername(targetUsername);
        long followingCount = followRepository.countByFollowerUsername(targetUsername);

        boolean isFollowing = false;
        if (currentUsername != null && !currentUsername.equalsIgnoreCase("anonymous")) {
            isFollowing = followRepository.existsByFollowerUsernameAndFollowingUsername(currentUsername, targetUsername);
        }

        List<PoemDocument> poems = poemRepository.findByAuthorUsername(targetUsername);
        List<DiscussionThreadDocument> discussions = threadRepository.findByAuthorUsernameOrderByCreatedAtDesc(targetUsername);

        return UserProfileResponse.builder()
                .username(targetUsername)
                .bio("KavyaKosh Community Poet & Literary Enthusiast")
                .avatarUrl(null)
                .followersCount(followersCount)
                .followingCount(followingCount)
                .isFollowing(isFollowing)
                .poems(poems)
                .discussions(discussions)
                .build();
    }

    public DiscussionThreadDocument createDiscussion(CreateDiscussionRequest request, String username) {
        DiscussionThreadDocument thread = DiscussionThreadDocument.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .category(request.getCategory() != null ? request.getCategory() : "GENERAL")
                .tags(request.getTags() != null ? request.getTags() : List.of("poetry", "discussion"))
                .authorUsername(username)
                .likesCount(0)
                .replyCount(0)
                .createdAt(Instant.now())
                .build();

        return threadRepository.save(thread);
    }

    public List<DiscussionThreadDocument> getDiscussions(String category) {
        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category)) {
            return threadRepository.findByCategoryOrderByCreatedAtDesc(category);
        }
        return threadRepository.findAllByOrderByCreatedAtDesc();
    }

    public DiscussionThreadDocument getDiscussionDetail(String threadId) {
        return threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Discussion thread not found with id: " + threadId));
    }

    public DiscussionReplyDocument addReply(String threadId, CreateDiscussionReplyRequest request, String username) {
        DiscussionThreadDocument thread = getDiscussionDetail(threadId);

        DiscussionReplyDocument reply = DiscussionReplyDocument.builder()
                .threadId(threadId)
                .authorUsername(username)
                .content(request.getContent())
                .createdAt(Instant.now())
                .build();

        reply = replyRepository.save(reply);

        // Increment reply count on thread
        thread.setReplyCount((thread.getReplyCount() != null ? thread.getReplyCount() : 0) + 1);
        threadRepository.save(thread);

        return reply;
    }

    public List<DiscussionReplyDocument> getReplies(String threadId) {
        return replyRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }
}
