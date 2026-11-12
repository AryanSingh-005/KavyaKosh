package com.verse.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions", indexes = {
    @Index(name = "idx_sub_user_id", columnList = "userId"),
    @Index(name = "idx_sub_user_status", columnList = "userId, status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Tier tier = Tier.FREE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.ACTIVE;

    /** Simulated Stripe subscription ID (sub_test_...) */
    @Column(length = 120)
    private String stripeSubscriptionId;

    /** Simulated Stripe payment method token */
    @Column(length = 120)
    private String stripePaymentMethodId;

    private LocalDateTime currentPeriodEnd;

    private LocalDateTime cancelledAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum Tier {
        FREE, LITE, PRO
    }

    public enum Status {
        ACTIVE, CANCELLED, EXPIRED
    }
}
