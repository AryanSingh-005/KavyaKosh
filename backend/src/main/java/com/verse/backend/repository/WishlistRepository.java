package com.verse.backend.repository;

import com.verse.backend.document.WishlistDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WishlistRepository extends MongoRepository<WishlistDocument, String> {
    Optional<WishlistDocument> findByUsername(String username);
}
