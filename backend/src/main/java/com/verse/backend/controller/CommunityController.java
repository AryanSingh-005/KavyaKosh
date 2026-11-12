package com.verse.backend.controller;

import com.verse.backend.document.DiscussionReplyDocument;
import com.verse.backend.document.DiscussionThreadDocument;
import com.verse.backend.dto.CreateDiscussionReplyRequest;
import com.verse.backend.dto.CreateDiscussionRequest;
import com.verse.backend.dto.UserProfileResponse;
import com.verse.backend.service.CommunityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @PostMapping("/follow/{username}")
    public ResponseEntity<Boolean> toggleFollow(
            @PathVariable String username,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        boolean isFollowing = communityService.toggleFollow(username, authentication.getName());
        return ResponseEntity.ok(isFollowing);
    }

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable String username,
            Authentication authentication
    ) {
        String currentUsername = authentication != null ? authentication.getName() : "anonymous";
        UserProfileResponse profile = communityService.getUserProfile(username, currentUsername);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/discussions")
    public ResponseEntity<DiscussionThreadDocument> createDiscussion(
            @Valid @RequestBody CreateDiscussionRequest request,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        DiscussionThreadDocument thread = communityService.createDiscussion(request, authentication.getName());
        return ResponseEntity.ok(thread);
    }

    @GetMapping("/discussions")
    public ResponseEntity<List<DiscussionThreadDocument>> getDiscussions(
            @RequestParam(required = false) String category
    ) {
        List<DiscussionThreadDocument> discussions = communityService.getDiscussions(category);
        return ResponseEntity.ok(discussions);
    }

    @GetMapping("/discussions/{id}")
    public ResponseEntity<DiscussionThreadDocument> getDiscussionDetail(@PathVariable String id) {
        DiscussionThreadDocument thread = communityService.getDiscussionDetail(id);
        return ResponseEntity.ok(thread);
    }

    @PostMapping("/discussions/{id}/replies")
    public ResponseEntity<DiscussionReplyDocument> addReply(
            @PathVariable String id,
            @Valid @RequestBody CreateDiscussionReplyRequest request,
            Authentication authentication
    ) {
        if (authentication == null) return ResponseEntity.status(401).build();
        DiscussionReplyDocument reply = communityService.addReply(id, request, authentication.getName());
        return ResponseEntity.ok(reply);
    }

    @GetMapping("/discussions/{id}/replies")
    public ResponseEntity<List<DiscussionReplyDocument>> getReplies(@PathVariable String id) {
        List<DiscussionReplyDocument> replies = communityService.getReplies(id);
        return ResponseEntity.ok(replies);
    }
}
