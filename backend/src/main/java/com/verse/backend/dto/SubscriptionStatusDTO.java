package com.verse.backend.dto;

import com.verse.backend.entity.Subscription;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatusDTO {

    private Subscription.Tier tier;
    private Subscription.Status status;
    private LocalDateTime currentPeriodEnd;
    private LocalDateTime cancelledAt;

    /**
     * Feature limits/flags for this tier.
     * Keys: dailyAiGenerations (-1 = unlimited), priorityReview,
     *       marketplaceDiscountPercent, earlyCompetitionAccess
     */
    private Map<String, Object> features;
}
