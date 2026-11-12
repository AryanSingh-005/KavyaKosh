package com.verse.backend.service;

import com.verse.backend.document.PoemDocument;
import com.verse.backend.document.SystemSettingDocument;
import com.verse.backend.dto.ChallengeDto;
import com.verse.backend.dto.MarketplaceItemDto;
import com.verse.backend.dto.PoemDto;
import com.verse.backend.dto.WriterDto;
import com.verse.backend.entity.Challenge;
import com.verse.backend.entity.MarketplaceItem;
import com.verse.backend.entity.Poem;
import com.verse.backend.entity.User;
import com.verse.backend.repository.ChallengeRepository;
import com.verse.backend.repository.MarketplaceItemRepository;
import com.verse.backend.repository.PoemDocumentRepository;
import com.verse.backend.repository.PoemRepository;
import com.verse.backend.repository.SystemSettingRepository;
import com.verse.backend.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HomeService {

    private final PoemRepository poemRepository;
    private final UserRepository userRepository;
    private final ChallengeRepository challengeRepository;
    private final MarketplaceItemRepository marketplaceItemRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final PoemDocumentRepository poemDocumentRepository;

    public HomeService(
            PoemRepository poemRepository,
            UserRepository userRepository,
            ChallengeRepository challengeRepository,
            MarketplaceItemRepository marketplaceItemRepository,
            SystemSettingRepository systemSettingRepository,
            PoemDocumentRepository poemDocumentRepository
    ) {
        this.poemRepository = poemRepository;
        this.userRepository = userRepository;
        this.challengeRepository = challengeRepository;
        this.marketplaceItemRepository = marketplaceItemRepository;
        this.systemSettingRepository = systemSettingRepository;
        this.poemDocumentRepository = poemDocumentRepository;
    }

    public List<PoemDto> getTrendingPoems(int limit) {
        return poemRepository.findTopTrending(PageRequest.of(0, limit))
                .stream()
                .map(this::toPoemDto)
                .collect(Collectors.toList());
    }

    public List<WriterDto> getFeaturedWriters(int limit) {
        return userRepository.findByFeaturedWriterTrueOrderByFollowerCountDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::toWriterDto)
                .collect(Collectors.toList());
    }

    public List<ChallengeDto> getActiveChallenges() {
        return challengeRepository.findByStatusOrderByDeadlineAsc(Challenge.Status.ACTIVE)
                .stream()
                .map(this::toChallengeDto)
                .collect(Collectors.toList());
    }

    public List<MarketplaceItemDto> getMarketplacePreviews(int limit) {
        return marketplaceItemRepository.findByFeaturedTrueOrderByReviewCountDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::toMarketplaceItemDto)
                .collect(Collectors.toList());
    }

    public Map<String, Object> getPublicAnnouncement() {
        SystemSettingDocument doc = systemSettingRepository.findById("global").orElse(null);
        if (doc != null && doc.getValues() != null && Boolean.TRUE.equals(doc.getValues().get("announcementEnabled"))) {
            Map<String, Object> ann = new HashMap<>();
            ann.put("enabled", true);
            ann.put("message", doc.getValues().getOrDefault("announcementMessage", ""));
            ann.put("type", doc.getValues().getOrDefault("announcementType", "info"));
            ann.put("link", doc.getValues().getOrDefault("announcementLink", ""));
            ann.put("linkText", doc.getValues().getOrDefault("announcementLinkText", ""));
            ann.put("dismissible", doc.getValues().getOrDefault("announcementDismissible", true));
            return ann;
        }
        return Map.of("enabled", false);
    }

    public Map<String, Object> getPublicFeatureFlags() {
        SystemSettingDocument doc = systemSettingRepository.findById("global").orElse(null);
        Map<String, Object> flags = new HashMap<>();
        if (doc != null && doc.getValues() != null) {
            Map<String, Object> vals = doc.getValues();
            flags.put("marketplaceEnabled", vals.getOrDefault("marketplaceEnabled", true));
            flags.put("aiStudioEnabled", vals.getOrDefault("aiStudioEnabled", true));
            flags.put("competitionsEnabled", vals.getOrDefault("competitionsEnabled", true));
            flags.put("reviewsEnabled", vals.getOrDefault("reviewsEnabled", true));
            flags.put("discussionsEnabled", vals.getOrDefault("discussionsEnabled", true));
            flags.put("userRegistrationEnabled", vals.getOrDefault("userRegistrationEnabled", true));
            flags.put("commentsEnabled", vals.getOrDefault("commentsEnabled", true));
            flags.put("maintenanceMode", vals.getOrDefault("maintenanceMode", false));
        } else {
            flags.put("marketplaceEnabled", true);
            flags.put("aiStudioEnabled", true);
            flags.put("competitionsEnabled", true);
            flags.put("reviewsEnabled", true);
            flags.put("discussionsEnabled", true);
            flags.put("userRegistrationEnabled", true);
            flags.put("commentsEnabled", true);
            flags.put("maintenanceMode", false);
        }
        return flags;
    }

    public PoemDocument getDailyFeaturedPoem() {
        SystemSettingDocument doc = systemSettingRepository.findById("global").orElse(null);
        if (doc != null && doc.getValues() != null && Boolean.TRUE.equals(doc.getValues().get("featuredPoemOverride"))) {
            String overrideId = (String) doc.getValues().get("featuredPoemId");
            if (overrideId != null && !overrideId.isBlank()) {
                PoemDocument p = poemDocumentRepository.findById(overrideId).orElse(null);
                if (p != null) return p;
            }
        }
        List<PoemDocument> candidates = poemDocumentRepository.findByPublishedTrue(PageRequest.of(0, 50)).getContent();
        for (PoemDocument p : candidates) {
            if (Boolean.TRUE.equals(p.getFeatured())) {
                return p;
            }
        }
        return candidates.isEmpty() ? null : candidates.get(0);
    }

    // --- Mappers ---

    private PoemDto toPoemDto(Poem poem) {
        return PoemDto.builder()
                .id(poem.getId())
                .title(poem.getTitle())
                .excerpt(poem.getExcerpt())
                .category(poem.getCategory())
                .likesCount(poem.getLikesCount())
                .viewsCount(poem.getViewsCount())
                .commentsCount(poem.getCommentsCount())
                .createdAt(poem.getCreatedAt())
                .author(toWriterDto(poem.getAuthor()))
                .build();
    }

    private WriterDto toWriterDto(User user) {
        long poemCount = poemRepository.findAll().stream()
                .filter(p -> p.getAuthor().getId().equals(user.getId()))
                .count();
        return WriterDto.builder()
                .id(user.getId())
                .username(user.getUsername() != null ? user.getUsername() : user.getEmail().split("@")[0])
                .bio(user.getBio())
                .avatarUrl(user.getAvatarUrl())
                .followerCount(user.getFollowerCount())
                .poemCount((int) poemCount)
                .build();
    }

    private ChallengeDto toChallengeDto(Challenge challenge) {
        return ChallengeDto.builder()
                .id(challenge.getId())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .theme(challenge.getTheme())
                .participantCount(challenge.getParticipantCount())
                .deadline(challenge.getDeadline())
                .status(challenge.getStatus().name())
                .prizeDescription(challenge.getPrizeDescription())
                .build();
    }

    private MarketplaceItemDto toMarketplaceItemDto(MarketplaceItem item) {
        return MarketplaceItemDto.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .imageUrl(item.getImageUrl())
                .author(item.getAuthor())
                .type(item.getType())
                .rating(item.getRating())
                .reviewCount(item.getReviewCount())
                .build();
    }
}
