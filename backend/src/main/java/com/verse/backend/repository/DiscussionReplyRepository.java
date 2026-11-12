package com.verse.backend.repository;

import com.verse.backend.document.DiscussionReplyDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionReplyRepository extends MongoRepository<DiscussionReplyDocument, String> {
    List<DiscussionReplyDocument> findByThreadIdOrderByCreatedAtAsc(String threadId);
    long countByThreadId(String threadId);
}
