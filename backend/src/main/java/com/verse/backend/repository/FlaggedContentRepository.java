package com.verse.backend.repository;

import com.verse.backend.document.FlaggedContentDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FlaggedContentRepository extends MongoRepository<FlaggedContentDocument, String> {
    List<FlaggedContentDocument> findByStatusOrderByCreatedAtDesc(String status);
}
