package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "user_wishlists")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Builder.Default
    private Set<Long> itemIds = new HashSet<>();

    private Instant updatedAt;
}
