package com.verse.backend.repository;

import com.verse.backend.document.CompetitionSubmissionDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompetitionSubmissionRepository extends MongoRepository<CompetitionSubmissionDocument, String> {
    List<CompetitionSubmissionDocument> findByCompetitionIdOrderByTotalScoreDesc(Long competitionId);
    Optional<CompetitionSubmissionDocument> findByCompetitionIdAndAuthorUsername(Long competitionId, String authorUsername);
    long countByCompetitionId(Long competitionId);
}
