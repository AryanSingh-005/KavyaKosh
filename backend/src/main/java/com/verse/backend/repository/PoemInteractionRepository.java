package com.verse.backend.repository;

import com.verse.backend.document.PoemInteractionDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PoemInteractionRepository extends MongoRepository<PoemInteractionDocument, String> {
    Optional<PoemInteractionDocument> findByUsernameAndPoemId(String username, String poemId);

    List<PoemInteractionDocument> findByUsername(String username);
}
