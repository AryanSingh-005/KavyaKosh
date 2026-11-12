package com.verse.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ChallengeDto {
    private Long id;
    private String title;
    private String description;
    private String theme;
    private Integer participantCount;
    private LocalDateTime deadline;
    private String status;
    private String prizeDescription;
}
