package com.verse.backend.service;

import com.verse.backend.document.AiGenerationHistory;
import com.verse.backend.dto.SubscribeRequestDTO;
import com.verse.backend.dto.SubscriptionStatusDTO;
import com.verse.backend.entity.Subscription;
import com.verse.backend.entity.User;
import com.verse.backend.repository.AiGenerationHistoryRepository;
import com.verse.backend.repository.SubscriptionRepository;
import com.verse.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final AiGenerationHistoryRepository aiHistoryRepository;

    // ── Tier limits ─────────────────────────────────────────────────────────

    /** -1 denotes unlimited */
    private static final Map<Subscription.Tier, Integer> DAILY_AI_LIMIT = Map.of(
        Subscription.Tier.FREE, 5,
        Subscription.Tier.LITE, 50,
        Subscription.Tier.PRO,  -1
    );

    private static final Map<Subscription.Tier, Integer> MARKETPLACE_DISCOUNT = Map.of(
        Subscription.Tier.FREE, 0,
        Subscription.Tier.LITE, 10,
        Subscription.Tier.PRO,  20
    );

    // ─────────────────────────────────────────────────────────────────────────
    // Public helpers (consumed by other services)
    // ─────────────────────────────────────────────────────────────────────────

    public Subscription.Tier getTierForUser(Long userId) {
        return subscriptionRepository
                .findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, Subscription.Status.ACTIVE)
                .map(Subscription::getTier)
                .orElse(Subscription.Tier.FREE);
    }

    public boolean isPremium(Long userId) {
        Subscription.Tier t = getTierForUser(userId);
        return t == Subscription.Tier.LITE || t == Subscription.Tier.PRO;
    }

    public int getMarketplaceDiscount(Long userId) {
        return MARKETPLACE_DISCOUNT.getOrDefault(getTierForUser(userId), 0);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Daily AI limit enforcement
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Counts today's AI generations for the user and throws if the limit is hit.
     * Called by AiStudioService before each generation.
     */
    public void enforceAiDailyLimit(String username) {
        User user = userRepository.findByEmail(username)
                .orElse(null);
        if (user == null) return; // anonymous fallback

        Subscription.Tier tier = getTierForUser(user.getId());
        int limit = DAILY_AI_LIMIT.getOrDefault(tier, 5);
        if (limit == -1) return; // unlimited

        // Count generations since start of today UTC
        Instant startOfDay = LocalDateTime.now(ZoneOffset.UTC)
                .toLocalDate().atStartOfDay().toInstant(ZoneOffset.UTC);

        long todayCount = aiHistoryRepository.countByUsernameAndCreatedAtAfter(username, startOfDay);

        if (todayCount >= limit) {
            String tierLabel = tier == Subscription.Tier.FREE ? "FREE (5/day)" : "LITE (50/day)";
            throw new RuntimeException(
                "AI_LIMIT_EXCEEDED:Your " + tierLabel + " plan limit has been reached. Upgrade for more generations."
            );
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Status
    // ─────────────────────────────────────────────────────────────────────────

    public SubscriptionStatusDTO getStatus(Long userId) {
        Optional<Subscription> activeSub = subscriptionRepository
                .findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, Subscription.Status.ACTIVE);

        Subscription.Tier tier = activeSub.map(Subscription::getTier).orElse(Subscription.Tier.FREE);
        Subscription.Status status = activeSub.map(Subscription::getStatus).orElse(Subscription.Status.ACTIVE);
        LocalDateTime periodEnd = activeSub.map(Subscription::getCurrentPeriodEnd).orElse(null);
        LocalDateTime cancelledAt = activeSub.map(Subscription::getCancelledAt).orElse(null);

        return SubscriptionStatusDTO.builder()
                .tier(tier)
                .status(status)
                .currentPeriodEnd(periodEnd)
                .cancelledAt(cancelledAt)
                .features(buildFeatureMap(tier))
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Subscribe / Upgrade
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public SubscriptionStatusDTO subscribe(Long userId, SubscribeRequestDTO dto) {
        Subscription.Tier requestedTier;
        try {
            requestedTier = Subscription.Tier.valueOf(dto.getTier().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid subscription tier: " + dto.getTier());
        }
        if (requestedTier == Subscription.Tier.FREE) {
            throw new RuntimeException("Cannot subscribe to FREE tier — cancel your existing plan instead.");
        }

        // Cancel any existing active subscription
        subscriptionRepository
                .findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, Subscription.Status.ACTIVE)
                .ifPresent(existing -> {
                    existing.setStatus(Subscription.Status.CANCELLED);
                    existing.setCancelledAt(LocalDateTime.now());
                    subscriptionRepository.save(existing);
                });

        // Simulate a 30-day billing period
        String simulatedSubId = "sub_test_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        Subscription newSub = Subscription.builder()
                .userId(userId)
                .tier(requestedTier)
                .status(Subscription.Status.ACTIVE)
                .stripeSubscriptionId(simulatedSubId)
                .stripePaymentMethodId(dto.getPaymentMethodId() != null ? dto.getPaymentMethodId() : "pm_test_simulated")
                .currentPeriodEnd(LocalDateTime.now().plusDays(30))
                .build();

        subscriptionRepository.save(newSub);
        log.info("User {} subscribed to {} tier. Simulated sub ID: {}", userId, requestedTier, simulatedSubId);

        return getStatus(userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Cancel
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public SubscriptionStatusDTO cancel(Long userId) {
        subscriptionRepository
                .findTopByUserIdAndStatusOrderByCreatedAtDesc(userId, Subscription.Status.ACTIVE)
                .ifPresent(sub -> {
                    sub.setStatus(Subscription.Status.CANCELLED);
                    sub.setCancelledAt(LocalDateTime.now());
                    subscriptionRepository.save(sub);
                    log.info("User {} cancelled subscription {}", userId, sub.getStripeSubscriptionId());
                });

        return getStatus(userId);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Public tier definitions (no auth required)
    // ─────────────────────────────────────────────────────────────────────────

    public List<Map<String, Object>> getTierDefinitions() {
        return List.of(
            buildTierDef("FREE",  "Free",   0,   "INR", buildFeatureMap(Subscription.Tier.FREE)),
            buildTierDef("LITE",  "Lite",   199, "INR", buildFeatureMap(Subscription.Tier.LITE)),
            buildTierDef("PRO",   "Pro",    499, "INR", buildFeatureMap(Subscription.Tier.PRO))
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private Map<String, Object> buildFeatureMap(Subscription.Tier tier) {
        return switch (tier) {
            case FREE -> Map.of(
                "dailyAiGenerations", 5,
                "priorityReview", false,
                "marketplaceDiscountPercent", 0,
                "earlyCompetitionAccess", false,
                "badgeLabel", "Free"
            );
            case LITE -> Map.of(
                "dailyAiGenerations", 50,
                "priorityReview", true,
                "marketplaceDiscountPercent", 10,
                "earlyCompetitionAccess", true,
                "badgeLabel", "Lite"
            );
            case PRO -> Map.of(
                "dailyAiGenerations", -1,
                "priorityReview", true,
                "marketplaceDiscountPercent", 20,
                "earlyCompetitionAccess", true,
                "badgeLabel", "Pro"
            );
        };
    }

    private Map<String, Object> buildTierDef(String id, String name, int priceMonthly, String currency,
                                              Map<String, Object> features) {
        Map<String, Object> def = new LinkedHashMap<>();
        def.put("id", id);
        def.put("name", name);
        def.put("priceMonthly", priceMonthly);
        def.put("currency", currency);
        def.put("features", features);
        return def;
    }
}
