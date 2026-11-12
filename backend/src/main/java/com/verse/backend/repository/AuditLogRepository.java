package com.verse.backend.repository;

import com.verse.backend.document.AuditLogDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLogDocument, String> {

    List<AuditLogDocument> findAllByOrderByTimestampDesc();

    List<AuditLogDocument> findByTargetTypeOrderByTimestampDesc(String targetType);

    List<AuditLogDocument> findByAdminUsernameOrderByTimestampDesc(String adminUsername);
}
