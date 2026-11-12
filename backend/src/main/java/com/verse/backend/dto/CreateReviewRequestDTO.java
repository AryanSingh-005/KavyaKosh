package com.verse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateReviewRequestDTO {
    @NotBlank(message = "Poem ID is required")
    private String poemId;

    private String targetReviewer = "EDITORIAL_BOARD";
    private String authorNotes;
}
