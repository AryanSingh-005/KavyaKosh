package com.verse.backend.repository;

import com.verse.backend.document.PoemDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PoemDocumentRepository extends MongoRepository<PoemDocument, String> {

    // Used for checking if MongoDB seed data already exists
    long countByPublishedTrue();

    // Simple single-filter queries (used by ExploreService via MongoTemplate for dynamic combos)
    Page<PoemDocument> findByPublishedTrue(Pageable pageable);

    List<PoemDocument> findTop10ByPublishedTrue();

    List<PoemDocument> findByAuthorUsername(String username);
}
