package com.verse.backend.service;

import com.verse.backend.document.MarketplaceReviewDocument;
import com.verse.backend.document.OrderDocument;
import com.verse.backend.document.WishlistDocument;
import com.verse.backend.dto.BookReviewRequestDTO;
import com.verse.backend.dto.CheckoutRequestDTO;
import com.verse.backend.dto.CheckoutResponseDTO;
import com.verse.backend.entity.MarketplaceItem;
import com.verse.backend.entity.Subscription;
import com.verse.backend.entity.User;
import com.verse.backend.repository.MarketplaceItemRepository;
import com.verse.backend.repository.MarketplaceReviewRepository;
import com.verse.backend.repository.OrderDocumentRepository;
import com.verse.backend.repository.UserRepository;
import com.verse.backend.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketplaceService {

    private final MarketplaceItemRepository itemRepository;
    private final WishlistRepository wishlistRepository;
    private final MarketplaceReviewRepository reviewRepository;
    private final OrderDocumentRepository orderRepository;
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    public List<MarketplaceItem> getItems(String search, String type, BigDecimal maxPrice, String sort) {
        List<MarketplaceItem> items = itemRepository.findAll();

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            items = items.stream()
                    .filter(i -> i.getName().toLowerCase().contains(q) ||
                            (i.getAuthor() != null && i.getAuthor().toLowerCase().contains(q)) ||
                            (i.getDescription() != null && i.getDescription().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }

        if (type != null && !type.isBlank() && !"ALL".equalsIgnoreCase(type)) {
            items = items.stream()
                    .filter(i -> type.equalsIgnoreCase(i.getType()))
                    .collect(Collectors.toList());
        }

        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) > 0) {
            items = items.stream()
                    .filter(i -> i.getPrice().compareTo(maxPrice) <= 0)
                    .collect(Collectors.toList());
        }

        if ("price_asc".equalsIgnoreCase(sort)) {
            items.sort(Comparator.comparing(MarketplaceItem::getPrice));
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            items.sort(Comparator.comparing(MarketplaceItem::getPrice).reversed());
        } else if ("rating".equalsIgnoreCase(sort)) {
            items.sort(Comparator.comparing(MarketplaceItem::getRating, Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        } else {
            // Default: featured first, then review count
            items.sort(Comparator.comparing(MarketplaceItem::getFeatured).reversed()
                    .thenComparing(Comparator.comparing(MarketplaceItem::getReviewCount, Comparator.nullsLast(Comparator.naturalOrder())).reversed()));
        }

        return items;
    }

    public MarketplaceItem getItemDetail(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book/Item not found with id: " + id));
    }

    public List<MarketplaceItem> getSimilarItems(Long id) {
        MarketplaceItem current = getItemDetail(id);
        return itemRepository.findAll().stream()
                .filter(i -> !i.getId().equals(id))
                .filter(i -> (current.getType() != null && current.getType().equalsIgnoreCase(i.getType())) ||
                             (current.getAuthor() != null && current.getAuthor().equalsIgnoreCase(i.getAuthor())))
                .limit(4)
                .collect(Collectors.toList());
    }

    public boolean toggleWishlist(Long itemId, String username) {
        WishlistDocument wishlist = wishlistRepository.findByUsername(username)
                .orElseGet(() -> WishlistDocument.builder()
                        .username(username)
                        .itemIds(new HashSet<>())
                        .build());

        boolean isWishlisted;
        if (wishlist.getItemIds().contains(itemId)) {
            wishlist.getItemIds().remove(itemId);
            isWishlisted = false;
        } else {
            wishlist.getItemIds().add(itemId);
            isWishlisted = true;
        }
        wishlist.setUpdatedAt(Instant.now());
        wishlistRepository.save(wishlist);
        return isWishlisted;
    }

    public Set<Long> getWishlistIds(String username) {
        return wishlistRepository.findByUsername(username)
                .map(WishlistDocument::getItemIds)
                .orElse(Collections.emptySet());
    }

    public List<MarketplaceItem> getWishlistItems(String username) {
        Set<Long> ids = getWishlistIds(username);
        if (ids.isEmpty()) return Collections.emptyList();
        return itemRepository.findAllById(ids);
    }

    public MarketplaceReviewDocument addReview(Long itemId, BookReviewRequestDTO dto, String username) {
        MarketplaceItem item = getItemDetail(itemId);

        MarketplaceReviewDocument review = MarketplaceReviewDocument.builder()
                .itemId(itemId)
                .username(username)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(Instant.now())
                .build();

        review = reviewRepository.save(review);

        // Recalculate average rating & review count on item
        List<MarketplaceReviewDocument> allReviews = reviewRepository.findByItemIdOrderByCreatedAtDesc(itemId);
        int newCount = allReviews.size();
        double avg = allReviews.stream().mapToInt(MarketplaceReviewDocument::getRating).average().orElse(4.0);
        int ratingValue = (int) Math.round(avg * 10); // e.g. 4.5 -> 45

        item.setReviewCount(newCount);
        item.setRating(ratingValue);
        itemRepository.save(item);

        return review;
    }

    public List<MarketplaceReviewDocument> getItemReviews(Long itemId) {
        return reviewRepository.findByItemIdOrderByCreatedAtDesc(itemId);
    }

    public CheckoutResponseDTO processCheckout(CheckoutRequestDTO dto, String username) {
        log.info("Processing Stripe checkout for user: {}, items count: {}", username, dto.getItems().size());

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderDocument.OrderItem> orderItems = new ArrayList<>();

        for (var itemReq : dto.getItems()) {
            MarketplaceItem dbItem = getItemDetail(itemReq.getItemId());
            BigDecimal itemTotal = dbItem.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1));
            subtotal = subtotal.add(itemTotal);

            orderItems.add(OrderDocument.OrderItem.builder()
                    .itemId(dbItem.getId())
                    .name(dbItem.getName())
                    .price(dbItem.getPrice())
                    .quantity(itemReq.getQuantity() != null ? itemReq.getQuantity() : 1)
                    .build());
        }

        // ── Premium discount ──────────────────────────────────────────────────
        int discountPct = 0;
        try {
            User user = userRepository.findByEmail(username).orElse(null);
            if (user != null) {
                discountPct = subscriptionService.getMarketplaceDiscount(user.getId());
            }
        } catch (Exception ex) {
            log.warn("Could not resolve discount for user {}: {}", username, ex.getMessage());
        }

        BigDecimal discountMultiplier = BigDecimal.ONE.subtract(
                BigDecimal.valueOf(discountPct).divide(BigDecimal.valueOf(100)));
        BigDecimal total         = subtotal.multiply(discountMultiplier).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal discountSaved = subtotal.subtract(total).setScale(2, java.math.RoundingMode.HALF_UP);

        String orderId      = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String clientSecret = "pi_test_" + UUID.randomUUID().toString().replace("-", "") + "_secret_test";

        OrderDocument order = OrderDocument.builder()
                .id(orderId)
                .username(username)
                .items(orderItems)
                .totalAmount(total)
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "INR")
                .stripePaymentIntentId("pi_test_" + UUID.randomUUID().toString().substring(0, 12))
                .paymentStatus("COMPLETED")
                .shippingAddress(dto.getShippingAddress() != null ? dto.getShippingAddress() : "Standard Literary Express Shipping")
                .createdAt(Instant.now())
                .build();

        orderRepository.save(order);

        return CheckoutResponseDTO.builder()
                .orderId(orderId)
                .clientSecret(clientSecret)
                .originalAmount(subtotal)
                .totalAmount(total)
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "INR")
                .paymentStatus("COMPLETED")
                .discountPercent(discountPct)
                .discountApplied(discountSaved)
                .message(discountPct > 0
                    ? "Payment successful! Premium discount of " + discountPct + "% applied."
                    : "Payment successful! Your order has been placed.")
                .build();
    }
}
