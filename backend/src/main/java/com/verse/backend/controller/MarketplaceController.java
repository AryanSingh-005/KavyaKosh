package com.verse.backend.controller;

import com.verse.backend.document.MarketplaceReviewDocument;
import com.verse.backend.dto.BookReviewRequestDTO;
import com.verse.backend.dto.CheckoutRequestDTO;
import com.verse.backend.dto.CheckoutResponseDTO;
import com.verse.backend.entity.MarketplaceItem;
import com.verse.backend.service.MarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/marketplace")
@RequiredArgsConstructor
public class MarketplaceController {

    private final MarketplaceService marketplaceService;

    @GetMapping("/items")
    public ResponseEntity<List<MarketplaceItem>> getItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String sort
    ) {
        List<MarketplaceItem> items = marketplaceService.getItems(search, type, maxPrice, sort);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/items/{id}")
    public ResponseEntity<MarketplaceItem> getItemDetail(@PathVariable Long id) {
        MarketplaceItem item = marketplaceService.getItemDetail(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/items/{id}/similar")
    public ResponseEntity<List<MarketplaceItem>> getSimilarItems(@PathVariable Long id) {
        List<MarketplaceItem> similar = marketplaceService.getSimilarItems(id);
        return ResponseEntity.ok(similar);
    }

    @PostMapping("/wishlist/{itemId}")
    public ResponseEntity<Boolean> toggleWishlist(
            @PathVariable Long itemId,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        boolean isWishlisted = marketplaceService.toggleWishlist(itemId, username);
        return ResponseEntity.ok(isWishlisted);
    }

    @GetMapping("/wishlist/ids")
    public ResponseEntity<Set<Long>> getWishlistIds(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        Set<Long> ids = marketplaceService.getWishlistIds(username);
        return ResponseEntity.ok(ids);
    }

    @GetMapping("/wishlist")
    public ResponseEntity<List<MarketplaceItem>> getWishlistItems(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        List<MarketplaceItem> items = marketplaceService.getWishlistItems(username);
        return ResponseEntity.ok(items);
    }

    @PostMapping("/items/{id}/reviews")
    public ResponseEntity<MarketplaceReviewDocument> addReview(
            @PathVariable Long id,
            @Valid @RequestBody BookReviewRequestDTO dto,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        MarketplaceReviewDocument review = marketplaceService.addReview(id, dto, username);
        return ResponseEntity.ok(review);
    }

    @GetMapping("/items/{id}/reviews")
    public ResponseEntity<List<MarketplaceReviewDocument>> getItemReviews(@PathVariable Long id) {
        List<MarketplaceReviewDocument> reviews = marketplaceService.getItemReviews(id);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping("/checkout")
    public ResponseEntity<CheckoutResponseDTO> processCheckout(
            @Valid @RequestBody CheckoutRequestDTO dto,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        CheckoutResponseDTO response = marketplaceService.processCheckout(dto, username);
        return ResponseEntity.ok(response);
    }
}
