package com.verse.backend.controller;

import com.verse.backend.document.AiGenerationHistory;
import com.verse.backend.dto.AiGenerationResponse;
import com.verse.backend.dto.GeneratePoemRequest;
import com.verse.backend.dto.RewritePoemRequest;
import com.verse.backend.service.AiStudioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiStudioController {

    private final AiStudioService aiStudioService;

    @PostMapping("/generate")
    public ResponseEntity<AiGenerationResponse> generatePoem(
            @Valid @RequestBody GeneratePoemRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        AiGenerationResponse response = aiStudioService.generatePoem(request, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rewrite")
    public ResponseEntity<AiGenerationResponse> rewritePoem(
            @Valid @RequestBody RewritePoemRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        AiGenerationResponse response = aiStudioService.rewritePoem(request, username);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<AiGenerationHistory>> getRecentHistory(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        List<AiGenerationHistory> history = aiStudioService.getRecentUserHistory(username);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/page")
    public ResponseEntity<Page<AiGenerationHistory>> getPaginatedHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        Page<AiGenerationHistory> historyPage = aiStudioService.getUserHistory(username, PageRequest.of(page, size));
        return ResponseEntity.ok(historyPage);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> deleteHistoryEntry(
            @PathVariable String id,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "anonymous";
        aiStudioService.deleteHistoryEntry(id, username);
        return ResponseEntity.noContent().build();
    }
}
