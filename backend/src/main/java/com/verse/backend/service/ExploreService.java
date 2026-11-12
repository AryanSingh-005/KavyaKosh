package com.verse.backend.service;

import com.verse.backend.document.PoemDocument;
import com.verse.backend.dto.ExplorePoemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExploreService {

    private final MongoTemplate mongoTemplate;

    /**
     * Paginated, filtered explore query.
     *
     * @param search   Full-text search string (optional)
     * @param mood     Filter by mood field (optional)
     * @param theme    Filter by theme field (optional)
     * @param language Filter by language field (optional)
     * @param category Filter by category field (optional)
     * @param sortBy   "trending" | "newest" | "popular" | "discussed"
     * @param page     Zero-based page number
     * @param size     Page size (max 20)
     */
    public Page<ExplorePoemDto> explore(
            String search,
            String mood,
            String theme,
            String language,
            String category,
            String sortBy,
            int page,
            int size
    ) {
        int safeSize = Math.min(size, 20);
        Pageable pageable = PageRequest.of(page, safeSize, buildSort(sortBy));

        // Build criteria list
        List<Criteria> criteria = new ArrayList<>();
        criteria.add(Criteria.where("published").is(true));

        // Full-text search across title + excerpt + content + tags
        if (StringUtils.hasText(search)) {
            String escaped = search.trim().replaceAll("[^\\p{L}\\p{N}\\s]", "");
            if (!escaped.isBlank()) {
                criteria.add(new Criteria().orOperator(
                    Criteria.where("title").regex(escaped, "i"),
                    Criteria.where("excerpt").regex(escaped, "i"),
                    Criteria.where("content").regex(escaped, "i"),
                    Criteria.where("tags").regex(escaped, "i")
                ));
            }
        }

        if (StringUtils.hasText(mood))     criteria.add(Criteria.where("mood").is(mood));
        if (StringUtils.hasText(theme))    criteria.add(Criteria.where("theme").is(theme));
        if (StringUtils.hasText(language)) criteria.add(Criteria.where("language").is(language));
        if (StringUtils.hasText(category)) criteria.add(Criteria.where("category").is(category));

        Query query = new Query(new Criteria().andOperator(criteria.toArray(new Criteria[0])));

        long total = mongoTemplate.count(query, PoemDocument.class);

        query.with(pageable);
        List<PoemDocument> docs = mongoTemplate.find(query, PoemDocument.class);

        List<ExplorePoemDto> dtos = docs.stream().map(this::toDto).toList();

        return new PageImpl<>(dtos, pageable, total);
    }

    // ---- Filter options (distinct values) for frontend dropdowns ----

    public List<String> getDistinctMoods() {
        return mongoTemplate.findDistinct("mood", PoemDocument.class, String.class);
    }

    public List<String> getDistinctThemes() {
        return mongoTemplate.findDistinct("theme", PoemDocument.class, String.class);
    }

    public List<String> getDistinctLanguages() {
        return mongoTemplate.findDistinct("language", PoemDocument.class, String.class);
    }

    public List<String> getDistinctCategories() {
        return mongoTemplate.findDistinct("category", PoemDocument.class, String.class);
    }

    // ---- Helpers ----

    private Sort buildSort(String sortBy) {
        if (sortBy == null) sortBy = "trending";
        return switch (sortBy) {
            case "newest"    -> Sort.by(Sort.Direction.DESC, "createdAt");
            case "popular"   -> Sort.by(Sort.Direction.DESC, "likesCount");
            case "discussed" -> Sort.by(Sort.Direction.DESC, "commentsCount");
            default          -> Sort.by(Sort.Direction.DESC, "trendingScore");
        };
    }

    private ExplorePoemDto toDto(PoemDocument doc) {
        ExplorePoemDto.AuthorDto authorDto = null;
        if (doc.getAuthor() != null) {
            authorDto = ExplorePoemDto.AuthorDto.builder()
                    .userId(doc.getAuthor().getUserId())
                    .username(doc.getAuthor().getUsername())
                    .avatarUrl(doc.getAuthor().getAvatarUrl())
                    .build();
        }
        return ExplorePoemDto.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .excerpt(doc.getExcerpt())
                .category(doc.getCategory())
                .mood(doc.getMood())
                .theme(doc.getTheme())
                .language(doc.getLanguage())
                .tags(doc.getTags())
                .author(authorDto)
                .likesCount(doc.getLikesCount())
                .viewsCount(doc.getViewsCount())
                .commentsCount(doc.getCommentsCount())
                .trendingScore(doc.getTrendingScore())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
