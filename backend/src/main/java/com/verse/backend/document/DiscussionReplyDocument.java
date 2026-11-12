package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "discussion_replies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionReplyDocument {

    @Id
    private String id;

    @Indexed
    private String threadId;

    private String authorUsername;
    private String content;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
