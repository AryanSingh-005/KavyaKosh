package com.verse.backend.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "admin_flagged_content")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlaggedContentDocument {
    @Id
    private String id;
    private String targetType;
    private String targetId;
    private String reason;
    private String status;
    private String flaggedBy;
    @Builder.Default
    private Instant createdAt = Instant.now();
}
