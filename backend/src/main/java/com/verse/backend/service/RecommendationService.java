package com.verse.backend.service;

import com.verse.backend.document.PoemDocument;
import com.verse.backend.document.PoemInteractionDocument;
import com.verse.backend.repository.PoemDocumentRepository;
import com.verse.backend.repository.PoemInteractionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final PoemDocumentRepository poemRepository;
    private final PoemInteractionRepository interactionRepository;

    public List<PoemDocument> getPersonalizedRecommendations(String username) {
        List<PoemDocument> allPoems = poemRepository.findTop10ByPublishedTrue();
        if (allPoems == null || allPoems.isEmpty()) {
            return List.of();
        }

        if (username == null || username.isBlank() || "anonymous".equalsIgnoreCase(username)) {
            // Unauthenticated baseline: return top engagement poems
            return allPoems.stream()
                    .sorted((p1, p2) -> Integer.compare(p2.getLikesCount() != null ? p2.getLikesCount() : 0, p1.getLikesCount() != null ? p1.getLikesCount() : 0))
                    .limit(6)
                    .collect(Collectors.toList());
        }

        // Fetch user interactions to find favorite moods and themes
        List<PoemInteractionDocument> interactions = interactionRepository.findByUsername(username);
        if (interactions == null || interactions.isEmpty()) {
            return allPoems.stream().limit(6).collect(Collectors.toList());
        }

        Set<String> likedPoemIds = interactions.stream()
                .filter(PoemInteractionDocument::isLiked)
                .map(PoemInteractionDocument::getPoemId)
                .collect(Collectors.toSet());

        // Count frequency of moods in liked poems
        Map<String, Integer> moodCounts = new HashMap<>();
        for (PoemDocument p : allPoems) {
            if (likedPoemIds.contains(p.getId()) && p.getMood() != null) {
                moodCounts.put(p.getMood(), moodCounts.getOrDefault(p.getMood(), 0) + 1);
            }
        }

        String topMood = moodCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("ROMANTIC");

        // Score poems matching top mood and exclude already liked poems
        List<PoemDocument> recommendations = allPoems.stream()
                .filter(p -> !likedPoemIds.contains(p.getId()))
                .sorted((p1, p2) -> {
                    int score1 = (topMood.equalsIgnoreCase(p1.getMood()) ? 10 : 0) + (p1.getLikesCount() != null ? p1.getLikesCount() : 0);
                    int score2 = (topMood.equalsIgnoreCase(p2.getMood()) ? 10 : 0) + (p2.getLikesCount() != null ? p2.getLikesCount() : 0);
                    return Integer.compare(score2, score1);
                })
                .limit(6)
                .collect(Collectors.toList());

        if (recommendations.isEmpty()) {
            return allPoems.stream().limit(6).collect(Collectors.toList());
        }

        return recommendations;
    }
}
