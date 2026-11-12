package com.verse.backend.repository;

import com.verse.backend.document.CommentDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentDocumentRepository extends MongoRepository<CommentDocument, String> {
    List<CommentDocument> findByPoemIdOrderByCreatedAtDesc(String poemId);
    long countByPoemId(String poemId);
}
