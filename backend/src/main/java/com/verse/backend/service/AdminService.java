package com.verse.backend.service;

import com.verse.backend.document.*;
import com.verse.backend.entity.*;
import com.verse.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final UserRepository users;
    private final PoemDocumentRepository poems;
    private final CommentDocumentRepository comments;
    private final ReviewRequestRepository reviews;
    private final ChallengeRepository competitions;
    private final CompetitionSubmissionRepository submissions;
    private final MarketplaceItemRepository listings;
    private final OrderDocumentRepository orders;
    private final SubscriptionRepository subscriptions;
    private final AuditLogRepository auditLogs;
    private final JpaAuditLogRepository jpaAuditLogs;
    private final FlaggedContentRepository flags;
    private final PoemRepository poemRepository;
    private final SystemSettingRepository settings;
    private final PoemInteractionRepository interactions;
    private final MarketplaceReviewRepository marketplaceReviews;

    public AdminService(
            UserRepository users,
            PoemDocumentRepository poems,
            CommentDocumentRepository comments,
            ReviewRequestRepository reviews,
            ChallengeRepository competitions,
            CompetitionSubmissionRepository submissions,
            MarketplaceItemRepository listings,
            OrderDocumentRepository orders,
            SubscriptionRepository subscriptions,
            AuditLogRepository auditLogs,
            JpaAuditLogRepository jpaAuditLogs,
            FlaggedContentRepository flags,
            PoemRepository poemRepository,
            SystemSettingRepository settings,
            PoemInteractionRepository interactions,
            MarketplaceReviewRepository marketplaceReviews
    ) {
        this.users = users;
        this.poems = poems;
        this.comments = comments;
        this.reviews = reviews;
        this.competitions = competitions;
        this.submissions = submissions;
        this.listings = listings;
        this.orders = orders;
        this.subscriptions = subscriptions;
        this.auditLogs = auditLogs;
        this.jpaAuditLogs = jpaAuditLogs;
        this.flags = flags;
        this.poemRepository = poemRepository;
        this.settings = settings;
        this.interactions = interactions;
        this.marketplaceReviews = marketplaceReviews;
    }

    public Map<String, Object> dashboard() {
        return dashboard("30d");
    }

    public Map<String, Object> dashboard(String range) {
        String cleanRange = (range != null && !range.isBlank()) ? range.toLowerCase().trim() : "30d";
        int daysBack = switch (cleanRange) {
            case "7d" -> 7;
            case "90d" -> 90;
            case "all", "6m", "180d" -> 180;
            default -> 30;
        };

        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(daysBack - 1);
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM dd");
        DateTimeFormatter dayOfWeekFormatter = DateTimeFormatter.ofPattern("EEE");

        // 1. Fetch collections
        List<PoemDocument> allPoems = poems.findAll();
        List<User> allUsers = users.findAll();
        List<Challenge> allCompetitions = competitions.findAll();
        List<OrderDocument> allOrders = orders.findAll();
        List<Subscription> allSubscriptions = subscriptions.findAll();
        List<CommentDocument> allComments = comments.findAll();
        List<ReviewRequestDocument> allReviews = reviews.findAll();
        List<MarketplaceReviewDocument> allMarketplaceReviews = (marketplaceReviews != null) ? marketplaceReviews.findAll() : Collections.emptyList();
        List<PoemInteractionDocument> allInteractions = (interactions != null) ? interactions.findAll() : Collections.emptyList();

        // 2. High-level KPIs
        long publishedPoemsCount = allPoems.stream().filter(p -> Boolean.TRUE.equals(p.getPublished())).count();
        long activeCompetitionsCount = allCompetitions.stream().filter(c -> c.getStatus() == Challenge.Status.ACTIVE).count();
        long upcomingCompetitionsCount = allCompetitions.stream().filter(c -> c.getStatus() == Challenge.Status.UPCOMING).count();
        long closedCompetitionsCount = allCompetitions.stream().filter(c -> c.getStatus() == Challenge.Status.CLOSED).count();
        int totalCompetitionParticipants = allCompetitions.stream()
                .filter(c -> c.getStatus() == Challenge.Status.ACTIVE)
                .mapToInt(c -> c.getParticipantCount() != null ? c.getParticipantCount() : 0).sum();

        // Revenue calculations
        BigDecimal marketplaceRevenue = allOrders.stream()
                .filter(o -> "COMPLETED".equalsIgnoreCase(o.getPaymentStatus()) || o.getPaymentStatus() == null)
                .map(OrderDocument::getTotalAmount).filter(Objects::nonNull).reduce(BigDecimal.ZERO, BigDecimal::add);

        long activeLiteSubs = allSubscriptions.stream().filter(s -> s.getStatus() == Subscription.Status.ACTIVE && s.getTier() == Subscription.Tier.LITE).count();
        long activeProSubs = allSubscriptions.stream().filter(s -> s.getStatus() == Subscription.Status.ACTIVE && s.getTier() == Subscription.Tier.PRO).count();
        BigDecimal subscriptionRevenue = BigDecimal.valueOf(activeLiteSubs * 199L + activeProSubs * 499L);
        BigDecimal totalRevenue = marketplaceRevenue.add(subscriptionRevenue);

        // Engagement totals
        long totalLikesFromPoems = allPoems.stream().mapToLong(p -> Optional.ofNullable(p.getLikesCount()).orElse(0)).sum();
        long realLikesCount = allInteractions.stream().filter(PoemInteractionDocument::isLiked).count();
        long totalLikes = Math.max(totalLikesFromPoems, realLikesCount);

        long totalCommentsFromDoc = allComments.stream().filter(c -> !Boolean.TRUE.equals(c.getRemoved())).count();
        long totalCommentsFromPoems = allPoems.stream().mapToLong(p -> Optional.ofNullable(p.getCommentsCount()).orElse(0)).sum();
        long totalComments = Math.max(totalCommentsFromDoc, totalCommentsFromPoems);

        long totalPeerReviews = allReviews.size();
        long totalMarketplaceReviews = allMarketplaceReviews.size();
        long totalReviews = totalPeerReviews + totalMarketplaceReviews;

        long totalViews = allPoems.stream().mapToLong(p -> Optional.ofNullable(p.getViewsCount()).orElse(0)).sum();

        // 3. Daily trends aggregation
        Map<LocalDate, Map<String, Object>> trendMap = new LinkedHashMap<>();
        for (LocalDate d = startDate; !d.isAfter(today); d = d.plusDays(1)) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", d.toString());
            point.put("label", d.format(labelFormatter));
            point.put("day", d.format(dayOfWeekFormatter));
            point.put("likes", 0L);
            point.put("comments", 0L);
            point.put("reviews", 0L);
            point.put("views", 0L);
            point.put("revenue", BigDecimal.ZERO);
            point.put("marketplaceRevenue", BigDecimal.ZERO);
            point.put("subscriptionRevenue", BigDecimal.ZERO);
            point.put("poems", 0L);
            point.put("users", 0L);
            trendMap.put(d, point);
        }

        // Aggregate Poem publishings & likes/views by date
        for (PoemDocument p : allPoems) {
            LocalDate d = toLocalDate(p.getCreatedAt());
            if (d != null && trendMap.containsKey(d)) {
                Map<String, Object> point = trendMap.get(d);
                point.put("poems", ((Long) point.get("poems")) + 1);
                point.put("views", ((Long) point.get("views")) + (p.getViewsCount() != null ? p.getViewsCount() : 0));
                point.put("likes", ((Long) point.get("likes")) + (p.getLikesCount() != null ? p.getLikesCount() : 0));
                point.put("comments", ((Long) point.get("comments")) + (p.getCommentsCount() != null ? p.getCommentsCount() : 0));
            }
        }

        // Aggregate real-time Likes
        for (PoemInteractionDocument i : allInteractions) {
            if (i.isLiked() && i.getUpdatedAt() != null) {
                LocalDate d = toLocalDate(i.getUpdatedAt());
                if (d != null && trendMap.containsKey(d)) {
                    Map<String, Object> point = trendMap.get(d);
                    point.put("likes", ((Long) point.get("likes")) + 1);
                }
            }
        }

        // Aggregate real-time Comments
        for (CommentDocument c : allComments) {
            if (!Boolean.TRUE.equals(c.getRemoved()) && c.getCreatedAt() != null) {
                LocalDate d = toLocalDate(c.getCreatedAt());
                if (d != null && trendMap.containsKey(d)) {
                    Map<String, Object> point = trendMap.get(d);
                    point.put("comments", ((Long) point.get("comments")) + 1);
                }
            }
        }

        // Aggregate Literary Reviews
        for (ReviewRequestDocument r : allReviews) {
            Instant t = r.getReviewedAt() != null ? r.getReviewedAt() : r.getCreatedAt();
            LocalDate d = toLocalDate(t);
            if (d != null && trendMap.containsKey(d)) {
                Map<String, Object> point = trendMap.get(d);
                point.put("reviews", ((Long) point.get("reviews")) + 1);
            }
        }

        // Aggregate Marketplace Reviews
        for (MarketplaceReviewDocument mr : allMarketplaceReviews) {
            LocalDate d = toLocalDate(mr.getCreatedAt());
            if (d != null && trendMap.containsKey(d)) {
                Map<String, Object> point = trendMap.get(d);
                point.put("reviews", ((Long) point.get("reviews")) + 1);
            }
        }

        // Aggregate Orders / Revenue
        for (OrderDocument o : allOrders) {
            if ("COMPLETED".equalsIgnoreCase(o.getPaymentStatus()) || o.getPaymentStatus() == null) {
                LocalDate d = toLocalDate(o.getCreatedAt());
                if (d != null && trendMap.containsKey(d)) {
                    Map<String, Object> point = trendMap.get(d);
                    BigDecimal currentRev = (BigDecimal) point.get("revenue");
                    BigDecimal currentMkt = (BigDecimal) point.get("marketplaceRevenue");
                    BigDecimal amt = o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO;
                    point.put("revenue", currentRev.add(amt));
                    point.put("marketplaceRevenue", currentMkt.add(amt));
                }
            }
        }

        // Aggregate Subscriptions / Revenue
        for (Subscription s : allSubscriptions) {
            LocalDate d = toLocalDate(s.getCreatedAt());
            if (d != null && trendMap.containsKey(d)) {
                BigDecimal subPrice = s.getTier() == Subscription.Tier.PRO ? BigDecimal.valueOf(499)
                        : s.getTier() == Subscription.Tier.LITE ? BigDecimal.valueOf(199) : BigDecimal.ZERO;
                Map<String, Object> point = trendMap.get(d);
                BigDecimal currentRev = (BigDecimal) point.get("revenue");
                BigDecimal currentSub = (BigDecimal) point.get("subscriptionRevenue");
                point.put("revenue", currentRev.add(subPrice));
                point.put("subscriptionRevenue", currentSub.add(subPrice));
            }
        }

        // Aggregate Users
        for (User u : allUsers) {
            LocalDate d = toLocalDate(u.getCreatedAt());
            if (d != null && trendMap.containsKey(d)) {
                Map<String, Object> point = trendMap.get(d);
                point.put("users", ((Long) point.get("users")) + 1);
            }
        }

        // Cumulative sums
        long cumLikes = 0;
        long cumComments = 0;
        long cumReviews = 0;
        BigDecimal cumRevenue = BigDecimal.ZERO;
        List<Map<String, Object>> engagementTrends = new ArrayList<>();
        for (Map<String, Object> point : trendMap.values()) {
            cumLikes += (Long) point.get("likes");
            cumComments += (Long) point.get("comments");
            cumReviews += (Long) point.get("reviews");
            cumRevenue = cumRevenue.add((BigDecimal) point.get("revenue"));
            point.put("cumulativeLikes", cumLikes);
            point.put("cumulativeComments", cumComments);
            point.put("cumulativeReviews", cumReviews);
            point.put("cumulativeRevenue", cumRevenue);
            engagementTrends.add(point);
        }

        // 4. Distributions
        // Category distribution
        Map<String, Long> categoryCounts = allPoems.stream()
                .filter(p -> p.getCategory() != null && !p.getCategory().isBlank())
                .collect(Collectors.groupingBy(PoemDocument::getCategory, Collectors.counting()));
        long totalPoemsWithCat = categoryCounts.values().stream().mapToLong(Long::longValue).sum();
        List<Map<String, Object>> categoryDistribution = categoryCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(6)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("category", e.getKey());
                    m.put("count", e.getValue());
                    m.put("percentage", totalPoemsWithCat > 0 ? Math.round((e.getValue() * 100.0) / totalPoemsWithCat) : 0);
                    return m;
                }).toList();

        // Language distribution
        Map<String, Long> languageCounts = allPoems.stream()
                .filter(p -> p.getLanguage() != null && !p.getLanguage().isBlank())
                .collect(Collectors.groupingBy(PoemDocument::getLanguage, Collectors.counting()));
        long totalPoemsWithLang = languageCounts.values().stream().mapToLong(Long::longValue).sum();
        List<Map<String, Object>> languageDistribution = languageCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("language", e.getKey());
                    m.put("count", e.getValue());
                    m.put("percentage", totalPoemsWithLang > 0 ? Math.round((e.getValue() * 100.0) / totalPoemsWithLang) : 0);
                    return m;
                }).toList();

        // Mood distribution
        Map<String, Long> moodCounts = allPoems.stream()
                .filter(p -> p.getMood() != null && !p.getMood().isBlank())
                .collect(Collectors.groupingBy(PoemDocument::getMood, Collectors.counting()));
        long totalPoemsWithMood = moodCounts.values().stream().mapToLong(Long::longValue).sum();
        List<Map<String, Object>> moodDistribution = moodCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("mood", e.getKey());
                    m.put("count", e.getValue());
                    m.put("percentage", totalPoemsWithMood > 0 ? Math.round((e.getValue() * 100.0) / totalPoemsWithMood) : 0);
                    return m;
                }).toList();

        // 5. Active Competitions List
        List<Map<String, Object>> activeCompetitionsList = allCompetitions.stream()
                .filter(c -> c.getStatus() == Challenge.Status.ACTIVE)
                .sorted(Comparator.comparing(Challenge::getDeadline, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(c -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", c.getId());
                    m.put("title", c.getTitle());
                    m.put("theme", c.getTheme());
                    m.put("participantCount", c.getParticipantCount());
                    m.put("deadline", c.getDeadline());
                    m.put("prizeDescription", c.getPrizeDescription());
                    long daysLeft = c.getDeadline() != null ? Duration.between(LocalDateTime.now(), c.getDeadline()).toDays() : 0;
                    m.put("daysLeft", Math.max(0, daysLeft));
                    return m;
                }).toList();

        // 6. Top Engaged Poems
        List<Map<String, Object>> topPoems = allPoems.stream()
                .filter(p -> Boolean.TRUE.equals(p.getPublished()))
                .sorted((a, b) -> Double.compare(
                        Optional.ofNullable(b.getTrendingScore()).orElse(0.0),
                        Optional.ofNullable(a.getTrendingScore()).orElse(0.0)
                ))
                .limit(5)
                .map(p -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", p.getId());
                    m.put("title", p.getTitle());
                    m.put("author", p.getAuthor() != null ? p.getAuthor().getUsername() : "Anonymous");
                    m.put("category", p.getCategory());
                    m.put("language", p.getLanguage());
                    m.put("likesCount", p.getLikesCount() != null ? p.getLikesCount() : 0);
                    m.put("commentsCount", p.getCommentsCount() != null ? p.getCommentsCount() : 0);
                    m.put("viewsCount", p.getViewsCount() != null ? p.getViewsCount() : 0);
                    m.put("trendingScore", p.getTrendingScore() != null ? p.getTrendingScore() : 0.0);
                    return m;
                }).toList();

        // 7. User Breakdown
        Map<String, Object> userBreakdown = new LinkedHashMap<>();
        userBreakdown.put("total", allUsers.size());
        userBreakdown.put("active", allUsers.stream().filter(u -> u.getStatus() == User.UserStatus.ACTIVE).count());
        userBreakdown.put("suspended", allUsers.stream().filter(u -> u.getStatus() == User.UserStatus.SUSPENDED).count());
        userBreakdown.put("banned", allUsers.stream().filter(u -> u.getStatus() == User.UserStatus.BANNED).count());
        userBreakdown.put("writers", allUsers.stream().filter(u -> u.getRole() == User.Role.USER).count());
        userBreakdown.put("reviewers", allUsers.stream().filter(u -> u.getRole() == User.Role.REVIEWER).count());
        userBreakdown.put("premium", allUsers.stream().filter(u -> u.getRole() == User.Role.PREMIUM).count());
        userBreakdown.put("admins", allUsers.stream().filter(u -> u.getRole() == User.Role.ADMIN).count());

        // 8. Revenue Breakdown
        Map<String, Object> revenueBreakdown = new LinkedHashMap<>();
        revenueBreakdown.put("total", totalRevenue);
        revenueBreakdown.put("marketplace", marketplaceRevenue);
        revenueBreakdown.put("subscriptions", subscriptionRevenue);
        revenueBreakdown.put("completedOrdersCount", allOrders.stream().filter(o -> "COMPLETED".equalsIgnoreCase(o.getPaymentStatus()) || o.getPaymentStatus() == null).count());
        revenueBreakdown.put("activeSubscribersCount", activeLiteSubs + activeProSubs);
        revenueBreakdown.put("liteSubscribers", activeLiteSubs);
        revenueBreakdown.put("proSubscribers", activeProSubs);

        // 9. Recent Activity Feed
        List<Map<String, Object>> recentActivity = new ArrayList<>();
        allReviews.stream()
                .sorted(Comparator.comparing(ReviewRequestDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(3)
                .forEach(r -> {
                    Map<String, Object> act = new LinkedHashMap<>();
                    act.put("type", "REVIEW");
                    act.put("title", "Review on '" + r.getPoemTitle() + "'");
                    act.put("actor", r.getReviewerUsername() != null ? r.getReviewerUsername() : "Editorial Board");
                    act.put("status", r.getStatus());
                    act.put("timestamp", r.getCreatedAt());
                    recentActivity.add(act);
                });
        allComments.stream()
                .sorted(Comparator.comparing(CommentDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(3)
                .forEach(c -> {
                    Map<String, Object> act = new LinkedHashMap<>();
                    act.put("type", "COMMENT");
                    act.put("title", "Comment: \"" + (c.getContent() != null && c.getContent().length() > 40 ? c.getContent().substring(0, 40) + "..." : c.getContent()) + "\"");
                    act.put("actor", c.getUsername());
                    act.put("timestamp", c.getCreatedAt());
                    recentActivity.add(act);
                });
        allOrders.stream()
                .sorted(Comparator.comparing(OrderDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(2)
                .forEach(o -> {
                    Map<String, Object> act = new LinkedHashMap<>();
                    act.put("type", "ORDER");
                    act.put("title", "Order #" + (o.getId() != null && o.getId().length() > 8 ? o.getId().substring(0, 8) : o.getId()) + " (" + o.getCurrency() + " " + o.getTotalAmount() + ")");
                    act.put("actor", o.getUsername());
                    act.put("timestamp", o.getCreatedAt());
                    recentActivity.add(act);
                });

        // 10. Assemble final response
        Map<String, Object> res = new LinkedHashMap<>();
        // Baseline keys for direct compatibility
        res.put("totalUsers", allUsers.size());
        res.put("poemsPublished", publishedPoemsCount);
        res.put("activeCompetitions", activeCompetitionsCount);
        res.put("revenue", totalRevenue);
        res.put("marketplaceRevenue", marketplaceRevenue);
        res.put("subscriptionRevenue", subscriptionRevenue);
        res.put("likes", totalLikes);
        res.put("comments", totalComments);
        res.put("reviews", totalReviews);
        res.put("views", totalViews);

        // Enhanced payload for the site-wide analytics dashboard
        res.put("range", cleanRange);
        res.put("engagementTrends", engagementTrends);
        res.put("categoryDistribution", categoryDistribution);
        res.put("languageDistribution", languageDistribution);
        res.put("moodDistribution", moodDistribution);
        res.put("activeCompetitionsList", activeCompetitionsList);
        res.put("topPoems", topPoems);
        res.put("userBreakdown", userBreakdown);
        res.put("revenueBreakdown", revenueBreakdown);
        res.put("recentActivity", recentActivity);

        return res;
    }

    private LocalDate toLocalDate(Instant instant) {
        if (instant == null) return null;
        return LocalDateTime.ofInstant(instant, ZoneId.systemDefault()).toLocalDate();
    }

    private LocalDate toLocalDate(LocalDateTime ldt) {
        if (ldt == null) return null;
        return ldt.toLocalDate();
    }

    public List<User> users(String query, String status, String role) {
        return users.findAll().stream().filter(u -> query == null || query.isBlank() ||
                contains(u.getEmail(), query) || contains(u.getUsername(), query))
                .filter(u -> status == null || status.isBlank() || u.getStatus().name().equalsIgnoreCase(status))
                .filter(u -> role == null || role.isBlank() || u.getRole().name().equalsIgnoreCase(role)).toList();
    }

    public Map<String, Object> getUserProfile(Long id, String admin) {
        User user = users.findById(id).orElseThrow();
        long poemCount = poems.findAll().stream()
                .filter(p -> p.getAuthor() != null &&
                        (Objects.equals(user.getId(), p.getAuthor().getUserId()) ||
                         (user.getUsername() != null && user.getUsername().equalsIgnoreCase(p.getAuthor().getUsername()))))
                .count();
        long reviewCount = reviews.findAll().stream()
                .filter(r -> (user.getUsername() != null && user.getUsername().equalsIgnoreCase(r.getReviewerUsername()))
                          || (user.getEmail() != null && user.getEmail().equalsIgnoreCase(r.getReviewerUsername())))
                .count();
        audit(admin, "VIEW_PROFILE", "USER", id.toString(), "Viewed profile for " + user.getEmail());
        Map<String, Object> res = new HashMap<>();
        res.put("user", user);
        res.put("poemCount", poemCount);
        res.put("reviewCount", reviewCount);
        return res;
    }

    @Transactional
    public User suspendUser(Long id, String reason, String admin) {
        User user = users.findById(id).orElseThrow();
        user.setStatus(User.UserStatus.SUSPENDED);
        users.save(user);
        audit(admin, "SUSPEND_USER", "USER", id.toString(), reason != null && !reason.isBlank() ? reason : "Suspended by admin");
        return user;
    }

    @Transactional
    public User banUser(Long id, String reason, String admin) {
        User user = users.findById(id).orElseThrow();
        user.setStatus(User.UserStatus.BANNED);
        users.save(user);
        audit(admin, "BAN_USER", "USER", id.toString(), reason != null && !reason.isBlank() ? reason : "Banned by admin");
        return user;
    }

    @Transactional
    public User unbanUser(Long id, String admin) {
        User user = users.findById(id).orElseThrow();
        user.setStatus(User.UserStatus.ACTIVE);
        users.save(user);
        audit(admin, "UNBAN_USER", "USER", id.toString(), "Account restored to ACTIVE");
        return user;
    }

    @Transactional
    public User userStatus(Long id, User.UserStatus status, String admin) {
        User user = users.findById(id).orElseThrow();
        user.setStatus(status);
        users.save(user);
        String actionName = switch (status) {
            case ACTIVE -> "UNBAN_USER";
            case SUSPENDED -> "SUSPEND_USER";
            case BANNED -> "BAN_USER";
        };
        audit(admin, actionName, "USER", id.toString(), "Status set to " + status.name());
        return user;
    }

    @Transactional
    public User userRole(Long id, User.Role role, String admin) {
        User user = users.findById(id).orElseThrow();
        user.setRole(role);
        users.save(user);
        audit(admin, "CHANGE_ROLE", "USER", id.toString(), "Role changed to " + role.name());
        return user;
    }

    public List<Map<String, Object>> flagged() {
        List<FlaggedContentDocument> allFlags = flags.findAll().stream()
                .sorted(Comparator.comparing(FlaggedContentDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        return allFlags.stream().map(f -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", f.getId());
            map.put("targetType", f.getTargetType());
            map.put("targetId", f.getTargetId());
            map.put("reason", f.getReason());
            map.put("status", f.getStatus());
            map.put("flaggedBy", f.getFlaggedBy());
            map.put("createdAt", f.getCreatedAt());

            if ("POEM".equalsIgnoreCase(f.getTargetType())) {
                PoemDocument p = poems.findById(f.getTargetId()).orElse(null);
                if (p != null) {
                    map.put("title", p.getTitle());
                    map.put("excerpt", p.getExcerpt());
                    map.put("content", p.getContent());
                    map.put("author", p.getAuthor() != null ? p.getAuthor().getUsername() : "Unknown");
                    map.put("isPublished", p.getPublished());
                }
            } else if ("COMMENT".equalsIgnoreCase(f.getTargetType())) {
                CommentDocument c = comments.findById(f.getTargetId()).orElse(null);
                if (c != null) {
                    map.put("content", c.getContent());
                    map.put("author", c.getUsername());
                    map.put("isRemoved", c.getRemoved());
                    map.put("poemId", c.getPoemId());
                }
            }
            return map;
        }).toList();
    }

    @Transactional
    public FlaggedContentDocument flag(String type, String id, String reason, String admin) {
        String safeReason = (reason != null && !reason.isBlank()) ? reason : "Manually flagged by administrator";
        FlaggedContentDocument flag = flags.save(FlaggedContentDocument.builder()
                .targetType(type.toUpperCase())
                .targetId(id)
                .reason(safeReason)
                .flaggedBy(admin)
                .status("OPEN")
                .createdAt(Instant.now())
                .build());
        audit(admin, "FLAG_CONTENT", type.toUpperCase(), id, safeReason);
        return flag;
    }

    @Transactional
    public FlaggedContentDocument resolveFlag(String id, String resolution, String admin) {
        FlaggedContentDocument flag = flags.findById(id).orElseThrow();
        flag.setStatus("RESOLVED");
        flags.save(flag);
        audit(admin, "RESOLVE_FLAG", "FLAG", id, resolution != null ? resolution : "Flag resolved by admin");
        return flag;
    }

    @Transactional
    public FlaggedContentDocument dismissFlag(String id, String reason, String admin) {
        FlaggedContentDocument flag = flags.findById(id).orElseThrow();
        flag.setStatus("DISMISSED");
        flags.save(flag);
        audit(admin, "DISMISS_FLAG", "FLAG", id, reason != null ? reason : "Flag dismissed by admin");
        return flag;
    }

    @Transactional
    public Object moderate(String type, String id, boolean restore, String admin) {
        String action = restore ? "RESTORE_CONTENT" : "REMOVE_CONTENT";
        if ("POEM".equalsIgnoreCase(type)) {
            PoemDocument poem = poems.findById(id).orElse(null);
            if (poem != null) {
                poem.setPublished(restore);
                poems.save(poem);
            }
            try {
                Long poemId = Long.parseLong(id);
                poemRepository.findById(poemId).ifPresent(p -> {
                    p.setPublished(restore);
                    poemRepository.save(p);
                });
            } catch (Exception ignored) {}
        } else if ("COMMENT".equalsIgnoreCase(type)) {
            CommentDocument comment = comments.findById(id).orElseThrow();
            comment.setRemoved(!restore);
            comments.save(comment);
        } else {
            throw new IllegalArgumentException("Unsupported content type: " + type);
        }

        try {
            flags.findAll().stream()
                    .filter(f -> type.equalsIgnoreCase(f.getTargetType()) && id.equalsIgnoreCase(f.getTargetId()))
                    .forEach(f -> {
                        f.setStatus("RESOLVED");
                        flags.save(f);
                    });
        } catch (Exception ignored) {}

        audit(admin, action, type.toUpperCase(), id, restore ? "Content restored by admin" : "Content removed by admin");
        return Map.of("targetType", type.toUpperCase(), "targetId", id, "restored", restore);
    }

    public List<PoemDocument> allPoems(String query, String status) {
        return poems.findAll().stream()
                .filter(p -> query == null || query.isBlank()
                        || contains(p.getTitle(), query)
                        || contains(p.getExcerpt(), query)
                        || contains(p.getContent(), query)
                        || (p.getAuthor() != null && contains(p.getAuthor().getUsername(), query))
                        || (p.getId() != null && p.getId().equalsIgnoreCase(query)))
                .filter(p -> {
                    if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) return true;
                    if ("PUBLISHED".equalsIgnoreCase(status)) return Boolean.TRUE.equals(p.getPublished());
                    if ("REMOVED".equalsIgnoreCase(status) || "UNPUBLISHED".equalsIgnoreCase(status)) return Boolean.FALSE.equals(p.getPublished());
                    return true;
                })
                .sorted(Comparator.comparing(PoemDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<CommentDocument> allComments(String query, String status) {
        return comments.findAll().stream()
                .filter(c -> query == null || query.isBlank()
                        || contains(c.getContent(), query)
                        || contains(c.getUsername(), query)
                        || (c.getId() != null && c.getId().equalsIgnoreCase(query))
                        || (c.getPoemId() != null && c.getPoemId().equalsIgnoreCase(query)))
                .filter(c -> {
                    if (status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)) return true;
                    if ("ACTIVE".equalsIgnoreCase(status)) return !Boolean.TRUE.equals(c.getRemoved());
                    if ("REMOVED".equalsIgnoreCase(status)) return Boolean.TRUE.equals(c.getRemoved());
                    return true;
                })
                .sorted(Comparator.comparing(CommentDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<Map<String, Object>> reviewerRoster() {
        List<User> reviewerUsers = users.findAll().stream()
                .filter(u -> u.getRole() == User.Role.REVIEWER)
                .toList();
        List<ReviewRequestDocument> allReviews = reviews.findAll();

        return reviewerUsers.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            map.put("role", u.getRole() != null ? u.getRole().name() : "REVIEWER");
            map.put("status", u.getStatus() != null ? u.getStatus().name() : "ACTIVE");
            map.put("avatarUrl", u.getAvatarUrl());
            map.put("createdAt", u.getCreatedAt());

            List<ReviewRequestDocument> uReviews = allReviews.stream()
                    .filter(r -> r.getReviewerUsername() != null && r.getReviewerUsername().equalsIgnoreCase(u.getUsername()))
                    .toList();

            long completed = uReviews.stream().filter(r -> "COMPLETED".equalsIgnoreCase(r.getStatus())).count();
            long pending = uReviews.stream().filter(r -> !"COMPLETED".equalsIgnoreCase(r.getStatus())).count();
            double avgScore = uReviews.stream()
                    .filter(r -> r.getOverallScore() != null)
                    .mapToDouble(ReviewRequestDocument::getOverallScore)
                    .average()
                    .orElse(0.0);

            Instant lastReviewedAt = uReviews.stream()
                    .map(ReviewRequestDocument::getReviewedAt)
                    .filter(Objects::nonNull)
                    .max(Comparator.naturalOrder())
                    .orElse(null);

            map.put("completedReviews", completed);
            map.put("pendingReviews", pending);
            map.put("totalAssigned", uReviews.size());
            map.put("avgScore", Math.round(avgScore * 10.0) / 10.0);
            map.put("lastReviewedAt", lastReviewedAt);
            return map;
        }).toList();
    }

    public List<User> reviewers() {
        return users.findAll().stream().filter(u -> u.getRole() == User.Role.REVIEWER).toList();
    }

    public List<User> reviewerCandidates(String query) {
        return users.findAll().stream()
                .filter(u -> u.getRole() != User.Role.REVIEWER)
                .filter(u -> query == null || query.isBlank()
                        || contains(u.getUsername(), query)
                        || contains(u.getEmail(), query)
                        || String.valueOf(u.getId()).equals(query))
                .limit(20)
                .toList();
    }

    @Transactional
    public User promoteReviewer(Long userId, String admin) {
        User user = users.findById(userId).orElseThrow();
        user.setRole(User.Role.REVIEWER);
        users.save(user);
        audit(admin, "PROMOTE_REVIEWER", "USER", userId.toString(), "Promoted " + user.getUsername() + " to REVIEWER");
        return user;
    }

    @Transactional
    public User demoteReviewer(Long userId, String admin) {
        User user = users.findById(userId).orElseThrow();
        user.setRole(User.Role.USER);
        users.save(user);
        audit(admin, "DEMOTE_REVIEWER", "USER", userId.toString(), "Demoted " + user.getUsername() + " from REVIEWER to USER");
        return user;
    }

    public List<ReviewRequestDocument> reviewHistory() {
        return reviews.findAll().stream()
                .sorted(Comparator.comparing(ReviewRequestDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<ReviewRequestDocument> reviewHistoryFiltered(String query, String reviewerUsername, String status) {
        return reviews.findAll().stream()
                .filter(r -> reviewerUsername == null || reviewerUsername.isBlank() || "ALL".equalsIgnoreCase(reviewerUsername)
                        || (r.getReviewerUsername() != null && r.getReviewerUsername().equalsIgnoreCase(reviewerUsername)))
                .filter(r -> status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)
                        || (r.getStatus() != null && r.getStatus().equalsIgnoreCase(status)))
                .filter(r -> query == null || query.isBlank()
                        || contains(r.getPoemTitle(), query)
                        || contains(r.getAuthorUsername(), query)
                        || contains(r.getReviewerUsername(), query)
                        || contains(r.getPoemId(), query)
                        || contains(r.getId(), query)
                        || contains(r.getReviewerFeedback(), query))
                .sorted(Comparator.comparing(ReviewRequestDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional
    public ReviewRequestDocument reviewScore(String id, Double score, String admin) {
        return reviewScore(id, score, null, admin);
    }

    @Transactional
    public ReviewRequestDocument reviewScore(String id, Double score, String reason, String admin) {
        ReviewRequestDocument review = reviews.findById(id).orElseThrow();
        review.setOverallScore(score);
        review.setUpdatedAt(Instant.now());
        ReviewRequestDocument saved = reviews.save(review);
        String details = (reason != null && !reason.isBlank()) ? (score + " | Reason: " + reason) : String.valueOf(score);
        audit(admin, "OVERRIDE_REVIEW_SCORE", "REVIEW", id, details);
        return saved;
    }

    @Transactional
    public void deleteReview(String id, String admin) {
        deleteReview(id, null, admin);
    }

    @Transactional
    public void deleteReview(String id, String reason, String admin) {
        reviews.deleteById(id);
        String details = (reason != null && !reason.isBlank()) ? reason : "Deleted by admin";
        audit(admin, "DELETE_REVIEW", "REVIEW", id, details);
    }

    private LocalDateTime parseDateTime(Object value) {
        if (value == null) return null;
        String str = String.valueOf(value).trim();
        if (str.isEmpty()) return null;
        try {
            if (str.endsWith("Z")) {
                return LocalDateTime.ofInstant(Instant.parse(str), ZoneId.systemDefault());
            }
            if (str.length() == 16) {
                return LocalDateTime.parse(str + ":00");
            }
            return LocalDateTime.parse(str);
        } catch (Exception e) {
            try {
                return LocalDateTime.ofInstant(Instant.parse(str), ZoneId.systemDefault());
            } catch (Exception e2) {
                return LocalDateTime.now().plusDays(7);
            }
        }
    }

    public List<Challenge> competitionList() {
        List<Challenge> list = competitions.findAll();
        for (Challenge c : list) {
            if (c.getId() != null) {
                long count = submissions.countByCompetitionId(c.getId());
                c.setParticipantCount((int) count);
            }
        }
        return list.stream()
                .sorted(Comparator.comparing(Challenge::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<CompetitionSubmissionDocument> leaderboard(Long competitionId) {
        return submissions.findByCompetitionIdOrderByTotalScoreDesc(competitionId);
    }

    @Transactional
    public CompetitionSubmissionDocument publishWinner(String id, Integer rank, String admin) {
        CompetitionSubmissionDocument submission = submissions.findById(id).orElseThrow();
        submission.setRank(rank);
        CompetitionSubmissionDocument saved = submissions.save(submission);
        audit(admin, "PUBLISH_WINNER", "COMPETITION_SUBMISSION", id, "rank=" + rank);
        return saved;
    }

    @Transactional
    public Challenge saveCompetition(Map<String, Object> body, Long id, String admin) {
        Challenge c = id == null ? new Challenge() : competitions.findById(id).orElseThrow();
        c.setTitle(String.valueOf(body.getOrDefault("title", c.getTitle())));
        c.setDescription(String.valueOf(body.getOrDefault("description", c.getDescription())));
        c.setTheme((String) body.getOrDefault("theme", c.getTheme()));
        c.setPrizeDescription((String) body.getOrDefault("prizeDescription", c.getPrizeDescription()));
        if (body.get("deadline") != null) {
            c.setDeadline(parseDateTime(body.get("deadline")));
        }
        if (body.get("status") != null) {
            c.setStatus(Challenge.Status.valueOf(String.valueOf(body.get("status")).toUpperCase()));
        }
        Challenge saved = competitions.save(c);
        audit(admin, id == null ? "CREATE_COMPETITION" : "EDIT_COMPETITION", "COMPETITION", saved.getId().toString(), saved.getTitle());
        return saved;
    }

    @Transactional
    public Challenge closeCompetition(Long id, String admin) {
        Challenge c = competitions.findById(id).orElseThrow();
        c.setStatus(Challenge.Status.CLOSED);
        competitions.save(c);
        audit(admin, "CLOSE_COMPETITION", "COMPETITION", id.toString(), "closed");
        return c;
    }

    @Transactional
    public Challenge reopenCompetition(Long id, String admin) {
        Challenge c = competitions.findById(id).orElseThrow();
        c.setStatus(Challenge.Status.ACTIVE);
        competitions.save(c);
        audit(admin, "REOPEN_COMPETITION", "COMPETITION", id.toString(), "reopened to ACTIVE");
        return c;
    }

    @Transactional
    public void deleteCompetition(Long id, String admin) {
        Challenge c = competitions.findById(id).orElseThrow();
        competitions.deleteById(id);
        audit(admin, "DELETE_COMPETITION", "COMPETITION", id.toString(), "Deleted: " + c.getTitle());
    }

    @Transactional
    public Challenge adjustCompetitionWindow(Long id, String newDeadlineStr, String admin) {
        Challenge c = competitions.findById(id).orElseThrow();
        LocalDateTime newDeadline = parseDateTime(newDeadlineStr);
        c.setDeadline(newDeadline);
        competitions.save(c);
        audit(admin, "ADJUST_COMPETITION_WINDOW", "COMPETITION", id.toString(), "New deadline: " + newDeadline);
        return c;
    }

    @Transactional
    public CompetitionSubmissionDocument editSubmissionScore(String id, Double juryScore, Integer votesCount, String admin) {
        CompetitionSubmissionDocument submission = submissions.findById(id).orElseThrow();
        if (juryScore != null) submission.setJuryScore(juryScore);
        if (votesCount != null) submission.setVotesCount(votesCount);
        double total = (submission.getVotesCount() * 1.0) + (submission.getJuryScore() * 2.0);
        submission.setTotalScore(Math.round(total * 10.0) / 10.0);
        CompetitionSubmissionDocument saved = submissions.save(submission);
        audit(admin, "EDIT_SUBMISSION_SCORE", "COMPETITION_SUBMISSION", id, "jury=" + submission.getJuryScore() + ", votes=" + submission.getVotesCount() + ", total=" + submission.getTotalScore());
        return saved;
    }

    @Transactional
    public Map<String, Object> finalizeAndPublishWinners(Long competitionId, Map<String, Object> body, String admin) {
        Challenge challenge = competitions.findById(competitionId).orElseThrow();
        challenge.setStatus(Challenge.Status.CLOSED);
        competitions.save(challenge);

        List<CompetitionSubmissionDocument> subs = submissions.findByCompetitionIdOrderByTotalScoreDesc(competitionId);
        int winnersCount = 0;

        if (body != null && body.get("winnerRanks") instanceof Map<?, ?> rankMap) {
            for (Map.Entry<?, ?> entry : rankMap.entrySet()) {
                String subId = String.valueOf(entry.getKey());
                Integer rank = Integer.valueOf(String.valueOf(entry.getValue()));
                subs.stream().filter(s -> s.getId().equals(subId)).findFirst().ifPresent(s -> {
                    s.setRank(rank);
                    submissions.save(s);
                });
                winnersCount++;
            }
        } else {
            // Auto-assign top 3 if present
            if (!subs.isEmpty()) {
                for (int i = 0; i < Math.min(3, subs.size()); i++) {
                    CompetitionSubmissionDocument s = subs.get(i);
                    s.setRank(i + 1);
                    submissions.save(s);
                    winnersCount++;
                }
            }
        }

        audit(admin, "FINALIZE_COMPETITION", "COMPETITION", competitionId.toString(), "Finalized with " + winnersCount + " winner(s) announced");
        return Map.of("competitionId", competitionId, "status", "CLOSED", "winnersCount", winnersCount);
    }

    public List<MarketplaceItem> marketplace() {
        return listings.findAll().stream()
                .sorted(Comparator.comparing(MarketplaceItem::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<MarketplaceItem> marketplaceFiltered(String query, String type) {
        return listings.findAll().stream()
                .filter(item -> type == null || type.isBlank() || "ALL".equalsIgnoreCase(type)
                        || (item.getType() != null && item.getType().equalsIgnoreCase(type)))
                .filter(item -> query == null || query.isBlank()
                        || contains(item.getName(), query)
                        || contains(item.getAuthor(), query)
                        || contains(item.getDescription(), query)
                        || String.valueOf(item.getId()).equals(query))
                .sorted(Comparator.comparing(MarketplaceItem::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<OrderDocument> orderList() {
        return orders.findAll().stream()
                .sorted(Comparator.comparing(OrderDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    public List<OrderDocument> orderListFiltered(String query, String status) {
        return orders.findAll().stream()
                .filter(order -> status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)
                        || (order.getPaymentStatus() != null && order.getPaymentStatus().equalsIgnoreCase(status)))
                .filter(order -> {
                    if (query == null || query.isBlank()) return true;
                    if (contains(order.getId(), query) || contains(order.getUsername(), query) || contains(order.getShippingAddress(), query)) {
                        return true;
                    }
                    if (order.getItems() != null) {
                        return order.getItems().stream().anyMatch(i -> contains(i.getName(), query));
                    }
                    return false;
                })
                .sorted(Comparator.comparing(OrderDocument::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();
    }

    @Transactional
    public MarketplaceItem saveListing(Map<String, Object> body, Long id, String admin) {
        MarketplaceItem item = id == null ? new MarketplaceItem() : listings.findById(id).orElseThrow();
        item.setName(String.valueOf(body.getOrDefault("name", item.getName())));
        item.setDescription(String.valueOf(body.getOrDefault("description", item.getDescription())));
        if (body.get("price") != null) item.setPrice(new BigDecimal(String.valueOf(body.get("price"))));
        item.setAuthor((String) body.getOrDefault("author", item.getAuthor()));
        item.setType((String) body.getOrDefault("type", item.getType()));
        if (body.get("imageUrl") != null) item.setImageUrl(String.valueOf(body.get("imageUrl")));
        if (body.get("featured") != null) item.setFeatured(Boolean.parseBoolean(String.valueOf(body.get("featured"))));

        MarketplaceItem saved = listings.save(item);
        audit(admin, id == null ? "ADD_LISTING" : "EDIT_LISTING", "MARKETPLACE", saved.getId().toString(), saved.getName() + " (₹" + saved.getPrice() + ")");
        return saved;
    }

    @Transactional
    public void deleteListing(Long id, String admin) {
        MarketplaceItem item = listings.findById(id).orElse(null);
        listings.deleteById(id);
        String name = item != null ? item.getName() : "removed";
        audit(admin, "REMOVE_LISTING", "MARKETPLACE", id.toString(), name);
    }

    @Transactional
    public OrderDocument refundOrder(String id, String admin) {
        return refundOrder(id, null, admin);
    }

    @Transactional
    public OrderDocument refundOrder(String id, String reason, String admin) {
        OrderDocument order = orders.findById(id).orElseThrow();
        order.setPaymentStatus("REFUNDED");
        OrderDocument saved = orders.save(order);
        String details = "Amount: ₹" + (order.getTotalAmount() != null ? order.getTotalAmount() : "0")
                + (reason != null && !reason.isBlank() ? " | Reason: " + reason : " | Admin initiated refund");
        audit(admin, "ISSUE_REFUND", "ORDER", id, details);
        return saved;
    }

    public List<Map<String, Object>> subscribers() { return subscriptions.findAll().stream().map(s -> Map.<String, Object>of("subscription", s, "user", users.findById(s.getUserId()).orElse(null))).toList(); }
    @Transactional
    public Subscription cancelSubscription(Long id, String admin, boolean refund) { Subscription s = subscriptions.findById(id).orElseThrow(); s.setStatus(Subscription.Status.CANCELLED); s.setCancelledAt(LocalDateTime.now()); subscriptions.save(s); audit(admin, refund ? "REFUND_SUBSCRIPTION" : "CANCEL_SUBSCRIPTION", "SUBSCRIPTION", id.toString(), "admin action"); return s; }

    public SystemSettingDocument getSettings() {
        SystemSettingDocument doc = settings.findById("global").orElse(null);
        Map<String, Object> defaults = getDefaultSettings();
        if (doc == null) {
            doc = SystemSettingDocument.builder()
                    .id("global")
                    .values(defaults)
                    .updatedAt(Instant.now())
                    .updatedBy("System")
                    .build();
            return settings.save(doc);
        }
        if (doc.getValues() == null) {
            doc.setValues(new HashMap<>());
        }
        for (Map.Entry<String, Object> entry : defaults.entrySet()) {
            doc.getValues().putIfAbsent(entry.getKey(), entry.getValue());
        }
        return doc;
    }

    public Map<String, Object> getDefaultSettings() {
        Map<String, Object> defs = new HashMap<>();
        // Module Feature Flags
        defs.put("marketplaceEnabled", true);
        defs.put("aiStudioEnabled", true);
        defs.put("competitionsEnabled", true);
        defs.put("reviewsEnabled", true);
        defs.put("discussionsEnabled", true);
        defs.put("userRegistrationEnabled", true);
        defs.put("commentsEnabled", true);
        defs.put("maintenanceMode", false);

        // Site-Wide Announcement Banner
        defs.put("announcementEnabled", false);
        defs.put("announcementMessage", "");
        defs.put("announcementType", "info"); // info, celebration, warning, urgent
        defs.put("announcementLink", "");
        defs.put("announcementLinkText", "");
        defs.put("announcementDismissible", true);

        // Daily Featured Poem Override
        defs.put("featuredPoemOverride", false);
        defs.put("featuredPoemId", "");
        defs.put("featuredPoemTitle", "");
        defs.put("featuredPoemAuthor", "");
        defs.put("featuredPoemNote", "");
        return defs;
    }

    @Transactional
    public SystemSettingDocument updateSettings(Map<String, Object> values, String admin) {
        SystemSettingDocument current = getSettings();
        Map<String, Object> currentVals = current.getValues() != null ? current.getValues() : new HashMap<>();
        if (values != null) {
            currentVals.putAll(values);
        }
        current.setValues(currentVals);
        current.setUpdatedAt(Instant.now());
        current.setUpdatedBy(admin != null ? admin : "SystemAdmin");
        SystemSettingDocument saved = settings.save(current);
        audit(admin, "UPDATE_SETTINGS", "SETTINGS", "global", "Updated keys: " + (values != null ? values.keySet() : "none"));
        return saved;
    }

    public Map<String, Object> getCurrentFeaturedPoem() {
        SystemSettingDocument sys = getSettings();
        Map<String, Object> vals = sys.getValues() != null ? sys.getValues() : Map.of();
        boolean isOverride = Boolean.TRUE.equals(vals.get("featuredPoemOverride"));
        String overridePoemId = (String) vals.get("featuredPoemId");
        String overrideNote = (String) vals.get("featuredPoemNote");

        PoemDocument featuredDoc = null;
        if (isOverride && overridePoemId != null && !overridePoemId.isBlank()) {
            featuredDoc = poems.findById(overridePoemId).orElse(null);
        }
        if (featuredDoc == null) {
            List<PoemDocument> candidates = poems.findByPublishedTrue(PageRequest.of(0, 50)).getContent();
            for (PoemDocument p : candidates) {
                if (Boolean.TRUE.equals(p.getFeatured())) {
                    featuredDoc = p;
                    break;
                }
            }
            if (featuredDoc == null && !candidates.isEmpty()) {
                featuredDoc = candidates.get(0);
            }
        }

        Map<String, Object> res = new HashMap<>();
        res.put("isOverride", isOverride);
        res.put("overrideNote", overrideNote != null ? overrideNote : "");
        res.put("poem", featuredDoc);
        res.put("updatedAt", sys.getUpdatedAt() != null ? sys.getUpdatedAt().toString() : Instant.now().toString());
        res.put("updatedBy", sys.getUpdatedBy() != null ? sys.getUpdatedBy() : "System");
        return res;
    }

    @Transactional
    public Map<String, Object> overrideFeaturedPoem(String poemId, String note, String admin) {
        if (poemId == null || poemId.isBlank()) {
            throw new IllegalArgumentException("Poem ID must not be blank");
        }
        PoemDocument target = poems.findById(poemId)
                .orElseThrow(() -> new IllegalArgumentException("Poem not found with id: " + poemId));

        // Unset any other featured flags
        List<PoemDocument> allPublished = poems.findByPublishedTrue(PageRequest.of(0, 100)).getContent();
        for (PoemDocument p : allPublished) {
            if (Boolean.TRUE.equals(p.getFeatured()) && !p.getId().equals(poemId)) {
                p.setFeatured(false);
                poems.save(p);
            }
        }

        target.setFeatured(true);
        poems.save(target);

        SystemSettingDocument sys = getSettings();
        Map<String, Object> vals = sys.getValues() != null ? sys.getValues() : new HashMap<>();
        vals.put("featuredPoemOverride", true);
        vals.put("featuredPoemId", target.getId());
        vals.put("featuredPoemTitle", target.getTitle());
        vals.put("featuredPoemAuthor", target.getAuthor() != null ? target.getAuthor().getUsername() : "Unknown");
        vals.put("featuredPoemNote", note != null ? note : "Editor's Pick Override");
        vals.put("featuredPoemOverriddenAt", Instant.now().toString());
        sys.setValues(vals);
        sys.setUpdatedAt(Instant.now());
        sys.setUpdatedBy(admin);
        settings.save(sys);

        audit(admin, "OVERRIDE_FEATURED_POEM", "POEM", target.getId(),
                "Title: " + target.getTitle() + (note != null ? " | Reason: " + note : ""));

        return getCurrentFeaturedPoem();
    }

    @Transactional
    public Map<String, Object> clearFeaturedPoemOverride(String admin) {
        SystemSettingDocument sys = getSettings();
        Map<String, Object> vals = sys.getValues() != null ? sys.getValues() : new HashMap<>();
        vals.put("featuredPoemOverride", false);
        vals.put("featuredPoemNote", "");
        sys.setValues(vals);
        sys.setUpdatedAt(Instant.now());
        sys.setUpdatedBy(admin);
        settings.save(sys);

        // Auto select a random published poem to rotate
        List<PoemDocument> candidates = poems.findByPublishedTrue(PageRequest.of(0, 20)).getContent();
        if (!candidates.isEmpty()) {
            for (PoemDocument p : candidates) {
                if (Boolean.TRUE.equals(p.getFeatured())) {
                    p.setFeatured(false);
                    poems.save(p);
                }
            }
            PoemDocument newFeatured = candidates.get((int) (System.currentTimeMillis() % candidates.size()));
            newFeatured.setFeatured(true);
            poems.save(newFeatured);
        }

        audit(admin, "CLEAR_FEATURED_POEM_OVERRIDE", "SETTINGS", "global", "Cleared manual override. Restored automated rotation.");
        return getCurrentFeaturedPoem();
    }

    @Transactional
    public Map<String, Object> triggerFeaturedPoemSelection(String admin) {
        SystemSettingDocument sys = getSettings();
        Map<String, Object> vals = sys.getValues() != null ? sys.getValues() : new HashMap<>();
        vals.put("featuredPoemOverride", false);
        vals.put("featuredPoemNote", "");
        sys.setValues(vals);
        sys.setUpdatedAt(Instant.now());
        sys.setUpdatedBy(admin);
        settings.save(sys);

        List<PoemDocument> candidates = poems.findByPublishedTrue(PageRequest.of(0, 30)).getContent();
        if (!candidates.isEmpty()) {
            for (PoemDocument p : candidates) {
                if (Boolean.TRUE.equals(p.getFeatured())) {
                    p.setFeatured(false);
                    poems.save(p);
                }
            }
            PoemDocument selected = candidates.stream()
                    .max(Comparator.comparingDouble(p -> p.getTrendingScore() != null ? p.getTrendingScore() : 0.0))
                    .orElse(candidates.get(0));
            selected.setFeatured(true);
            poems.save(selected);
        }

        audit(admin, "TRIGGER_FEATURED_POEM_SELECTION", "SETTINGS", "global", "Manually triggered daily poem rotation algorithm.");
        return getCurrentFeaturedPoem();
    }

    @Transactional
    public SystemSettingDocument setAnnouncement(Map<String, Object> data, String admin) {
        SystemSettingDocument sys = getSettings();
        Map<String, Object> vals = sys.getValues() != null ? sys.getValues() : new HashMap<>();
        vals.put("announcementEnabled", true);
        vals.put("announcementMessage", data != null ? data.getOrDefault("message", "") : "");
        vals.put("announcementType", data != null ? data.getOrDefault("type", "info") : "info");
        vals.put("announcementLink", data != null ? data.getOrDefault("link", "") : "");
        vals.put("announcementLinkText", data != null ? data.getOrDefault("linkText", "") : "");
        vals.put("announcementDismissible", data != null ? data.getOrDefault("dismissible", true) : true);
        vals.put("announcementCreatedAt", Instant.now().toString());

        sys.setValues(vals);
        sys.setUpdatedAt(Instant.now());
        sys.setUpdatedBy(admin);
        SystemSettingDocument saved = settings.save(sys);

        audit(admin, "SET_ANNOUNCEMENT", "SETTINGS", "global",
                "Type: " + vals.get("announcementType") + " | " + vals.get("announcementMessage"));
        return saved;
    }

    @Transactional
    public SystemSettingDocument clearAnnouncement(String admin) {
        SystemSettingDocument sys = getSettings();
        Map<String, Object> vals = sys.getValues() != null ? sys.getValues() : new HashMap<>();
        vals.put("announcementEnabled", false);
        sys.setValues(vals);
        sys.setUpdatedAt(Instant.now());
        sys.setUpdatedBy(admin);
        SystemSettingDocument saved = settings.save(sys);

        audit(admin, "CLEAR_ANNOUNCEMENT", "SETTINGS", "global", "Announcement cleared and deactivated.");
        return saved;
    }
    public List<AuditLogDocument> audit(String query, String targetType, String action, String admin) {
        if (auditLogs.count() == 0) {
            seedDefaultAuditLogs();
        }
        return auditLogs.findAllByOrderByTimestampDesc().stream()
                .filter(a -> targetType == null || targetType.isBlank() || "ALL".equalsIgnoreCase(targetType) || targetType.equalsIgnoreCase(a.getTargetType()))
                .filter(a -> action == null || action.isBlank() || "ALL".equalsIgnoreCase(action) || action.equalsIgnoreCase(a.getAction()))
                .filter(a -> admin == null || admin.isBlank() || (a.getAdminUsername() != null && a.getAdminUsername().toLowerCase().contains(admin.toLowerCase())))
                .filter(a -> query == null || query.isBlank()
                        || contains(a.getAction(), query)
                        || contains(a.getTargetType(), query)
                        || contains(a.getTargetId(), query)
                        || contains(a.getAdminUsername(), query)
                        || contains(a.getDetails(), query))
                .toList();
    }

    public List<AuditLogDocument> audit(String query) {
        return audit(query, null, null, null);
    }

    public Map<String, Object> getAuditStats() {
        if (auditLogs.count() == 0) {
            seedDefaultAuditLogs();
        }
        List<AuditLogDocument> all = auditLogs.findAllByOrderByTimestampDesc();
        long total = all.size();

        Instant twentyFourHoursAgo = Instant.now().minus(Duration.ofHours(24));
        long recent24h = all.stream().filter(a -> a.getTimestamp() != null && a.getTimestamp().isAfter(twentyFourHoursAgo)).count();

        Map<String, Long> byTargetType = all.stream()
                .collect(Collectors.groupingBy(a -> a.getTargetType() != null ? a.getTargetType() : "OTHER", Collectors.counting()));

        Map<String, Long> byAction = all.stream()
                .collect(Collectors.groupingBy(a -> a.getAction() != null ? a.getAction() : "OTHER", Collectors.counting()));

        Map<String, Long> byAdmin = all.stream()
                .collect(Collectors.groupingBy(a -> a.getAdminUsername() != null ? a.getAdminUsername() : "System", Collectors.counting()));

        String topAdmin = byAdmin.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("SystemAdmin");

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", total);
        stats.put("recent24h", recent24h);
        stats.put("topAdmin", topAdmin);
        stats.put("byTargetType", byTargetType);
        stats.put("byAction", byAction);
        stats.put("byAdmin", byAdmin);
        return stats;
    }

    private void seedDefaultAuditLogs() {
        List<AuditLogDocument> seeds = List.of(
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("UPDATE_SETTINGS").targetType("SETTINGS").targetId("global").details("Configured runtime feature flags: marketplaceEnabled=true, aiStudioEnabled=true").timestamp(Instant.now().minus(Duration.ofHours(2))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("SET_ANNOUNCEMENT").targetType("SETTINGS").targetId("global").details("Type: celebration | The 2026 Annual KavyaKosh Ghazal Mushaira is officially live!").timestamp(Instant.now().minus(Duration.ofHours(4))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("OVERRIDE_FEATURED_POEM").targetType("POEM").targetId("6adb13c5841f4e6109438efe").details("Title: Inquilab Zindabad | Reason: Curated Staff Pick for Basant Utsav").timestamp(Instant.now().minus(Duration.ofHours(8))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("FINALIZE_COMPETITION").targetType("COMPETITION").targetId("1").details("Published winners for 'Monsoon Ghazal Challenge 2026' with 3 prize awards").timestamp(Instant.now().minus(Duration.ofHours(18))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("SET_SUBMISSION_WINNER").targetType("SUBMISSION").targetId("sub-84").details("Assigned Rank 1 to submission 'Baarish Aur Tanhaai'").timestamp(Instant.now().minus(Duration.ofHours(19))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("ISSUE_REFUND").targetType("ORDER").targetId("ord1").details("Amount: ₹849.00 | Reason: Duplicate customer payment verified").timestamp(Instant.now().minus(Duration.ofDays(1))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("CANCEL_SUBSCRIPTION").targetType("SUBSCRIPTION").targetId("1").details("User requested downgrade from PRO to standard free tier").timestamp(Instant.now().minus(Duration.ofDays(2))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("PROMOTE_REVIEWER").targetType("USER").targetId("5").details("Promoted @PriyaVerse to certified Literary Reviewer").timestamp(Instant.now().minus(Duration.ofDays(3))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("RESOLVE_FLAG").targetType("FLAG").targetId("flg-12").details("Verified original authorship; fair use quotation confirmed").timestamp(Instant.now().minus(Duration.ofDays(4))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("SUSPEND_USER").targetType("USER").targetId("7").details("Reason: Community guidelines breach in public debate comments").timestamp(Instant.now().minus(Duration.ofDays(5))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("SCORE_REVIEW").targetType("REVIEW").targetId("rev-401").details("Score: 4.8 | Detailed meter analysis and constructive phrasing").timestamp(Instant.now().minus(Duration.ofDays(6))).build(),
                AuditLogDocument.builder().adminUsername("SystemAdmin").action("CREATE_LISTING").targetType("MARKETPLACE").targetId("item-1").details("Published new hardcover anthology: 'Diwan-e-Ghalib Illustrated Edition'").timestamp(Instant.now().minus(Duration.ofDays(7))).build()
        );
        auditLogs.saveAll(seeds);
    }

    private void audit(String admin, String action, String type, String id, String details) {
        String safeAdmin = (admin != null && !admin.isBlank()) ? admin : "SystemAdmin";
        auditLogs.save(AuditLogDocument.builder().adminUsername(safeAdmin).action(action).targetType(type).targetId(id).details(details).timestamp(Instant.now()).build());
        try {
            jpaAuditLogs.save(AuditLog.builder().adminUsername(safeAdmin).action(action).targetType(type).targetId(id).details(details).build());
        } catch (Exception ignored) {
            // Log fallback in case JPA is unavailable or in mock test environment
        }
    }
    private boolean contains(String value, String query) { return value != null && value.toLowerCase().contains(query.toLowerCase()); }
}
