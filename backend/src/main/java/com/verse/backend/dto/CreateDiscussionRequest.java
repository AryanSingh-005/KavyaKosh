package com.verse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateDiscussionRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private String category; // GHAZAL_METER, CLASSICAL_POETS, CRITIQUE_CIRCLE, GENERAL
    private List<String> tags;
}
