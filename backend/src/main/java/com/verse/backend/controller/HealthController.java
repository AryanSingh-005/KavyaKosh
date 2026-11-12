package com.verse.backend.controller;

import com.verse.backend.ai.LlmProvider;
import com.verse.backend.config.AiProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@RequiredArgsConstructor
@Slf4j
public class HealthController {

    private final DataSource dataSource;
    private final MongoTemplate mongoTemplate;
    private final LlmProvider llmProvider;
    private final AiProperties aiProperties;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health(
            @RequestParam(required = false, defaultValue = "false") boolean testAi
    ) {
        Map<String, Object> response = new LinkedHashMap<>();
        Map<String, Object> components = new LinkedHashMap<>();
        boolean allHealthy = true;

        // 1. MySQL Connectivity Check
        long sqlStart = System.currentTimeMillis();
        Map<String, Object> mysqlHealth = new LinkedHashMap<>();
        try (Connection connection = dataSource.getConnection()) {
            boolean valid = connection.isValid(3);
            long latency = System.currentTimeMillis() - sqlStart;
            mysqlHealth.put("status", valid ? "UP" : "DOWN");
            mysqlHealth.put("database", connection.getCatalog());
            mysqlHealth.put("latencyMs", latency);
            mysqlHealth.put("message", valid ? "MySQL connection pool healthy" : "Connection validation failed");
            if (!valid) allHealthy = false;
        } catch (Exception e) {
            log.error("MySQL health check failed: {}", e.getMessage());
            mysqlHealth.put("status", "DOWN");
            mysqlHealth.put("error", e.getMessage());
            allHealthy = false;
        }
        components.put("mysql", mysqlHealth);

        // 2. MongoDB Connectivity Check
        long mongoStart = System.currentTimeMillis();
        Map<String, Object> mongoHealth = new LinkedHashMap<>();
        try {
            Document pingResult = mongoTemplate.getDb().runCommand(new Document("ping", 1));
            long latency = System.currentTimeMillis() - mongoStart;
            boolean ok = pingResult != null && pingResult.getDouble("ok") == 1.0;
            mongoHealth.put("status", ok ? "UP" : "DOWN");
            mongoHealth.put("database", mongoTemplate.getDb().getName());
            mongoHealth.put("latencyMs", latency);
            mongoHealth.put("message", ok ? "MongoDB ping response ok" : "Ping command returned non-ok");
            if (!ok) allHealthy = false;
        } catch (Exception e) {
            log.error("MongoDB health check failed: {}", e.getMessage());
            mongoHealth.put("status", "DOWN");
            mongoHealth.put("error", e.getMessage());
            allHealthy = false;
        }
        components.put("mongodb", mongoHealth);

        // 3. AI Provider Connectivity Check
        long aiStart = System.currentTimeMillis();
        Map<String, Object> aiHealth = new LinkedHashMap<>();
        try {
            String providerName = llmProvider.getProviderName();
            aiHealth.put("provider", providerName);
            aiHealth.put("configuredModel", aiProperties.getModel());
            aiHealth.put("baseUrl", aiProperties.getBaseUrl());
            aiHealth.put("apiKeyConfigured", aiProperties.getApiKey() != null && !aiProperties.getApiKey().isBlank());

            // If testAi parameter is true or if checking mock provider, test generation
            if (testAi || "mock".equalsIgnoreCase(aiProperties.getProvider())) {
                String pingReply = llmProvider.generate("You are a system health probe. Respond with: PONG", "PING");
                aiHealth.put("status", "UP");
                aiHealth.put("testCallResponse", pingReply != null && pingReply.length() > 50 ? pingReply.substring(0, 50) + "..." : pingReply);
            } else {
                aiHealth.put("status", "UP");
                aiHealth.put("message", "AI provider bean initialized (set ?testAi=true to run live completion check)");
            }
            aiHealth.put("latencyMs", System.currentTimeMillis() - aiStart);
        } catch (Exception e) {
            log.error("AI provider health check failed: {}", e.getMessage());
            aiHealth.put("status", "DEGRADED");
            aiHealth.put("error", e.getMessage());
            // Do not fail the whole API for AI rate limit or downtime, but report status
        }
        components.put("ai", aiHealth);

        // Summary
        response.put("status", allHealthy ? "UP" : "DOWN");
        response.put("timestamp", Instant.now().toString());
        response.put("components", components);

        return allHealthy 
                ? ResponseEntity.ok(response) 
                : ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}
