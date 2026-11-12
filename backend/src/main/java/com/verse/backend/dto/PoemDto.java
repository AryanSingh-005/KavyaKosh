package com.verse.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class PoemDto {
    private Long id;
    private String title;
    private String excerpt;
    private String category;
    private Integer likesCount;
    private Integer viewsCount;
    private Integer commentsCount;
    private LocalDateTime createdAt;
    private WriterDto author;
}
