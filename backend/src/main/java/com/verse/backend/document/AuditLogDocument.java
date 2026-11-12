package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDocument {

    @Id
    private String id;

    @Indexed
    private String adminUsername;

    private String action; // e.g. SUSPEND_USER, CHANGE_ROLE, REMOVE_POEM, OVERRIDE_REVIEW_SCORE, EDIT_COMPETITION, ISSUE_REFUND, UPDATE_SETTINGS

    private String targetType; // USER, POEM, COMMENT, REVIEW, COMPETITION, MARKETPLACE, SUBSCRIPTION, SETTINGS

    private String targetId;

    private String details;

    @Builder.Default
    private Instant timestamp = Instant.now();
}
