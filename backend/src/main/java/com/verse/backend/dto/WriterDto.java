package com.verse.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WriterDto {
    private Long id;
    private String username;
    private String bio;
    private String avatarUrl;
    private Integer followerCount;
    private Integer poemCount;
}
