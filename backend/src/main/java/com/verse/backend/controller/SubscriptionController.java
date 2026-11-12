package com.verse.backend.controller;

import com.verse.backend.dto.SubscribeRequestDTO;
import com.verse.backend.dto.SubscriptionStatusDTO;
import com.verse.backend.entity.User;
import com.verse.backend.repository.UserRepository;
import com.verse.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/premium")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    /** Public — no auth required; returns tier definitions for the pricing page */
    @GetMapping("/tiers")
    public ResponseEntity<List<Map<String, Object>>> getTiers() {
        return ResponseEntity.ok(subscriptionService.getTierDefinitions());
    }

    /** My current subscription status + feature flags */
    @GetMapping("/status")
    public ResponseEntity<SubscriptionStatusDTO> getStatus(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = resolveUser(userDetails.getUsername());
        return ResponseEntity.ok(subscriptionService.getStatus(user.getId()));
    }

    /** Subscribe to LITE or PRO */
    @PostMapping("/subscribe")
    public ResponseEntity<SubscriptionStatusDTO> subscribe(
            @RequestBody SubscribeRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = resolveUser(userDetails.getUsername());
        return ResponseEntity.ok(subscriptionService.subscribe(user.getId(), dto));
    }

    /** Cancel current subscription (reverts to FREE at period end — simulated as immediate) */
    @PostMapping("/cancel")
    public ResponseEntity<SubscriptionStatusDTO> cancel(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(401).build();
        User user = resolveUser(userDetails.getUsername());
        return ResponseEntity.ok(subscriptionService.cancel(user.getId()));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }
}
