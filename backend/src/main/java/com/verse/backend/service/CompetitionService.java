package com.verse.backend.service;

import com.verse.backend.document.CompetitionSubmissionDocument;
import com.verse.backend.document.CompetitionVoteDocument;
import com.verse.backend.dto.CompetitionDetailResponseDTO;
import com.verse.backend.dto.SubmitEntryDTO;
import com.verse.backend.entity.Challenge;
import com.verse.backend.repository.ChallengeRepository;
import com.verse.backend.repository.CompetitionSubmissionRepository;
import com.verse.backend.repository.CompetitionVoteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompetitionService {

    private final ChallengeRepository challengeRepository;
    private final CompetitionSubmissionRepository submissionRepository;
    private final CompetitionVoteRepository voteRepository;

    public List<Challenge> getCompetitions() {
        return challengeRepository.findAll();
    }

    public Challenge getCompetitionById(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competition not found with id: " + id));
    }

    public CompetitionDetailResponseDTO getCompetitionDetail(Long id, String username) {
        Challenge challenge = getCompetitionById(id);

        boolean isSubmissionOpen = challenge.getStatus() == Challenge.Status.ACTIVE &&
                (challenge.getDeadline() == null || LocalDateTime.now().isBefore(challenge.getDeadline()));

        boolean isResultsRevealed = challenge.getStatus() == Challenge.Status.CLOSED;

        List<CompetitionSubmissionDocument> leaderboard = submissionRepository.findByCompetitionIdOrderByTotalScoreDesc(id);

        CompetitionSubmissionDocument userSubmission = null;
        List<String> userVotedIds = new ArrayList<>();

        if (username != null && !username.equalsIgnoreCase("anonymous")) {
            userSubmission = submissionRepository.findByCompetitionIdAndAuthorUsername(id, username).orElse(null);
            for (var sub : leaderboard) {
                if (voteRepository.existsByUsernameAndSubmissionId(username, sub.getId())) {
                    userVotedIds.add(sub.getId());
                }
            }
        }

        List<CompetitionSubmissionDocument> winners = new ArrayList<>();
        if (isResultsRevealed && !leaderboard.isEmpty()) {
            winners = leaderboard.stream().limit(3).toList();
            for (int i = 0; i < winners.size(); i++) {
                winners.get(i).setRank(i + 1);
            }
        }

        return CompetitionDetailResponseDTO.builder()
                .competition(challenge)
                .isSubmissionOpen(isSubmissionOpen)
                .isResultsRevealed(isResultsRevealed)
                .userSubmission(userSubmission)
                .leaderboard(leaderboard)
                .winners(winners)
                .userVotedSubmissionIds(userVotedIds)
                .build();
    }

    public CompetitionSubmissionDocument submitEntry(SubmitEntryDTO dto, String username) {
        Challenge challenge = getCompetitionById(dto.getCompetitionId());

        if (challenge.getStatus() != Challenge.Status.ACTIVE) {
            throw new RuntimeException("Submissions are closed for this competition");
        }

        if (challenge.getDeadline() != null && LocalDateTime.now().isAfter(challenge.getDeadline())) {
            throw new RuntimeException("Submission deadline has passed");
        }

        // Check if user already submitted
        var existingOpt = submissionRepository.findByCompetitionIdAndAuthorUsername(dto.getCompetitionId(), username);
        if (existingOpt.isPresent()) {
            throw new RuntimeException("You have already submitted an entry for this competition");
        }

        // Default jury score (assigned 8.5 as initial rating for seed/demo)
        double initialJuryScore = 8.5;
        double initialTotal = (0 * 1.0) + (initialJuryScore * 2.0);

        CompetitionSubmissionDocument submission = CompetitionSubmissionDocument.builder()
                .competitionId(dto.getCompetitionId())
                .title(dto.getTitle())
                .content(dto.getContent())
                .authorUsername(username)
                .votesCount(0)
                .juryScore(initialJuryScore)
                .totalScore(initialTotal)
                .submittedAt(Instant.now())
                .build();

        submission = submissionRepository.save(submission);

        // Increment participant count
        challenge.setParticipantCount((challenge.getParticipantCount() != null ? challenge.getParticipantCount() : 0) + 1);
        challengeRepository.save(challenge);

        return submission;
    }

    public CompetitionSubmissionDocument voteEntry(String submissionId, String username) {
        CompetitionSubmissionDocument submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found with id: " + submissionId));

        var existingVoteOpt = voteRepository.findByUsernameAndSubmissionId(username, submissionId);

        if (existingVoteOpt.isPresent()) {
            voteRepository.delete(existingVoteOpt.get());
            int newVotes = Math.max(0, (submission.getVotesCount() != null ? submission.getVotesCount() : 1) - 1);
            submission.setVotesCount(newVotes);
        } else {
            CompetitionVoteDocument vote = CompetitionVoteDocument.builder()
                    .username(username)
                    .submissionId(submissionId)
                    .votedAt(Instant.now())
                    .build();
            voteRepository.save(vote);
            int newVotes = (submission.getVotesCount() != null ? submission.getVotesCount() : 0) + 1;
            submission.setVotesCount(newVotes);
        }

        // Recalculate composite total score: (votes * 1.0) + (jury * 2.0)
        double jury = submission.getJuryScore() != null ? submission.getJuryScore() : 8.0;
        double newTotal = (submission.getVotesCount() * 1.0) + (jury * 2.0);
        submission.setTotalScore(Math.round(newTotal * 10.0) / 10.0);

        return submissionRepository.save(submission);
    }
}
