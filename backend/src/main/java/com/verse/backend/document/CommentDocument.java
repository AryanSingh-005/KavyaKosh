package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "poem_comments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentDocument {

    @Id
    private String id;

    @Indexed
    private String poemId;

    private String username;
    private String userAvatarUrl;
    private String content;

    @Builder.Default
    private Boolean removed = false;

    private String parentCommentId; // null for top-level, commentId for replies

    @Builder.Default
    private Instant createdAt = Instant.now();
}
