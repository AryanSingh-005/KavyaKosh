package com.verse.backend.service;

import com.verse.backend.document.NotificationDocument;
import com.verse.backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationDocument sendNotification(String recipientUsername, String actorUsername, String type, String title, String message, String linkUrl) {
        if (recipientUsername == null || recipientUsername.isBlank()) {
            return null;
        }

        // Avoid self-notification (e.g. user liking their own poem)
        if (actorUsername != null && actorUsername.equalsIgnoreCase(recipientUsername) && !"SYSTEM".equalsIgnoreCase(actorUsername)) {
            return null;
        }

        NotificationDocument notification = NotificationDocument.builder()
                .recipientUsername(recipientUsername)
                .actorUsername(actorUsername != null ? actorUsername : "SYSTEM")
                .type(type != null ? type : "INFO")
                .title(title)
                .message(message)
                .linkUrl(linkUrl != null ? linkUrl : "/explore")
                .isRead(false)
                .createdAt(Instant.now())
                .build();

        NotificationDocument saved = notificationRepository.save(notification);
        log.info("Dispatched notification [{}] to user {}", type, recipientUsername);
        return saved;
    }

    public List<NotificationDocument> getUserNotifications(String recipientUsername) {
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(recipientUsername);
    }

    public long getUnreadCount(String recipientUsername) {
        return notificationRepository.countByRecipientUsernameAndIsReadFalse(recipientUsername);
    }

    public void markAsRead(String notificationId, String username) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getRecipientUsername().equalsIgnoreCase(username)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    public void markAllAsRead(String recipientUsername) {
        List<NotificationDocument> unread = notificationRepository.findByRecipientUsernameAndIsReadFalse(recipientUsername);
        for (NotificationDocument n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
        log.info("Marked all notifications as read for user {}", recipientUsername);
    }
}
