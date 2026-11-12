package com.verse.backend.config;

import lombok.extern.slf4j.Slf4j;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.List;

/**
 * Utility to load variables from local .env files into JVM System properties
 * if they are not already set in the operating system environment.
 */
@Slf4j
public class DotenvLoader {

    public static void load() {
        // Candidate locations for .env file
        List<File> candidates = List.of(
                new File(System.getProperty("user.dir"), ".env"),
                new File(".env"),
                new File("../.env"),
                new File(System.getProperty("user.dir"), "../.env")
        );

        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                log.info("Loading environment variables from: {}", candidate.getAbsolutePath());
                loadFromFile(candidate);
                return;
            }
        }
        log.info("No local .env file found; relying on system environment variables.");
    }

    private static void loadFromFile(File file) {
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                // Skip empty lines and comments
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    String key = line.substring(0, eqIdx).trim();
                    String val = line.substring(eqIdx + 1).trim();
                    // Strip optional surrounding double or single quotes
                    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.substring(1, val.length() - 1);
                    }
                    // .env file always takes precedence over stale system properties
                    // (but NOT over real OS environment variables set externally)
                    if (System.getenv(key) == null) {
                        System.setProperty(key, val);
                    }
                }
            }
        } catch (IOException e) {
            log.warn("Failed to parse .env file at {}: {}", file.getAbsolutePath(), e.getMessage());
        }
    }
}
