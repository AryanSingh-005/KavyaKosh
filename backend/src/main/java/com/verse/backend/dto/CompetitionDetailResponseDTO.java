package com.verse.backend.dto;

import com.verse.backend.document.CompetitionSubmissionDocument;
import com.verse.backend.entity.Challenge;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompetitionDetailResponseDTO {
    private Challenge competition;
    private boolean isSubmissionOpen;
    private boolean isResultsRevealed;

    private CompetitionSubmissionDocument userSubmission;
    private List<CompetitionSubmissionDocument> leaderboard;
    private List<CompetitionSubmissionDocument> winners; // Top 3 when results revealed
    private List<String> userVotedSubmissionIds;
}
