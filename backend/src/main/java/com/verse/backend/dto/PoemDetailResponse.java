package com.verse.backend.dto;

import com.verse.backend.document.CommentDocument;
import com.verse.backend.document.PoemDocument;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PoemDetailResponse {
    private PoemDocument poem;
    private boolean isLiked;
    private boolean isSaved;
    private boolean isReviewRequested;
    private String reviewStatus;
    private List<CommentDocument> comments;
}
