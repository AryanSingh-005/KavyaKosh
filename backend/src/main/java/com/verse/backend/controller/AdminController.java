package com.verse.backend.controller;

import com.verse.backend.document.*;
import com.verse.backend.entity.*;
import com.verse.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService service;

    public AdminController(AdminService service) {
        this.service = service;
    }

    private String adminName(Authentication auth) {
        return (auth != null && auth.getName() != null && !auth.getName().isBlank()) ? auth.getName() : "admin@kavyakosh.in";
    }

    @GetMapping("/dashboard") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> dashboard(@RequestParam(required = false, defaultValue = "30d") String range) { return ResponseEntity.ok(service.dashboard(range)); }
    @GetMapping("/analytics") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> analytics(@RequestParam(required = false, defaultValue = "30d") String range) { return ResponseEntity.ok(service.dashboard(range)); }
    @GetMapping("/users") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<User>> users(@RequestParam(required = false) String q, @RequestParam(required = false) String status, @RequestParam(required = false) String role) { return ResponseEntity.ok(service.users(q, status, role)); }
    @GetMapping("/users/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> getUserProfile(@PathVariable Long id, Authentication auth) { return ResponseEntity.ok(service.getUserProfile(id, adminName(auth))); }
    @PostMapping("/users/{id}/suspend") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> suspendUser(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body, Authentication auth) { return ResponseEntity.ok(service.suspendUser(id, body != null ? body.get("reason") : null, adminName(auth))); }
    @PostMapping("/users/{id}/ban") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> banUser(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body, Authentication auth) { return ResponseEntity.ok(service.banUser(id, body != null ? body.get("reason") : null, adminName(auth))); }
    @PostMapping("/users/{id}/unban") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> unbanUser(@PathVariable Long id, Authentication auth) { return ResponseEntity.ok(service.unbanUser(id, adminName(auth))); }
    @PutMapping("/users/{id}/status") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> userStatus(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) { return ResponseEntity.ok(service.userStatus(id, User.UserStatus.valueOf(body.get("status").toUpperCase()), adminName(auth))); }
    @PutMapping("/users/{id}/role") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> userRole(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) { return ResponseEntity.ok(service.userRole(id, User.Role.valueOf(body.get("role").toUpperCase()), adminName(auth))); }

    @GetMapping("/moderation/flags") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> flags() { return ResponseEntity.ok(service.flagged()); }
    @PostMapping("/moderation/flags") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> flag(@RequestBody Map<String, String> body, Authentication auth) { return ResponseEntity.ok(service.flag(body.get("targetType"), body.get("targetId"), body.get("reason"), adminName(auth))); }
    @PutMapping("/moderation/flags/{id}/resolve") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> resolveFlag(@PathVariable String id, @RequestBody(required = false) Map<String, String> body, Authentication auth) { return ResponseEntity.ok(service.resolveFlag(id, body != null ? body.get("resolution") : null, adminName(auth))); }
    @PutMapping("/moderation/flags/{id}/dismiss") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> dismissFlag(@PathVariable String id, @RequestBody(required = false) Map<String, String> body, Authentication auth) { return ResponseEntity.ok(service.dismissFlag(id, body != null ? body.get("reason") : null, adminName(auth))); }
    @PutMapping("/moderation/{type}/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> moderate(@PathVariable String type, @PathVariable String id, @RequestParam boolean restore, Authentication auth) { return ResponseEntity.ok(service.moderate(type, id, restore, adminName(auth))); }
    @GetMapping("/moderation/poems") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<PoemDocument>> allPoems(@RequestParam(required = false) String q, @RequestParam(required = false) String status) { return ResponseEntity.ok(service.allPoems(q, status)); }
    @GetMapping("/moderation/comments") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<CommentDocument>> allComments(@RequestParam(required = false) String q, @RequestParam(required = false) String status) { return ResponseEntity.ok(service.allComments(q, status)); }

    @GetMapping("/reviewers") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> reviewers() { return ResponseEntity.ok(service.reviewerRoster()); }
    @GetMapping("/reviewers/candidates") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<User>> reviewerCandidates(@RequestParam(required = false) String q) { return ResponseEntity.ok(service.reviewerCandidates(q)); }
    @PostMapping("/reviewers/{id}/promote") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> promoteReviewer(@PathVariable Long id, Authentication auth) { return ResponseEntity.ok(service.promoteReviewer(id, adminName(auth))); }
    @PostMapping("/reviewers/{id}/demote") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> demoteReviewer(@PathVariable Long id, Authentication auth) { return ResponseEntity.ok(service.demoteReviewer(id, adminName(auth))); }
    @GetMapping("/reviewers/{username}/reviews") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<ReviewRequestDocument>> reviewerReviews(@PathVariable String username) { return ResponseEntity.ok(service.reviewHistoryFiltered(null, username, null)); }
    @GetMapping("/reviews") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<ReviewRequestDocument>> reviews(@RequestParam(required = false) String q, @RequestParam(required = false) String reviewer, @RequestParam(required = false) String status) { return ResponseEntity.ok(service.reviewHistoryFiltered(q, reviewer, status)); }
    @PutMapping("/reviews/{id}/score") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> score(@PathVariable String id, @RequestBody Map<String, Object> body, Authentication auth) { 
        Double score = Double.valueOf(String.valueOf(body.get("score")));
        String reason = body.get("reason") != null ? String.valueOf(body.get("reason")) : null;
        return ResponseEntity.ok(service.reviewScore(id, score, reason, adminName(auth))); 
    }
    @DeleteMapping("/reviews/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<Void> deleteReview(@PathVariable String id, @RequestParam(required = false) String reason, Authentication auth) { service.deleteReview(id, reason, adminName(auth)); return ResponseEntity.noContent().build(); }

    @GetMapping("/competitions") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<Challenge>> competitions() { return ResponseEntity.ok(service.competitionList()); }
    @GetMapping("/competitions/{id}/leaderboard") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> leaderboard(@PathVariable Long id) { return ResponseEntity.ok(service.leaderboard(id)); }
    @PutMapping("/competitions/submissions/{id}/winner") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> publishWinner(@PathVariable String id, @RequestBody Map<String, Integer> body, Authentication auth) { return ResponseEntity.ok(service.publishWinner(id, body.get("rank"), adminName(auth))); }
    @PutMapping("/competitions/submissions/{id}/score") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> editSubmissionScore(@PathVariable String id, @RequestBody Map<String, Object> body, Authentication auth) {
        Double juryScore = body.get("juryScore") != null ? Double.valueOf(String.valueOf(body.get("juryScore"))) : null;
        Integer votesCount = body.get("votesCount") != null ? Integer.valueOf(String.valueOf(body.get("votesCount"))) : null;
        return ResponseEntity.ok(service.editSubmissionScore(id, juryScore, votesCount, adminName(auth)));
    }
    @PostMapping("/competitions") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> createCompetition(@RequestBody Map<String, Object> body, Authentication auth) { return ResponseEntity.ok(service.saveCompetition(body, null, adminName(auth))); }
    @PutMapping("/competitions/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> editCompetition(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) { return ResponseEntity.ok(service.saveCompetition(body, id, adminName(auth))); }
    @DeleteMapping("/competitions/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<Void> deleteCompetition(@PathVariable Long id, Authentication auth) { service.deleteCompetition(id, adminName(auth)); return ResponseEntity.noContent().build(); }
    @PutMapping("/competitions/{id}/countdown") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> adjustCountdown(@PathVariable Long id, @RequestBody Map<String, String> body, Authentication auth) { return ResponseEntity.ok(service.adjustCompetitionWindow(id, body.get("deadline"), adminName(auth))); }
    @PostMapping("/competitions/{id}/close") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> closeCompetition(@PathVariable Long id, Authentication auth) { return ResponseEntity.ok(service.closeCompetition(id, adminName(auth))); }
    @PostMapping("/competitions/{id}/reopen") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> reopenCompetition(@PathVariable Long id, Authentication auth) { return ResponseEntity.ok(service.reopenCompetition(id, adminName(auth))); }
    @PostMapping("/competitions/{id}/finalize") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> finalizeCompetition(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body, Authentication auth) { return ResponseEntity.ok(service.finalizeAndPublishWinners(id, body, adminName(auth))); }

    @GetMapping("/marketplace/listings") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<MarketplaceItem>> listings(@RequestParam(required = false) String q, @RequestParam(required = false) String type) { return ResponseEntity.ok(service.marketplaceFiltered(q, type)); }
    @PostMapping("/marketplace/listings") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> addListing(@RequestBody Map<String, Object> body, Authentication auth) { return ResponseEntity.ok(service.saveListing(body, null, adminName(auth))); }
    @PutMapping("/marketplace/listings/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> editListing(@PathVariable Long id, @RequestBody Map<String, Object> body, Authentication auth) { return ResponseEntity.ok(service.saveListing(body, id, adminName(auth))); }
    @DeleteMapping("/marketplace/listings/{id}") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<Void> deleteListing(@PathVariable Long id, Authentication auth) { service.deleteListing(id, adminName(auth)); return ResponseEntity.noContent().build(); }
    @GetMapping("/marketplace/orders") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> orders(@RequestParam(required = false) String q, @RequestParam(required = false) String status) { return ResponseEntity.ok(service.orderListFiltered(q, status)); }
    @PostMapping("/marketplace/orders/{id}/refund") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> refund(@PathVariable String id, @RequestBody(required = false) Map<String, String> body, Authentication auth) { 
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(service.refundOrder(id, reason, adminName(auth))); 
    }

    @GetMapping("/subscriptions") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> subscriptions() { return ResponseEntity.ok(service.subscribers()); }
    @PostMapping("/subscriptions/{id}/cancel") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> cancel(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean refund, Authentication auth) { return ResponseEntity.ok(service.cancelSubscription(id, adminName(auth), refund)); }

    @GetMapping("/settings") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> settings() { return ResponseEntity.ok(service.getSettings()); }
    @PutMapping("/settings") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> settings(@RequestBody Map<String, Object> body, Authentication auth) { return ResponseEntity.ok(service.updateSettings(body, adminName(auth))); }
    @GetMapping("/settings/featured-poem") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> getFeaturedPoem() { return ResponseEntity.ok(service.getCurrentFeaturedPoem()); }
    @PostMapping("/settings/featured-poem/override") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> overrideFeaturedPoem(@RequestBody Map<String, String> body, Authentication auth) {
        return ResponseEntity.ok(service.overrideFeaturedPoem(body.get("poemId"), body.get("note"), adminName(auth)));
    }
    @PostMapping("/settings/featured-poem/clear") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> clearFeaturedPoemOverride(Authentication auth) {
        return ResponseEntity.ok(service.clearFeaturedPoemOverride(adminName(auth)));
    }
    @PostMapping("/settings/featured-poem/trigger-job") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> triggerFeaturedPoemSelection(Authentication auth) {
        return ResponseEntity.ok(service.triggerFeaturedPoemSelection(adminName(auth)));
    }
    @PostMapping("/settings/announcement") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> setAnnouncement(@RequestBody Map<String, Object> body, Authentication auth) {
        return ResponseEntity.ok(service.setAnnouncement(body, adminName(auth)));
    }
    @PostMapping("/settings/announcement/clear") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<?> clearAnnouncement(Authentication auth) {
        return ResponseEntity.ok(service.clearAnnouncement(adminName(auth)));
    }
    @GetMapping("/audit-log") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<List<AuditLogDocument>> audit(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String targetType,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String admin) {
        return ResponseEntity.ok(service.audit(q, targetType, action, admin));
    }
    @GetMapping("/audit-log/stats") @PreAuthorize("hasRole('ADMIN')") public ResponseEntity<Map<String, Object>> auditStats() {
        return ResponseEntity.ok(service.getAuditStats());
    }
}
