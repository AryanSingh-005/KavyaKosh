package com.verse.backend.repository;

import com.verse.backend.document.ReviewRequestDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRequestRepository extends MongoRepository<ReviewRequestDocument, String> {
    List<ReviewRequestDocument> findByAuthorUsernameOrderByCreatedAtDesc(String authorUsername);
    List<ReviewRequestDocument> findByPoemId(String poemId);
}
