package com.verse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmitEntryDTO {
    @NotNull(message = "Competition ID is required")
    private Long competitionId;

    @NotBlank(message = "Entry title is required")
    private String title;

    @NotBlank(message = "Poem entry content is required")
    private String content;
}
