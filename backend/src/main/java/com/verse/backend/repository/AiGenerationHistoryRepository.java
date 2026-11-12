package com.verse.backend.repository;

import com.verse.backend.document.AiGenerationHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AiGenerationHistoryRepository extends MongoRepository<AiGenerationHistory, String> {
    Page<AiGenerationHistory> findByUsernameOrderByCreatedAtDesc(String username, Pageable pageable);
    List<AiGenerationHistory> findTop20ByUsernameOrderByCreatedAtDesc(String username);
    long countByUsernameAndCreatedAtAfter(String username, Instant after);
    void deleteByIdAndUsername(String id, String username);
}
