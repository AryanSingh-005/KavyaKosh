package com.verse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExplorePoemDto {

    private String id;
    private String title;
    private String excerpt;
    private String category;
    private String mood;
    private String theme;
    private String language;
    private List<String> tags;
    private AuthorDto author;
    private Integer likesCount;
    private Integer viewsCount;
    private Integer commentsCount;
    private Double trendingScore;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthorDto {
        private Long userId;
        private String username;
        private String avatarUrl;
    }
}
