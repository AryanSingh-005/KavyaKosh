package com.verse.backend.repository;

import com.verse.backend.document.DiscussionThreadDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionThreadRepository extends MongoRepository<DiscussionThreadDocument, String> {
    List<DiscussionThreadDocument> findByCategoryOrderByCreatedAtDesc(String category);
    List<DiscussionThreadDocument> findAllByOrderByCreatedAtDesc();
    List<DiscussionThreadDocument> findByAuthorUsernameOrderByCreatedAtDesc(String authorUsername);
}
