package com.verse.backend.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "competition_submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompetitionSubmissionDocument {

    @Id
    private String id;

    @Indexed
    private Long competitionId;

    private String title;
    private String content;

    @Indexed
    private String authorUsername;

    @Builder.Default
    private Integer votesCount = 0;

    @Builder.Default
    private Double juryScore = 0.0; // 0.0 to 10.0

    @Builder.Default
    private Double totalScore = 0.0; // (votesCount * 1.0) + (juryScore * 2.0)

    private Integer rank; // 1 = Gold, 2 = Silver, 3 = Bronze

    @Builder.Default
    private Instant submittedAt = Instant.now();
}
