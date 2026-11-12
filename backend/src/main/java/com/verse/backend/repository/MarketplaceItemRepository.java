package com.verse.backend.repository;

import com.verse.backend.entity.MarketplaceItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarketplaceItemRepository extends JpaRepository<MarketplaceItem, Long> {

    List<MarketplaceItem> findByFeaturedTrueOrderByReviewCountDesc(Pageable pageable);

    List<MarketplaceItem> findByAuthorIgnoreCase(String author);
}
