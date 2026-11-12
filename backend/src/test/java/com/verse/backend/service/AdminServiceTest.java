package com.verse.backend.service;

import com.verse.backend.document.*;
import com.verse.backend.entity.*;
import com.verse.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock private UserRepository users;
    @Mock private PoemDocumentRepository poems;
    @Mock private CommentDocumentRepository comments;
    @Mock private ReviewRequestRepository reviews;
    @Mock private ChallengeRepository competitions;
    @Mock private CompetitionSubmissionRepository submissions;
    @Mock private MarketplaceItemRepository listings;
    @Mock private OrderDocumentRepository orders;
    @Mock private SubscriptionRepository subscriptions;
    @Mock private AuditLogRepository auditLogs;
    @Mock private JpaAuditLogRepository jpaAuditLogs;
    @Mock private FlaggedContentRepository flags;
    @Mock private PoemRepository poemRepository;
    @Mock private SystemSettingRepository settings;
    @Mock private PoemInteractionRepository interactions;
    @Mock private MarketplaceReviewRepository marketplaceReviews;

    @InjectMocks
    private AdminService adminService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .email("poet@kavyakosh.in")
                .username("PoetTester")
                .role(User.Role.USER)
                .status(User.UserStatus.ACTIVE)
                .build();
    }

    @Test
    void testUserStatusChangeWritesAuditLog() {
        when(users.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(users.save(any(User.class))).thenReturn(sampleUser);

        User updated = adminService.userStatus(1L, User.UserStatus.SUSPENDED, "admin@kavyakosh.in");

        assertEquals(User.UserStatus.SUSPENDED, updated.getStatus());

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs, times(1)).save(docCaptor.capture());

        AuditLogDocument savedDoc = docCaptor.getValue();
        assertEquals("admin@kavyakosh.in", savedDoc.getAdminUsername());
        assertEquals("SUSPEND_USER", savedDoc.getAction());
        assertEquals("USER", savedDoc.getTargetType());
        assertEquals("1", savedDoc.getTargetId());
        assertNotNull(savedDoc.getTimestamp());

        ArgumentCaptor<AuditLog> jpaCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(jpaAuditLogs, times(1)).save(jpaCaptor.capture());
        assertEquals("SUSPEND_USER", jpaCaptor.getValue().getAction());
    }

    @Test
    void testUserRoleChangeWritesAuditLog() {
        when(users.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(users.save(any(User.class))).thenReturn(sampleUser);

        User updated = adminService.userRole(1L, User.Role.ADMIN, "admin@kavyakosh.in");

        assertEquals(User.Role.ADMIN, updated.getRole());

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs, times(1)).save(docCaptor.capture());

        AuditLogDocument savedDoc = docCaptor.getValue();
        assertEquals("CHANGE_ROLE", savedDoc.getAction());
        assertEquals("USER", savedDoc.getTargetType());
        assertEquals("1", savedDoc.getTargetId());
        assertEquals("Role changed to ADMIN", savedDoc.getDetails());
    }

    @Test
    void testGetUserProfileWritesAuditLog() {
        when(users.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(poems.findAll()).thenReturn(java.util.Collections.emptyList());
        when(reviews.findAll()).thenReturn(java.util.Collections.emptyList());

        Map<String, Object> profile = adminService.getUserProfile(1L, "admin@kavyakosh.in");

        assertNotNull(profile.get("user"));
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("VIEW_PROFILE", docCaptor.getValue().getAction());
        assertEquals("USER", docCaptor.getValue().getTargetType());
        assertEquals("1", docCaptor.getValue().getTargetId());
    }

    @Test
    void testSuspendUserWritesAuditLog() {
        when(users.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(users.save(any(User.class))).thenReturn(sampleUser);

        User suspended = adminService.suspendUser(1L, "Inappropriate content", "admin@kavyakosh.in");

        assertEquals(User.UserStatus.SUSPENDED, suspended.getStatus());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("SUSPEND_USER", docCaptor.getValue().getAction());
        assertEquals("Inappropriate content", docCaptor.getValue().getDetails());
    }

    @Test
    void testBanUserWritesAuditLog() {
        when(users.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(users.save(any(User.class))).thenReturn(sampleUser);

        User banned = adminService.banUser(1L, "Severe harassment", "admin@kavyakosh.in");

        assertEquals(User.UserStatus.BANNED, banned.getStatus());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("BAN_USER", docCaptor.getValue().getAction());
        assertEquals("Severe harassment", docCaptor.getValue().getDetails());
    }

    @Test
    void testUnbanUserWritesAuditLog() {
        sampleUser.setStatus(User.UserStatus.BANNED);
        when(users.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(users.save(any(User.class))).thenReturn(sampleUser);

        User restored = adminService.unbanUser(1L, "admin@kavyakosh.in");

        assertEquals(User.UserStatus.ACTIVE, restored.getStatus());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("UNBAN_USER", docCaptor.getValue().getAction());
    }

    @Test
    void testCloseCompetitionWritesAuditLog() {
        Challenge challenge = new Challenge();
        challenge.setId(10L);
        challenge.setTitle("Monsoon Poetry Contest");
        challenge.setStatus(Challenge.Status.ACTIVE);

        when(competitions.findById(10L)).thenReturn(Optional.of(challenge));
        when(competitions.save(any(Challenge.class))).thenReturn(challenge);

        adminService.closeCompetition(10L, "super_admin");

        assertEquals(Challenge.Status.CLOSED, challenge.getStatus());

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("CLOSE_COMPETITION", docCaptor.getValue().getAction());
        assertEquals("10", docCaptor.getValue().getTargetId());
    }

    @Test
    void testModeratePoemWritesAuditLog() {
        PoemDocument poem = PoemDocument.builder().id("poem123").published(true).build();
        when(poems.findById("poem123")).thenReturn(Optional.of(poem));
        when(poems.save(any(PoemDocument.class))).thenReturn(poem);

        adminService.moderate("POEM", "poem123", false, "admin@kavyakosh.in");

        assertFalse(poem.getPublished());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("REMOVE_CONTENT", docCaptor.getValue().getAction());
        assertEquals("POEM", docCaptor.getValue().getTargetType());
        assertEquals("poem123", docCaptor.getValue().getTargetId());
    }

    @Test
    void testReviewScoreOverrideWritesAuditLog() {
        ReviewRequestDocument review = ReviewRequestDocument.builder().id("rev99").overallScore(6.0).build();
        when(reviews.findById("rev99")).thenReturn(Optional.of(review));
        when(reviews.save(any(ReviewRequestDocument.class))).thenReturn(review);

        adminService.reviewScore("rev99", 9.5, "admin@kavyakosh.in");

        assertEquals(9.5, review.getOverallScore());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("OVERRIDE_REVIEW_SCORE", docCaptor.getValue().getAction());
        assertEquals("9.5", docCaptor.getValue().getDetails());
    }

    @Test
    void testPublishWinnerWritesAuditLog() {
        CompetitionSubmissionDocument submission = CompetitionSubmissionDocument.builder().id("sub1").rank(null).build();
        when(submissions.findById("sub1")).thenReturn(Optional.of(submission));
        when(submissions.save(any(CompetitionSubmissionDocument.class))).thenReturn(submission);

        adminService.publishWinner("sub1", 1, "admin@kavyakosh.in");

        assertEquals(1, submission.getRank());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("PUBLISH_WINNER", docCaptor.getValue().getAction());
        assertEquals("rank=1", docCaptor.getValue().getDetails());
    }

    @Test
    void testMarketplaceListingSaveAndDeleteWritesAuditLog() {
        MarketplaceItem item = MarketplaceItem.builder().id(50L).name("Anthology Vol 1").build();
        when(listings.save(any(MarketplaceItem.class))).thenReturn(item);

        adminService.saveListing(Map.of("name", "Anthology Vol 1", "price", "299"), null, "admin@kavyakosh.in");

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs, atLeastOnce()).save(docCaptor.capture());
        assertEquals("ADD_LISTING", docCaptor.getValue().getAction());

        adminService.deleteListing(50L, "admin@kavyakosh.in");
        verify(listings).deleteById(50L);
    }

    @Test
    void testRefundOrderWritesAuditLog() {
        OrderDocument order = OrderDocument.builder().id("ord456").paymentStatus("COMPLETED").build();
        when(orders.findById("ord456")).thenReturn(Optional.of(order));
        when(orders.save(any(OrderDocument.class))).thenReturn(order);

        adminService.refundOrder("ord456", "admin@kavyakosh.in");

        assertEquals("REFUNDED", order.getPaymentStatus());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("ISSUE_REFUND", docCaptor.getValue().getAction());
        assertEquals("ord456", docCaptor.getValue().getTargetId());
    }

    @Test
    void testCancelSubscriptionWritesAuditLog() {
        Subscription sub = Subscription.builder().id(200L).status(Subscription.Status.ACTIVE).build();
        when(subscriptions.findById(200L)).thenReturn(Optional.of(sub));
        when(subscriptions.save(any(Subscription.class))).thenReturn(sub);

        adminService.cancelSubscription(200L, "admin@kavyakosh.in", true);

        assertEquals(Subscription.Status.CANCELLED, sub.getStatus());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("REFUND_SUBSCRIPTION", docCaptor.getValue().getAction());
    }

    @Test
    void testUpdateSettingsWritesAuditLog() {
        when(settings.save(any(SystemSettingDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        adminService.updateSettings(Map.of("announcement", "Welcome to KavyaKosh"), "admin@kavyakosh.in");

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("UPDATE_SETTINGS", docCaptor.getValue().getAction());
    }

    @Test
    void testFlagContentWritesAuditLog() {
        when(flags.save(any(FlaggedContentDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        FlaggedContentDocument created = adminService.flag("POEM", "poem99", "Plagiarism detected", "admin@kavyakosh.in");

        assertNotNull(created);
        assertEquals("POEM", created.getTargetType());
        assertEquals("poem99", created.getTargetId());
        assertEquals("Plagiarism detected", created.getReason());
        assertEquals("OPEN", created.getStatus());

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("FLAG_CONTENT", docCaptor.getValue().getAction());
        assertEquals("POEM", docCaptor.getValue().getTargetType());
        assertEquals("poem99", docCaptor.getValue().getTargetId());
        assertEquals("Plagiarism detected", docCaptor.getValue().getDetails());
    }

    @Test
    void testResolveFlagWritesAuditLog() {
        FlaggedContentDocument flag = FlaggedContentDocument.builder()
                .id("f123")
                .targetType("POEM")
                .targetId("poem99")
                .status("OPEN")
                .build();
        when(flags.findById("f123")).thenReturn(Optional.of(flag));
        when(flags.save(any(FlaggedContentDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        FlaggedContentDocument resolved = adminService.resolveFlag("f123", "Reviewed and deemed compliant", "admin@kavyakosh.in");

        assertEquals("RESOLVED", resolved.getStatus());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("RESOLVE_FLAG", docCaptor.getValue().getAction());
        assertEquals("FLAG", docCaptor.getValue().getTargetType());
        assertEquals("f123", docCaptor.getValue().getTargetId());
    }

    @Test
    void testDismissFlagWritesAuditLog() {
        FlaggedContentDocument flag = FlaggedContentDocument.builder()
                .id("f123")
                .targetType("COMMENT")
                .targetId("comm50")
                .status("OPEN")
                .build();
        when(flags.findById("f123")).thenReturn(Optional.of(flag));
        when(flags.save(any(FlaggedContentDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        FlaggedContentDocument dismissed = adminService.dismissFlag("f123", "False report", "admin@kavyakosh.in");

        assertEquals("DISMISSED", dismissed.getStatus());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("DISMISS_FLAG", docCaptor.getValue().getAction());
        assertEquals("False report", docCaptor.getValue().getDetails());
    }

    @Test
    void testModerateCommentRemoveAndRestoreWritesAuditLog() {
        CommentDocument comment = CommentDocument.builder().id("comm10").removed(false).build();
        when(comments.findById("comm10")).thenReturn(Optional.of(comment));
        when(comments.save(any(CommentDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        // Remove comment
        adminService.moderate("COMMENT", "comm10", false, "admin@kavyakosh.in");
        assertTrue(comment.getRemoved());

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("REMOVE_CONTENT", docCaptor.getValue().getAction());
        assertEquals("COMMENT", docCaptor.getValue().getTargetType());
        assertEquals("comm10", docCaptor.getValue().getTargetId());

        // Restore comment
        adminService.moderate("COMMENT", "comm10", true, "admin@kavyakosh.in");
        assertFalse(comment.getRemoved());
    }

    @Test
    void testAllPoemsFiltering() {
        PoemDocument p1 = PoemDocument.builder().id("1").title("Ode to the Moon").content("Night sky").published(true).build();
        PoemDocument p2 = PoemDocument.builder().id("2").title("Morning Sun").content("Dawn light").published(false).build();
        when(poems.findAll()).thenReturn(java.util.List.of(p1, p2));

        java.util.List<PoemDocument> published = adminService.allPoems("Moon", "PUBLISHED");
        assertEquals(1, published.size());
        assertEquals("1", published.get(0).getId());

        java.util.List<PoemDocument> removed = adminService.allPoems(null, "REMOVED");
        assertEquals(1, removed.size());
        assertEquals("2", removed.get(0).getId());
    }

    @Test
    void testAllCommentsFiltering() {
        CommentDocument c1 = CommentDocument.builder().id("c1").content("Great poem!").username("alex").removed(false).build();
        CommentDocument c2 = CommentDocument.builder().id("c2").content("Spam link http...").username("bot").removed(true).build();
        when(comments.findAll()).thenReturn(java.util.List.of(c1, c2));

        java.util.List<CommentDocument> active = adminService.allComments("Great", "ACTIVE");
        assertEquals(1, active.size());
        assertEquals("c1", active.get(0).getId());

        java.util.List<CommentDocument> removed = adminService.allComments(null, "REMOVED");
        assertEquals(1, removed.size());
        assertEquals("c2", removed.get(0).getId());
    }

    @Test
    void testPromoteReviewerWritesAuditLog() {
        when(users.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(users.save(any(User.class))).thenReturn(sampleUser);

        User promoted = adminService.promoteReviewer(1L, "admin@kavyakosh.in");

        assertEquals(User.Role.REVIEWER, promoted.getRole());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("PROMOTE_REVIEWER", docCaptor.getValue().getAction());
        assertEquals("USER", docCaptor.getValue().getTargetType());
        assertEquals("1", docCaptor.getValue().getTargetId());
    }

    @Test
    void testDemoteReviewerWritesAuditLog() {
        sampleUser.setRole(User.Role.REVIEWER);
        when(users.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(users.save(any(User.class))).thenReturn(sampleUser);

        User demoted = adminService.demoteReviewer(1L, "admin@kavyakosh.in");

        assertEquals(User.Role.USER, demoted.getRole());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("DEMOTE_REVIEWER", docCaptor.getValue().getAction());
        assertEquals("USER", docCaptor.getValue().getTargetType());
        assertEquals("1", docCaptor.getValue().getTargetId());
    }

    @Test
    void testReviewHistoryFiltered() {
        ReviewRequestDocument r1 = ReviewRequestDocument.builder()
                .id("r1")
                .poemTitle("Sonnet 18")
                .authorUsername("william")
                .reviewerUsername("john_critic")
                .status("COMPLETED")
                .overallScore(8.5)
                .build();
        ReviewRequestDocument r2 = ReviewRequestDocument.builder()
                .id("r2")
                .poemTitle("Autumn Breeze")
                .authorUsername("keats")
                .reviewerUsername("sarah_poet")
                .status("PENDING")
                .build();
        when(reviews.findAll()).thenReturn(java.util.List.of(r1, r2));

        java.util.List<ReviewRequestDocument> filtered = adminService.reviewHistoryFiltered("Sonnet", "john_critic", "COMPLETED");
        assertEquals(1, filtered.size());
        assertEquals("r1", filtered.get(0).getId());

        java.util.List<ReviewRequestDocument> pending = adminService.reviewHistoryFiltered(null, null, "PENDING");
        assertEquals(1, pending.size());
        assertEquals("r2", pending.get(0).getId());
    }

    @Test
    void testDeleteReviewWithReasonWritesAuditLog() {
        adminService.deleteReview("rev88", "Violated reviewer ethics", "admin@kavyakosh.in");

        verify(reviews).deleteById("rev88");
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("DELETE_REVIEW", docCaptor.getValue().getAction());
        assertEquals("REVIEW", docCaptor.getValue().getTargetType());
        assertEquals("rev88", docCaptor.getValue().getTargetId());
        assertEquals("Violated reviewer ethics", docCaptor.getValue().getDetails());
    }

    @Test
    void testSaveCompetitionCreateWritesAuditLog() {
        Challenge savedChallenge = Challenge.builder().id(25L).title("Spring Haiku Slam").build();
        when(competitions.save(any(Challenge.class))).thenReturn(savedChallenge);

        Challenge result = adminService.saveCompetition(Map.of(
                "title", "Spring Haiku Slam",
                "description", "Write 5-7-5 haikus on spring blooming",
                "theme", "Nature",
                "prizeDescription", "₹5,000 + Book voucher"
        ), null, "admin@kavyakosh.in");

        assertNotNull(result);
        assertEquals(25L, result.getId());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("CREATE_COMPETITION", docCaptor.getValue().getAction());
        assertEquals("COMPETITION", docCaptor.getValue().getTargetType());
        assertEquals("25", docCaptor.getValue().getTargetId());
    }

    @Test
    void testAdjustCompetitionWindowWritesAuditLog() {
        Challenge challenge = Challenge.builder().id(30L).title("Ghazal Night").build();
        when(competitions.findById(30L)).thenReturn(Optional.of(challenge));
        when(competitions.save(any(Challenge.class))).thenReturn(challenge);

        adminService.adjustCompetitionWindow(30L, "2026-11-15T23:59:00", "admin@kavyakosh.in");

        assertNotNull(challenge.getDeadline());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("ADJUST_COMPETITION_WINDOW", docCaptor.getValue().getAction());
        assertEquals("30", docCaptor.getValue().getTargetId());
    }

    @Test
    void testEditSubmissionScoreWritesAuditLog() {
        CompetitionSubmissionDocument sub = CompetitionSubmissionDocument.builder()
                .id("sub100")
                .votesCount(10)
                .juryScore(7.0)
                .totalScore(24.0)
                .build();
        when(submissions.findById("sub100")).thenReturn(Optional.of(sub));
        when(submissions.save(any(CompetitionSubmissionDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        CompetitionSubmissionDocument updated = adminService.editSubmissionScore("sub100", 9.0, 15, "admin@kavyakosh.in");

        assertEquals(9.0, updated.getJuryScore());
        assertEquals(15, updated.getVotesCount());
        assertEquals(33.0, updated.getTotalScore()); // (15 * 1.0) + (9.0 * 2.0) = 33.0

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("EDIT_SUBMISSION_SCORE", docCaptor.getValue().getAction());
        assertEquals("sub100", docCaptor.getValue().getTargetId());
    }

    @Test
    void testFinalizeAndPublishWinnersWritesAuditLog() {
        Challenge challenge = Challenge.builder().id(40L).title("Annual Poetry Cup").status(Challenge.Status.ACTIVE).build();
        when(competitions.findById(40L)).thenReturn(Optional.of(challenge));
        when(competitions.save(any(Challenge.class))).thenReturn(challenge);

        CompetitionSubmissionDocument s1 = CompetitionSubmissionDocument.builder().id("s1").totalScore(50.0).build();
        CompetitionSubmissionDocument s2 = CompetitionSubmissionDocument.builder().id("s2").totalScore(45.0).build();
        when(submissions.findByCompetitionIdOrderByTotalScoreDesc(40L)).thenReturn(java.util.List.of(s1, s2));

        Map<String, Object> result = adminService.finalizeAndPublishWinners(40L, null, "admin@kavyakosh.in");

        assertEquals("CLOSED", challenge.getStatus().name());
        assertEquals(1, s1.getRank());
        assertEquals(2, s2.getRank());

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("FINALIZE_COMPETITION", docCaptor.getValue().getAction());
        assertEquals("40", docCaptor.getValue().getTargetId());
    }

    @Test
    void testMarketplaceFiltered() {
        MarketplaceItem item1 = MarketplaceItem.builder().id(1L).name("Anthology 2026").type("BOOK").build();
        MarketplaceItem item2 = MarketplaceItem.builder().id(2L).name("Meter & Rhyme").type("COURSE").build();
        when(listings.findAll()).thenReturn(java.util.List.of(item1, item2));

        java.util.List<MarketplaceItem> books = adminService.marketplaceFiltered("Anthology", "BOOK");
        assertEquals(1, books.size());
        assertEquals("Anthology 2026", books.get(0).getName());

        java.util.List<MarketplaceItem> courses = adminService.marketplaceFiltered(null, "COURSE");
        assertEquals(1, courses.size());
        assertEquals(2L, courses.get(0).getId());
    }

    @Test
    void testOrderListFiltered() {
        OrderDocument o1 = OrderDocument.builder().id("ord1").username("poet1").paymentStatus("COMPLETED").build();
        OrderDocument o2 = OrderDocument.builder().id("ord2").username("poet2").paymentStatus("REFUNDED").build();
        when(orders.findAll()).thenReturn(java.util.List.of(o1, o2));

        java.util.List<OrderDocument> completed = adminService.orderListFiltered("poet1", "COMPLETED");
        assertEquals(1, completed.size());
        assertEquals("ord1", completed.get(0).getId());

        java.util.List<OrderDocument> refunded = adminService.orderListFiltered(null, "REFUNDED");
        assertEquals(1, refunded.size());
        assertEquals("ord2", refunded.get(0).getId());
    }

    @Test
    void testRefundOrderWithReasonWritesAuditLog() {
        OrderDocument order = OrderDocument.builder().id("ord999").totalAmount(new BigDecimal("1299.00")).paymentStatus("COMPLETED").build();
        when(orders.findById("ord999")).thenReturn(Optional.of(order));
        when(orders.save(any(OrderDocument.class))).thenReturn(order);

        adminService.refundOrder("ord999", "Customer requested cancellation", "admin@kavyakosh.in");

        assertEquals("REFUNDED", order.getPaymentStatus());
        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs).save(docCaptor.capture());
        assertEquals("ISSUE_REFUND", docCaptor.getValue().getAction());
        assertEquals("ord999", docCaptor.getValue().getTargetId());
        assertTrue(docCaptor.getValue().getDetails().contains("Customer requested cancellation"));
    }

    @Test
    void testDashboardAnalytics() {
        when(users.findAll()).thenReturn(java.util.List.of(sampleUser));
        when(competitions.findAll()).thenReturn(java.util.List.of(
                Challenge.builder().id(10L).title("Monsoon").status(Challenge.Status.ACTIVE).participantCount(50).build()
        ));
        when(poems.findAll()).thenReturn(java.util.List.of(
                PoemDocument.builder().id("p1").title("Ghazal 1").published(true).likesCount(100).commentsCount(15).viewsCount(500)
                        .category("Ghazal").language("Urdu").mood("Romantic")
                        .createdAt(java.time.LocalDateTime.now().minusDays(2)).build()
        ));
        when(orders.findAll()).thenReturn(java.util.List.of(
                OrderDocument.builder().id("ord1").totalAmount(new BigDecimal("999.00")).paymentStatus("COMPLETED")
                        .createdAt(java.time.Instant.now().minus(java.time.Duration.ofDays(1))).build()
        ));
        when(subscriptions.findAll()).thenReturn(java.util.List.of(
                Subscription.builder().id(1L).tier(Subscription.Tier.PRO).status(Subscription.Status.ACTIVE)
                        .createdAt(java.time.LocalDateTime.now().minusDays(5)).build()
        ));
        when(comments.findAll()).thenReturn(java.util.List.of());
        when(reviews.findAll()).thenReturn(java.util.List.of());
        when(marketplaceReviews.findAll()).thenReturn(java.util.List.of());
        when(interactions.findAll()).thenReturn(java.util.List.of());

        Map<String, Object> data = adminService.dashboard("30d");

        assertNotNull(data);
        assertEquals(1, data.get("totalUsers"));
        assertEquals(1L, data.get("poemsPublished"));
        assertEquals(1L, data.get("activeCompetitions"));
        assertTrue(((BigDecimal) data.get("revenue")).compareTo(BigDecimal.ZERO) > 0);
        assertEquals(100L, data.get("likes"));
        assertNotNull(data.get("engagementTrends"));
        assertNotNull(data.get("categoryDistribution"));
        assertNotNull(data.get("activeCompetitionsList"));
    }

    @Test
    void testOverrideFeaturedPoem() {
        PoemDocument target = PoemDocument.builder()
                .id("poem-42")
                .title("Aaftaab-e-Sukhan")
                .published(true)
                .author(PoemDocument.AuthorSnapshot.builder().username("MirzaGhalib").build())
                .featured(false)
                .build();
        when(poems.findById("poem-42")).thenReturn(Optional.of(target));
        when(poems.findByPublishedTrue(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(java.util.List.of(target)));
        when(poems.save(any(PoemDocument.class))).thenAnswer(inv -> inv.getArgument(0));
        when(settings.findById("global")).thenReturn(Optional.of(SystemSettingDocument.builder().id("global").values(new HashMap<>()).build()));
        when(settings.save(any(SystemSettingDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> result = adminService.overrideFeaturedPoem("poem-42", "Featured for Special Festival", "admin@kavyakosh.in");

        assertNotNull(result);
        assertTrue((Boolean) result.get("isOverride"));
        assertEquals("Featured for Special Festival", result.get("overrideNote"));
        assertTrue(target.getFeatured());

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs, atLeastOnce()).save(docCaptor.capture());
        assertTrue(docCaptor.getAllValues().stream().anyMatch(a -> "OVERRIDE_FEATURED_POEM".equals(a.getAction())));
    }

    @Test
    void testClearFeaturedPoemOverride() {
        when(settings.findById("global")).thenReturn(Optional.of(SystemSettingDocument.builder().id("global").values(new HashMap<>()).build()));
        when(settings.save(any(SystemSettingDocument.class))).thenAnswer(inv -> inv.getArgument(0));
        when(poems.findByPublishedTrue(any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(new org.springframework.data.domain.PageImpl<>(java.util.List.of()));

        Map<String, Object> result = adminService.clearFeaturedPoemOverride("admin@kavyakosh.in");

        assertNotNull(result);
        assertFalse((Boolean) result.get("isOverride"));

        ArgumentCaptor<AuditLogDocument> docCaptor = ArgumentCaptor.forClass(AuditLogDocument.class);
        verify(auditLogs, atLeastOnce()).save(docCaptor.capture());
        assertTrue(docCaptor.getAllValues().stream().anyMatch(a -> "CLEAR_FEATURED_POEM_OVERRIDE".equals(a.getAction())));
    }

    @Test
    void testSetAndClearAnnouncement() {
        when(settings.findById("global")).thenReturn(Optional.of(SystemSettingDocument.builder().id("global").values(new HashMap<>()).build()));
        when(settings.save(any(SystemSettingDocument.class))).thenAnswer(inv -> inv.getArgument(0));

        Map<String, Object> announcement = Map.of(
                "message", "Welcome to KavyaKosh Ghazal Utsav 2026",
                "type", "celebration",
                "link", "/competitions",
                "linkText", "View Challenges"
        );

        SystemSettingDocument setDoc = adminService.setAnnouncement(announcement, "admin@kavyakosh.in");
        assertNotNull(setDoc);
        assertEquals(true, setDoc.getValues().get("announcementEnabled"));
        assertEquals("Welcome to KavyaKosh Ghazal Utsav 2026", setDoc.getValues().get("announcementMessage"));
        assertEquals("celebration", setDoc.getValues().get("announcementType"));

        SystemSettingDocument clearedDoc = adminService.clearAnnouncement("admin@kavyakosh.in");
        assertNotNull(clearedDoc);
        assertEquals(false, clearedDoc.getValues().get("announcementEnabled"));
    }
}
