package com.verse.backend.dto;

import com.verse.backend.document.DiscussionThreadDocument;
import com.verse.backend.document.PoemDocument;
import com.verse.backend.document.ReviewRequestDocument;
import com.verse.backend.entity.MarketplaceItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String username;
    private String bio;
    private String avatarUrl;
    private String coverImageUrl;
    private String role;
    private String tier;
    private String memberSince;

    private long followersCount;
    private long followingCount;
    private boolean isFollowing;

    // Aggregated Stats
    private int totalPoems;
    private int totalLikes;
    private int totalViews;
    private double reviewScoreAverage;
    private int currentStreak;
    private int longestStreak;
    private boolean activeToday;

    // Badges & Achievements
    private List<BadgeDTO> badges;

    // Tabs Data
    private List<PoemDocument> poems;
    private List<DiscussionThreadDocument> discussions;
    private List<ReviewRequestDocument> reviews;
    private List<MarketplaceItem> books;
    private List<PoemDocument> savedPoems;
}
