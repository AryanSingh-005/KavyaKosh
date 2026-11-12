package com.verse.backend.repository;

import com.verse.backend.document.CompetitionVoteDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompetitionVoteRepository extends MongoRepository<CompetitionVoteDocument, String> {
    Optional<CompetitionVoteDocument> findByUsernameAndSubmissionId(String username, String submissionId);
    boolean existsByUsernameAndSubmissionId(String username, String submissionId);
    void deleteByUsernameAndSubmissionId(String username, String submissionId);
}
