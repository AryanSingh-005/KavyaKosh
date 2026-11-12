package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "user_notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDocument {

    @Id
    private String id;

    @Indexed
    private String recipientUsername;

    private String actorUsername; // Username of person who performed action (or "SYSTEM")

    private String type; // LIKE, COMMENT, REVIEW_COMPLETE, COMPETITION_RESULT, FEATURED_POEM

    private String title;

    private String message;

    private String linkUrl;

    @Builder.Default
    private boolean isRead = false;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
