package com.verse.backend.repository;

import com.verse.backend.document.SystemSettingDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SystemSettingRepository extends MongoRepository<SystemSettingDocument, String> {
}
