package com.verse.backend.repository;

import com.verse.backend.document.NotificationDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<NotificationDocument, String> {

    List<NotificationDocument> findByRecipientUsernameOrderByCreatedAtDesc(String recipientUsername);

    long countByRecipientUsernameAndIsReadFalse(String recipientUsername);

    List<NotificationDocument> findByRecipientUsernameAndIsReadFalse(String recipientUsername);
}
