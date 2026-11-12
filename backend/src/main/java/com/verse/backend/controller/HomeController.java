package com.verse.backend.controller;
 
import com.verse.backend.document.PoemDocument;
import com.verse.backend.dto.ChallengeDto;
import com.verse.backend.dto.MarketplaceItemDto;
import com.verse.backend.dto.PoemDto;
import com.verse.backend.dto.WriterDto;
import com.verse.backend.service.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/home")
public class HomeController {

    private final HomeService homeService;

    public HomeController(HomeService homeService) {
        this.homeService = homeService;
    }

    @GetMapping("/trending-poems")
    public ResponseEntity<List<PoemDto>> getTrendingPoems(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(homeService.getTrendingPoems(limit));
    }

    @GetMapping("/featured-writers")
    public ResponseEntity<List<WriterDto>> getFeaturedWriters(
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(homeService.getFeaturedWriters(limit));
    }

    @GetMapping("/active-challenges")
    public ResponseEntity<List<ChallengeDto>> getActiveChallenges() {
        return ResponseEntity.ok(homeService.getActiveChallenges());
    }

    @GetMapping("/marketplace-previews")
    public ResponseEntity<List<MarketplaceItemDto>> getMarketplacePreviews(
            @RequestParam(defaultValue = "4") int limit) {
        return ResponseEntity.ok(homeService.getMarketplacePreviews(limit));
    }

    @GetMapping("/announcement")
    public ResponseEntity<Map<String, Object>> getAnnouncement() {
        return ResponseEntity.ok(homeService.getPublicAnnouncement());
    }

    @GetMapping("/feature-flags")
    public ResponseEntity<Map<String, Object>> getFeatureFlags() {
        return ResponseEntity.ok(homeService.getPublicFeatureFlags());
    }

    @GetMapping("/featured-poem")
    public ResponseEntity<PoemDocument> getFeaturedPoem() {
        return ResponseEntity.ok(homeService.getDailyFeaturedPoem());
    }
}
