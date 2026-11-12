package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "competition_votes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@CompoundIndex(name = "user_submission_vote_idx", def = "{'username': 1, 'submissionId': 1}", unique = true)
public class CompetitionVoteDocument {

    @Id
    private String id;

    private String username;
    private String submissionId;

    @Builder.Default
    private Instant votedAt = Instant.now();
}
