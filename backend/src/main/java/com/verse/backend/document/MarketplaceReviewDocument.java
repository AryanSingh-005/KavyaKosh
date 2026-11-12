package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "marketplace_reviews")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketplaceReviewDocument {

    @Id
    private String id;

    @Indexed
    private Long itemId;

    private String username;
    private Integer rating; // 1-5
    private String comment;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
