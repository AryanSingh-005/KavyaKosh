package com.verse.backend.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Automatically loads .env properties into Spring's Environment at the highest precedence,
 * ensuring all tests (@SpringBootTest), dev runs, and CLI invocations resolve variables.
 */
@Order(Ordered.HIGHEST_PRECEDENCE)
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> props = loadDotenvProperties();
        if (!props.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", props));
            props.forEach((k, v) -> {
                // .env overrides stale System properties but not real OS env vars
                if (System.getenv(k) == null) {
                    System.setProperty(k, String.valueOf(v));
                }
            });
        }
    }

    public static Map<String, Object> loadDotenvProperties() {
        Map<String, Object> map = new HashMap<>();
        // Order matters: first match wins. When running via `mvn spring-boot:run`
        // the working directory is the `backend/` folder, so ".env" resolves there.
        List<File> candidates = List.of(
                new File(System.getProperty("user.dir"), ".env"),
                new File(".env"),
                new File("../.env"),
                new File(System.getProperty("user.dir"), "../.env")
        );

        for (File candidate : candidates) {
            if (candidate.exists() && candidate.isFile()) {
                parseFile(candidate, map);
                break;
            }
        }
        return map;
    }

    private static void parseFile(File file, Map<String, Object> map) {
        try (BufferedReader reader = new BufferedReader(new FileReader(file))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;
                int eq = line.indexOf('=');
                if (eq > 0) {
                    String key = line.substring(0, eq).trim();
                    String val = line.substring(eq + 1).trim();
                    if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                        val = val.substring(1, val.length() - 1);
                    }
                    map.put(key, val);
                }
            }
        } catch (IOException e) {
            // Ignore
        }
    }
}
