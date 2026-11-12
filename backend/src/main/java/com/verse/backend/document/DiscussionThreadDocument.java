package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "community_discussions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionThreadDocument {

    @Id
    private String id;

    private String title;
    private String content;

    @Indexed
    private String authorUsername;

    private String authorAvatarUrl;

    @Indexed
    private String category; // e.g., GHAZAL_METER, CLASSICAL_POETS, CRITIQUE_CIRCLE, GENERAL_DISCUSSION

    private List<String> tags;

    @Builder.Default
    private Integer likesCount = 0;

    @Builder.Default
    private Integer replyCount = 0;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
