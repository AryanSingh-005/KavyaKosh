package com.verse.backend.repository;

import com.verse.backend.document.OrderDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderDocumentRepository extends MongoRepository<OrderDocument, String> {
    List<OrderDocument> findByUsernameOrderByCreatedAtDesc(String username);
}
