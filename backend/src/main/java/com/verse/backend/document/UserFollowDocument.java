package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "user_follows")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "follower_following_idx", def = "{'followerUsername': 1, 'followingUsername': 1}", unique = true)
public class UserFollowDocument {

    @Id
    private String id;

    private String followerUsername;
    private String followingUsername;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
