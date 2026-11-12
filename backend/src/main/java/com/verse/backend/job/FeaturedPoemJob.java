package com.verse.backend.job;

import com.verse.backend.document.PoemDocument;
import com.verse.backend.document.SystemSettingDocument;
import com.verse.backend.repository.PoemDocumentRepository;
import com.verse.backend.repository.SystemSettingRepository;
import com.verse.backend.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class FeaturedPoemJob {

    private final PoemDocumentRepository poemRepository;
    private final NotificationService notificationService;
    private final SystemSettingRepository systemSettingRepository;

    public FeaturedPoemJob(
            PoemDocumentRepository poemRepository,
            NotificationService notificationService,
            SystemSettingRepository systemSettingRepository
    ) {
        this.poemRepository = poemRepository;
        this.notificationService = notificationService;
        this.systemSettingRepository = systemSettingRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onStartup() {
        log.info("Checking for Poem of the Day on application startup...");
        selectDailyFeaturedPoem();
    }

    /**
     * Daily midnight cron job to select and highlight the Poem of the Day.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void selectDailyFeaturedPoem() {
        log.info("Executing Daily Featured Poem selection job...");

        SystemSettingDocument settings = systemSettingRepository.findById("global").orElse(null);
        if (settings != null && settings.getValues() != null && Boolean.TRUE.equals(settings.getValues().get("featuredPoemOverride"))) {
            log.info("Featured poem manual override is active (ID: {}); skipping automated cron selection.",
                    settings.getValues().get("featuredPoemId"));
            return;
        }

        List<PoemDocument> poems = poemRepository.findByAuthorUsername("KavyaKoshEditorial");
        if (poems == null || poems.isEmpty()) {
            poems = poemRepository.findTop10ByPublishedTrue();
        }

        if (poems == null || poems.isEmpty()) {
            log.info("No published poems found for daily featured selection.");
            return;
        }

        // Unset existing featured flags
        for (PoemDocument p : poems) {
            if (Boolean.TRUE.equals(p.getFeatured())) {
                p.setFeatured(false);
                poemRepository.save(p);
            }
        }

        // Pick top engagement poem
        PoemDocument selected = poems.get((int) (System.currentTimeMillis() % poems.size()));
        selected.setFeatured(true);
        poemRepository.save(selected);

        log.info("Selected Daily Featured Poem: '{}' (ID: {}) by @{}", selected.getTitle(), selected.getId(), selected.getAuthor().getUsername());

        // Send notification to author
        if (selected.getAuthor() != null && selected.getAuthor().getUsername() != null) {
            notificationService.sendNotification(
                    selected.getAuthor().getUsername(),
                    "SYSTEM",
                    "FEATURED_POEM",
                    "🌟 Poem of the Day Selection!",
                    String.format("Congratulations! Your poem '%s' has been selected as the Poem of the Day on KavyaKosh.", selected.getTitle()),
                    "/poems/" + selected.getId()
            );
        }
    }
}
