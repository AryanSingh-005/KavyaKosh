package com.verse.backend.controller;

import com.verse.backend.dto.ExplorePoemDto;
import com.verse.backend.service.ExploreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/explore")
@RequiredArgsConstructor
public class ExploreController {

    private final ExploreService exploreService;

    /**
     * GET /api/explore/poems
     * Query params:
     *   search   - optional full-text search string
     *   mood     - optional mood filter
     *   theme    - optional theme filter
     *   language - optional language filter
     *   category - optional category filter
     *   sortBy   - "trending" | "newest" | "popular" | "discussed"  (default: trending)
     *   page     - zero-based page number (default: 0)
     *   size     - page size (default: 12, max: 20)
     *
     * Response body includes Spring Page metadata so the client can implement infinite scroll.
     */
    @GetMapping("/poems")
    public ResponseEntity<Page<ExplorePoemDto>> explorePoems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String mood,
            @RequestParam(required = false) String theme,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "trending") String sortBy,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        Page<ExplorePoemDto> result = exploreService.explore(
                search, mood, theme, language, category, sortBy, page, size
        );
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/explore/filters
     * Returns distinct filter option values for the frontend filter dropdowns.
     */
    @GetMapping("/filters")
    public ResponseEntity<Map<String, List<String>>> getFilterOptions() {
        return ResponseEntity.ok(Map.of(
            "moods",      exploreService.getDistinctMoods(),
            "themes",     exploreService.getDistinctThemes(),
            "languages",  exploreService.getDistinctLanguages(),
            "categories", exploreService.getDistinctCategories()
        ));
    }
}
