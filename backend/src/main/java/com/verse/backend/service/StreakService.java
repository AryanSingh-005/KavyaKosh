package com.verse.backend.service;

import com.verse.backend.entity.User;
import com.verse.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class StreakService {

    private final UserRepository userRepository;

    /**
     * Records writing/community activity for a user and updates their writing streak counters.
     */
    @Transactional
    public void recordWritingActivity(User user) {
        if (user == null) return;

        LocalDateTime now = LocalDateTime.now();
        LocalDate today = now.toLocalDate();

        LocalDateTime lastActivity = user.getLastWritingDate();

        if (lastActivity == null) {
            user.setCurrentStreak(1);
            user.setLongestStreak(Math.max(1, user.getLongestStreak() != null ? user.getLongestStreak() : 0));
            user.setLastWritingDate(now);
            userRepository.save(user);
            log.info("Started 1-day writing streak for user {}", user.getUsername());
            return;
        }

        LocalDate lastDate = lastActivity.toLocalDate();

        if (lastDate.isEqual(today)) {
            // Already recorded activity today
            return;
        } else if (lastDate.isEqual(today.minusDays(1))) {
            // Consecutive day activity!
            int newStreak = (user.getCurrentStreak() != null ? user.getCurrentStreak() : 0) + 1;
            user.setCurrentStreak(newStreak);
            user.setLongestStreak(Math.max(newStreak, user.getLongestStreak() != null ? user.getLongestStreak() : 0));
            user.setLastWritingDate(now);
            userRepository.save(user);
            log.info("Incremented writing streak to {} days for user {}", newStreak, user.getUsername());
        } else {
            // Streak broken, reset to 1
            user.setCurrentStreak(1);
            user.setLongestStreak(Math.max(1, user.getLongestStreak() != null ? user.getLongestStreak() : 0));
            user.setLastWritingDate(now);
            userRepository.save(user);
            log.info("Reset and started new 1-day writing streak for user {}", user.getUsername());
        }
    }

    /**
     * Daily scheduled cron job running at midnight (00:00:00) to evaluate inactive streaks.
     * Resets currentStreak to 0 for users who did not write yesterday.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void evaluateDailyStreaks() {
        log.info("Running daily writing streak evaluation cron job...");
        List<User> users = userRepository.findAll();
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDate today = LocalDate.now();

        int resetCount = 0;
        for (User user : users) {
            if (user.getCurrentStreak() != null && user.getCurrentStreak() > 0) {
                LocalDateTime lastAct = user.getLastWritingDate();
                if (lastAct == null || (lastAct.toLocalDate().isBefore(yesterday))) {
                    user.setCurrentStreak(0);
                    userRepository.save(user);
                    resetCount++;
                }
            }
        }
        log.info("Completed streak evaluation. Reset streaks for {} inactive users.", resetCount);
    }
}
