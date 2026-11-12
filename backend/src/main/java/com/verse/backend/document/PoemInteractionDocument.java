package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "poem_interactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "user_poem_idx", def = "{'username': 1, 'poemId': 1}", unique = true)
public class PoemInteractionDocument {

    @Id
    private String id;

    private String username;
    private String poemId;

    @Builder.Default
    private boolean liked = false;

    @Builder.Default
    private boolean saved = false;

    private Instant updatedAt;
}
