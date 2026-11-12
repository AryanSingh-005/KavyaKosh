package com.verse.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateDiscussionReplyRequest {
    @NotBlank(message = "Reply text cannot be blank")
    private String content;
}
