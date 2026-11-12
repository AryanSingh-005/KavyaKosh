package com.verse.backend.repository;

import com.verse.backend.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Subscription> findTopByUserIdAndStatusOrderByCreatedAtDesc(Long userId, Subscription.Status status);
}
