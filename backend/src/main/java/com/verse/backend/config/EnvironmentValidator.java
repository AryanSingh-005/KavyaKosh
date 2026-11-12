package com.verse.backend.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Fails fast on application startup if required environment variables are missing.
 */
@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class EnvironmentValidator {

    private final Environment env;

    @PostConstruct
    public void validateRequiredProperties() {
        List<String> missing = new ArrayList<>();

        checkRequired("MYSQL_URL", "spring.datasource.url", missing);
        checkRequired("MONGODB_URI", "spring.data.mongodb.uri", missing);
        checkRequired("AI_API_KEY", "ai.api-key", missing);
        checkRequired("JWT_SECRET", "jwt.secret", missing);

        if (!missing.isEmpty()) {
            String banner = "\n" +
                "################################################################################\n" +
                "#              APPLICATION STARTUP FAILED: MISSING REQUIRED CREDENTIALS        #\n" +
                "################################################################################\n" +
                "# The following mandatory environment variable(s) are missing or empty:       #\n" +
                String.join("\n", missing.stream().map(v -> String.format("#   [MISSING] %-70s #", v)).toList()) + "\n" +
                "#                                                                              #\n" +
                "# RESOLUTION:                                                                  #\n" +
                "# 1. Copy .env.example to .env in your project root or backend folder:         #\n" +
                "#    cp .env.example .env                                                      #\n" +
                "# 2. Populate the required values:                                             #\n" +
                "#    MYSQL_URL, MONGODB_URI, AI_API_KEY, JWT_SECRET                            #\n" +
                "# 3. Never commit real credentials to Git!                                     #\n" +
                "################################################################################\n";
            log.error(banner);
            throw new IllegalStateException("Startup aborted: Missing required environment variable(s): " + String.join(", ", missing));
        }
        log.info("Startup validation passed: all required environment variables are present.");
    }

    private void checkRequired(String envKey, String propertyKey, List<String> missing) {
        String val = env.getProperty(envKey);
        if (val == null || val.isBlank()) {
            val = env.getProperty(propertyKey);
        }
        if (val == null || val.isBlank() || (val.startsWith("${") && val.endsWith("}"))) {
            missing.add(envKey + " (or " + propertyKey + ")");
        }
    }
}
