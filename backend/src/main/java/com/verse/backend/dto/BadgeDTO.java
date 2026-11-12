package com.verse.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private String id;
    private String title;
    private String icon;
    private String description;
    private String category; // POETRY, STREAK, COMMUNITY, MARKETPLACE, PREMIUM
    private boolean earned;
    private LocalDateTime earnedAt;
}
