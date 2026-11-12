package com.verse.backend.controller;

import com.verse.backend.document.CompetitionSubmissionDocument;
import com.verse.backend.dto.CompetitionDetailResponseDTO;
import com.verse.backend.dto.SubmitEntryDTO;
import com.verse.backend.entity.Challenge;
import com.verse.backend.service.CompetitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/competitions")
@RequiredArgsConstructor
public class CompetitionController {

    private final CompetitionService competitionService;

    /** List all competitions */
    @GetMapping
    public ResponseEntity<List<Challenge>> listCompetitions() {
        return ResponseEntity.ok(competitionService.getCompetitions());
    }

    /** Get full detail for one competition (includes leaderboard, user-state) */
    @GetMapping("/{id}")
    public ResponseEntity<CompetitionDetailResponseDTO> getCompetitionDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        return ResponseEntity.ok(competitionService.getCompetitionDetail(id, username));
    }

    /** Submit a poem entry */
    @PostMapping("/submit")
    public ResponseEntity<CompetitionSubmissionDocument> submitEntry(
            @RequestBody SubmitEntryDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(competitionService.submitEntry(dto, userDetails.getUsername()));
    }

    /** Toggle vote on a submission (up/down) */
    @PostMapping("/submissions/{submissionId}/vote")
    public ResponseEntity<CompetitionSubmissionDocument> vote(
            @PathVariable String submissionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(competitionService.voteEntry(submissionId, userDetails.getUsername()));
    }
}
