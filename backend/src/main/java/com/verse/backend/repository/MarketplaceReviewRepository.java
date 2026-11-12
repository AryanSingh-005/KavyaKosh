package com.verse.backend.repository;

import com.verse.backend.document.MarketplaceReviewDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarketplaceReviewRepository extends MongoRepository<MarketplaceReviewDocument, String> {
    List<MarketplaceReviewDocument> findByItemIdOrderByCreatedAtDesc(Long itemId);
}
